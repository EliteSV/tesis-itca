import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import {
  SOCIAL_SERVICE_SYSTEM_PROMPT,
  SOCIAL_SERVICE_USER_PROMPT,
  SOCIAL_SERVICE_REFERENCE_LABEL,
  SOCIAL_SERVICE_STAMP_QUESTION,
  SOCIAL_SERVICE_VERIFICATION_INSTRUCTIONS,
  SOCIAL_SERVICE_EXTRACTION_SYSTEM_PROMPT,
  SOCIAL_SERVICE_EXTRACTION_USER_PROMPT,
  PASSED_SUBJECTS_SYSTEM_PROMPT,
  PASSED_SUBJECTS_USER_PROMPT,
  PASSED_SUBJECTS_REFERENCE_LABEL,
  PASSED_SUBJECTS_EXTRACTION_INSTRUCTIONS,
  ENROLLMENT_PROOF_SYSTEM_PROMPT,
  ENROLLMENT_PROOF_USER_PROMPT,
  ENROLLMENT_PROOF_EXTRACTION_INSTRUCTIONS,
} from './openai-validator-prompts';

const execAsync = promisify(exec);

/**
 * Extrae texto de un PDF usando pdftotext (poppler). Determinista y sin DOM.
 * Devuelve string vacío si el PDF es solo imagen o falla la extracción.
 */
async function extractTextFromPdf(documentPath: string): Promise<string> {
  try {
    const { stdout } = await execAsync(
      `pdftotext -layout ${JSON.stringify(documentPath)} -`,
      {
        maxBuffer: 2 * 1024 * 1024,
      },
    );
    return (stdout ?? '').trim();
  } catch {
    return '';
  }
}

/**
 * Parsea nombre y carnet del texto de una constancia de servicio social (ITCA).
 * Usa solo el texto extraído del PDF; sin alucinaciones.
 */
function parseSocialServiceNameAndCarnetFromText(
  pdfText: string,
): SocialServiceExtractionResult {
  const normalized = pdfText.replace(/\s+/g, ' ').trim();
  let documentStudentName: string | null = null;
  let documentIdentificationNumber: string | null = null;

  const nameMatch = normalized.match(
    /(?:HACE\s+CONSTAR\s+QUE|QUE)\s*:\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s]+?)\s+(?:con\s+número|TECNICO\s+EN)/i,
  );
  if (nameMatch?.[1]) {
    documentStudentName = nameMatch[1].trim();
  }

  const carnetMatch = normalized.match(
    /(?:número\s+de\s+)?carnet\s+(\d+|[A-Za-z0-9-]+)/i,
  );
  if (carnetMatch?.[1]) {
    documentIdentificationNumber = carnetMatch[1].trim();
  }

  return { documentStudentName, documentIdentificationNumber };
}

function parsePassedSubjectsNameAndCarnetFromText(
  pdfText: string,
): SocialServiceExtractionResult {
  const normalized = pdfText.replace(/\s+/g, ' ').trim();
  let documentStudentName: string | null = null;
  let documentIdentificationNumber: string | null = null;
  const match = normalized.match(
    /Estudiante:\s*([A-Za-z0-9-]+)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]+?)\s+Estado\s+estudiante/i,
  );
  if (match?.[1] && match?.[2]) {
    documentIdentificationNumber = match[1].trim();
    documentStudentName = match[2].trim();
  }
  return { documentStudentName, documentIdentificationNumber };
}

const CICLO_NORMALIZE: Record<string, string> = {
  CICLOI: 'CICLO I',
  CICLO: 'CICLO I',
  'CICLO H': 'CICLO II',
  'CICLO IH': 'CICLO III',
  'CICLO IN': 'CICLO IV',
  'CICLO VIH': 'CICLO VIII',
  CICLOX: 'CICLO X',
  'CIGLO I': 'CICLO I',
  GIGLO: 'CICLO I',
};

function normalizeCycle(raw: string): string {
  const t = raw.replace(/\s+/g, ' ').trim().toUpperCase();
  return CICLO_NORMALIZE[t] ?? t.replace(/\s+/g, ' ').trim();
}

const CHECKMARK = '\u2611';

function parsePassedSubjectsFromPdfText(
  pdfText: string,
): Array<{ cycle: string; code: string; subject: string }> {
  const lines = pdfText.split(/\r?\n/);
  const seen = new Set<string>();
  const result: Array<{ cycle: string; code: string; subject: string }> = [];
  const subjectLineRe =
    /(CICLO\s*[IVX0-9]*|CICLOI|CIGLO\s*I|CICLO\s*H|CICLO\s*IH|CICLO\s*IN|CICLO\s*VIH|CICLOX|GIGLO)\s+([A-Z]{2,4}\d{2,4})\s+(.+)/i;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(subjectLineRe);
    if (!match) continue;
    const [, cycleRaw, code, subjectRest] = match;
    const subject = subjectRest
      .replace(/\s*☑\s*$/, '')
      .replace(/\s*\u2611\s*$/, '')
      .trim();
    if (!subject || subject.length < 3) continue;
    const hasCheckSameLine = line.includes('☑') || line.includes(CHECKMARK);
    const nextLine = lines[i + 1] ?? '';
    const nextNext = lines[i + 2] ?? '';
    const lineHasOnlyCheckmark = (s: string) =>
      /^\s*[☑\u2611]\s*$/.test(s) ||
      ((s.includes('☑') || s.includes(CHECKMARK)) &&
        s.replace(/\s/g, '').replace(/[☑\u2611]/g, '').length === 0);
    const hasCheckNext =
      lineHasOnlyCheckmark(nextLine) || lineHasOnlyCheckmark(nextNext);
    if (!hasCheckSameLine && !hasCheckNext) continue;
    let cycle = normalizeCycle(cycleRaw ?? '');
    if (!/^CICLO\s+[IVX0-9]+$/i.test(cycle)) {
      cycle = cycle || 'CICLO I';
      if (/^CICLO\s*$/i.test(cycle)) cycle = 'CICLO I';
    }
    const key = `${cycle}|${code.trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ cycle, code: code.trim(), subject });
  }
  return result;
}

/**
 * Resultado de la validación de un documento de solvencia de horas sociales
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasValidStamp: boolean;
  hasValidFormat: boolean;
  documentStudentName?: string;
  documentIdentificationNumber?: string;
}

export interface SocialServiceValidationContext {
  expectedStudentName: string;
  expectedIdentificationNumber: string;
}

/**
 * Resultado de la validación de un documento de materias ganadas
 */
export interface PassedSubjectsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasValidFormat: boolean;
  passedSubjects: Array<{
    cycle: string;
    code: string;
    subject: string;
  }>;
  totalSubjects: number;
  passedCount: number;
  validationAccuracyPercent?: number;
  documentStudentName?: string;
  documentIdentificationNumber?: string;
}

export interface PassedSubjectsValidationContext {
  expectedStudentName: string;
  expectedIdentificationNumber: string;
}

/**
 * Resultado de la validación de un comprobante de inscripción
 */
export interface EnrollmentProofValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasValidFormat: boolean;
  documentStudentName?: string;
  documentIdentificationNumber?: string;
  cycle?: string;
  enrolledSubjects?: Array<{
    name: string;
    code?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export interface EnrollmentProofValidationContext {
  expectedStudentName: string;
  expectedIdentificationNumber: string;
}

interface EnrollmentProofOpenAIAnalysis {
  isValid: boolean;
  hasValidFormat: boolean;
  errors: string[];
  warnings: string[];
  documentStudentName?: string;
  documentIdentificationNumber?: string;
  cycle?: string;
  enrolledSubjects?: Array<{
    name: string;
    code?: string;
    startDate?: string;
    endDate?: string;
  }>;
  reasoning?: string;
}

interface EnrollmentProofFromText {
  documentStudentName?: string;
  documentIdentificationNumber?: string;
  cycle?: string;
  enrolledSubjects?: Array<{
    name: string;
    code?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

function parseEnrollmentProofFromPdfText(
  pdfText: string,
): EnrollmentProofFromText {
  const out: EnrollmentProofFromText = {};
  const estudianteMatch = pdfText.match(
    /Estudiante:\s*([^\n]+?)\s*\.{2,}\s*,\s*Carnet:\s*(\S+)/i,
  );
  if (estudianteMatch?.[1] && estudianteMatch?.[2]) {
    out.documentStudentName = estudianteMatch[1].replace(/\.{2,}$/, '').trim();
    out.documentIdentificationNumber = estudianteMatch[2].trim();
  }
  const cycleMatch = pdfText.match(
    /COMPROBANTE\s+DE\s+INSCRIPCION\s+DE\s+ASIGNATURAS\s+(CICLO\s+[IVX0-9]+\s*-\s*\d{4})/i,
  );
  if (cycleMatch?.[1]) out.cycle = cycleMatch[1].trim();
  const lines = pdfText.split(/\r?\n/);
  const subjectLineRe = /^\s*(\d+)\s{2,}(.+?)\s{2,}\d\s+\s*\(TEO\)/;
  const dateRe = /(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})/;
  const seen = new Set<string>();
  const subjects: Array<{
    name: string;
    code?: string;
    startDate?: string;
    endDate?: string;
  }> = [];
  for (const line of lines) {
    const m = line.match(subjectLineRe);
    if (!m) continue;
    const name = m[2].trim();
    if (name.length < 3) continue;
    const key = name.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const dates = line.match(dateRe);
    subjects.push({
      name,
      startDate: dates?.[1],
      endDate: dates?.[2],
    });
  }
  if (subjects.length > 0) out.enrolledSubjects = subjects;
  return out;
}

/**
 * Análisis de OpenAI sobre el documento de materias ganadas
 */
interface PassedSubjectsOpenAIAnalysis {
  isValid: boolean;
  hasValidFormat: boolean;
  errors: string[];
  warnings: string[];
  passedSubjects: Array<{
    cycle: string;
    code: string;
    subject: string;
  }>;
  totalSubjects: number;
  passedCount: number;
  reasoning?: string;
  validationAccuracyPercent?: number;
  documentStudentName?: string;
  documentIdentificationNumber?: string;
}

/**
 * Análisis de OpenAI sobre el documento
 */
interface OpenAIAnalysis {
  isValid: boolean;
  hasValidFormat: boolean;
  hasValidStamp: boolean;
  errors: string[];
  warnings: string[];
  reasoning?: string;
  documentStudentName?: string;
  documentIdentificationNumber?: string;
}

/**
 * Resultado de la extracción de nombre/carnet solo desde imágenes del documento (sin referencia ni sello)
 */
interface SocialServiceExtractionResult {
  documentStudentName?: string | null;
  documentIdentificationNumber?: string | null;
}

/**
 * Configuración para la conversión de PDF a imágenes usando pdf-poppler
 */
const PDF_TO_IMAGE_CONFIG = {
  scale: 2.0, // Escala para pdf-poppler (2.0 = 200% de resolución)
  imageFormat: 'image/png' as const,
} as const;

/**
 * Configuración para la API de OpenAI
 */
const OPENAI_CONFIG = {
  model: 'gpt-4o',
  maxTokens: 1500,
  temperature: 0.3,
} as const;

function normalizeForComparison(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ');
}

function safeString(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    const t = value.trim();
    return t === '' ? undefined : t;
  }
  if (typeof value === 'number') return String(value).trim();
  return undefined;
}

/**
 * Valida un documento de solvencia de horas sociales usando OpenAI GPT-4 Vision
 *
 * @param documentPath - Ruta del archivo PDF a validar
 * @param configService - Servicio de configuración de NestJS
 * @param context - Datos del estudiante para verificar coincidencia nombre/carnet
 * @returns Resultado de la validación con errores y advertencias
 */
export async function validateSocialServiceDocumentWithOpenAI(
  documentPath: string,
  configService: ConfigService,
  context?: SocialServiceValidationContext,
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    hasValidStamp: false,
    hasValidFormat: false,
  };

  try {
    // Validar configuración de OpenAI
    const openaiApiKey = configService.get<string>('openai.apiKey');
    if (!openaiApiKey) {
      throw new Error(
        'OPENAI_API_KEY no está configurada. Por favor, agrega OPENAI_API_KEY a tu archivo .env',
      );
    }

    // Inicializar cliente de OpenAI
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Obtener rutas de archivos de referencia
    const referencePath = getReferenceDocumentPath();
    const stampImagePath = getStampImagePath();

    // Convertir PDFs a imágenes de alta calidad
    console.log('Convirtiendo documento PDF a imágenes de alta calidad...');
    const documentImages = await convertPdfToImages(documentPath);

    if (documentImages.length === 0) {
      throw new Error('No se pudieron generar imágenes del documento PDF');
    }

    console.log(`Documento convertido: ${documentImages.length} página(s)`);

    const referenceImages = fs.existsSync(referencePath)
      ? await convertPdfToImages(referencePath)
      : [];

    // Leer imagen del sello directamente (PNG)
    const stampImageBase64 = fs.existsSync(stampImagePath)
      ? fs.readFileSync(stampImagePath).toString('base64')
      : null;

    if (!stampImageBase64) {
      console.warn(
        'Advertencia: No se encontró la imagen del sello de referencia',
      );
    }

    // 1) Extraer nombre y carnet: primero por texto del PDF (determinista, sin alucinaciones)
    const pdfText = await extractTextFromPdf(documentPath);
    const parsedFromText = parseSocialServiceNameAndCarnetFromText(pdfText);
    const hasFromText =
      parsedFromText.documentStudentName != null &&
      parsedFromText.documentIdentificationNumber != null;

    if (hasFromText) {
      result.documentStudentName = safeString(
        parsedFromText.documentStudentName,
      );
      result.documentIdentificationNumber = safeString(
        parsedFromText.documentIdentificationNumber,
      );
    } else {
      // Fallback: PDF solo imagen → extracción por OpenAI (solo imágenes del documento)
      const extraction = await extractSocialServiceDataFromDocument(
        openai,
        documentImages,
      );
      result.documentStudentName = safeString(extraction.documentStudentName);
      result.documentIdentificationNumber = safeString(
        extraction.documentIdentificationNumber,
      );
    }

    // 2) Validar formato y sello con documento + referencia + sello (nombre/carnet ya vienen de la extracción)
    const messages = buildOpenAIMessages(
      documentImages,
      referenceImages,
      stampImageBase64,
    );
    const analysis = await validateWithOpenAI(openai, messages, {
      temperature: 0,
    });

    result.isValid = analysis.isValid ?? false;
    result.hasValidFormat = analysis.hasValidFormat ?? false;
    result.hasValidStamp = analysis.hasValidStamp ?? false;
    result.errors = Array.isArray(analysis.errors) ? analysis.errors : [];
    result.warnings = Array.isArray(analysis.warnings) ? analysis.warnings : [];

    if (context && result.documentStudentName && context.expectedStudentName) {
      const docName = normalizeForComparison(result.documentStudentName);
      const expectedName = normalizeForComparison(context.expectedStudentName);
      if (docName !== expectedName) {
        result.errors.push(
          `El nombre del documento ("${result.documentStudentName}") no coincide con el del estudiante ("${context.expectedStudentName}").`,
        );
        result.isValid = false;
      }
    }
    if (
      context &&
      result.documentIdentificationNumber &&
      context.expectedIdentificationNumber
    ) {
      const docCarnet = normalizeForComparison(
        result.documentIdentificationNumber,
      );
      const expectedCarnet = normalizeForComparison(
        context.expectedIdentificationNumber,
      );
      if (docCarnet !== expectedCarnet) {
        result.errors.push(
          `El número de carnet del documento ("${result.documentIdentificationNumber}") no coincide con el del estudiante ("${context.expectedIdentificationNumber}").`,
        );
        result.isValid = false;
      }
    }

    // Agregar reasoning si es necesario
    if (!result.isValid && analysis.reasoning && result.errors.length === 0) {
      result.errors.push(analysis.reasoning);
    }

    if (result.isValid && analysis.reasoning && result.warnings.length === 0) {
      result.warnings.push(analysis.reasoning);
    }

    return result;
  } catch (error: any) {
    result.isValid = false;

    // Manejar errores específicos de OpenAI
    if (error?.status === 429) {
      if (error?.code === 'insufficient_quota') {
        result.errors.push(
          'La cuenta de OpenAI no tiene créditos disponibles. Por favor, agrega un método de pago en https://platform.openai.com/account/billing para activar tu cuenta.',
        );
      } else {
        result.errors.push(
          'Se excedió el límite de solicitudes a OpenAI. Por favor, intenta de nuevo más tarde.',
        );
      }
    } else if (error?.status === 401) {
      result.errors.push(
        'La API key de OpenAI no es válida. Por favor, verifica tu OPENAI_API_KEY en el archivo .env',
      );
    } else if (error?.status === 400) {
      result.errors.push(
        `Error en la solicitud a OpenAI: ${error?.message || 'Solicitud inválida'}`,
      );
    } else {
      const errorMessage = error?.message || 'Error desconocido';
      result.errors.push(`Error al validar con OpenAI: ${errorMessage}`);
    }

    console.error('Error en validación OpenAI:', error);
    return result;
  }
}

/**
 * Obtiene la ruta del documento de referencia
 */
function getReferenceDocumentPath(): string {
  return path.join(__dirname, '..', 'assets', 'solvencia_horas_sociales.pdf');
}

/**
 * Obtiene la ruta de la imagen del sello de referencia
 */
function getStampImagePath(): string {
  return path.join(__dirname, '..', 'assets', 'sello_aprobado.png');
}

/**
 * Mensajes para extraer solo nombre y carnet del documento (sin referencia ni sello).
 * Una sola fuente de imágenes = menos confusión e invención.
 */
function buildSocialServiceExtractionMessages(
  documentImages: string[],
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: 'text', text: SOCIAL_SERVICE_EXTRACTION_USER_PROMPT },
  ];
  documentImages.forEach((imageBase64) => {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${PDF_TO_IMAGE_CONFIG.imageFormat};base64,${imageBase64}`,
        detail: 'high',
      },
    });
  });
  return [
    { role: 'system', content: SOCIAL_SERVICE_EXTRACTION_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

/**
 * Extrae nombre y carnet solo de las imágenes del documento (una llamada, solo documento).
 */
async function extractSocialServiceDataFromDocument(
  openai: OpenAI,
  documentImages: string[],
): Promise<SocialServiceExtractionResult> {
  const messages = buildSocialServiceExtractionMessages(documentImages);
  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    messages,
    response_format: { type: 'json_object' },
    max_tokens: 300,
    temperature: 0,
  });
  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {};
  }
  try {
    const parsed = JSON.parse(content) as SocialServiceExtractionResult;
    return {
      documentStudentName: parsed.documentStudentName ?? null,
      documentIdentificationNumber: parsed.documentIdentificationNumber ?? null,
    };
  } catch {
    return {};
  }
}

/**
 * Construye los mensajes para enviar a OpenAI
 */
function buildOpenAIMessages(
  documentImages: string[],
  referenceImages: string[],
  stampImageBase64: string | null,
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: 'text', text: SOCIAL_SERVICE_USER_PROMPT },
  ];

  // Agregar imágenes del documento a validar (alta calidad)
  documentImages.forEach((imageBase64, index) => {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${PDF_TO_IMAGE_CONFIG.imageFormat};base64,${imageBase64}`,
        detail: 'high', // Máxima calidad para mejor legibilidad
      },
    });
  });

  // Agregar documento de referencia si existe
  if (referenceImages.length > 0) {
    userContent.push({
      type: 'text',
      text: SOCIAL_SERVICE_REFERENCE_LABEL,
    });
    referenceImages.forEach((imageBase64) => {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${PDF_TO_IMAGE_CONFIG.imageFormat};base64,${imageBase64}`,
          detail: 'high',
        },
      });
    });
  }

  // Agregar imagen del sello de referencia si existe - PREGUNTA DIRECTA
  if (stampImageBase64) {
    userContent.push({
      type: 'text',
      text: SOCIAL_SERVICE_STAMP_QUESTION,
    });
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:image/png;base64,${stampImageBase64}`,
        detail: 'high',
      },
    });
    userContent.push({
      type: 'text',
      text: SOCIAL_SERVICE_VERIFICATION_INSTRUCTIONS,
    });
  }

  return [
    { role: 'system', content: SOCIAL_SERVICE_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

/**
 * Realiza la validación con OpenAI.
 * temperature 0 minimiza invención de datos en nombre/carnet.
 */
async function validateWithOpenAI(
  openai: OpenAI,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: { temperature?: number },
): Promise<OpenAIAnalysis> {
  const temperature = options?.temperature ?? OPENAI_CONFIG.temperature;
  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    messages,
    response_format: { type: 'json_object' },
    max_tokens: OPENAI_CONFIG.maxTokens,
    temperature,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No se recibió respuesta de OpenAI');
  }

  try {
    return JSON.parse(content) as OpenAIAnalysis;
  } catch (parseError) {
    throw new Error(
      `Error al parsear respuesta de OpenAI: ${(parseError as Error).message}. Respuesta: ${content.substring(0, 200)}`,
    );
  }
}

/**
 * Convierte un PDF a imágenes PNG en base64 usando pdftoppm del sistema
 * Usa poppler-utils instalado en el sistema (más confiable)
 *
 * @param pdfPath - Ruta del archivo PDF
 * @returns Array de imágenes en base64
 */
async function convertPdfToImages(pdfPath: string): Promise<string[]> {
  try {
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`El archivo PDF no existe: ${pdfPath}`);
    }

    // Crear directorio temporal para las imágenes
    const tempDir = path.join(
      os.tmpdir(),
      `pdf-images-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    );
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const outputPrefix = path.join(tempDir, 'page');
    const scale = Math.round(PDF_TO_IMAGE_CONFIG.scale * 100); // Convertir a porcentaje (200 = 2.0x)

    console.log(`Convirtiendo PDF a imágenes usando pdftoppm del sistema...`);

    // Usar pdftoppm del sistema directamente
    // pdftoppm -png -scale-to 200 input.pdf output_prefix
    const command = `pdftoppm -png -scale-to ${scale} "${pdfPath}" "${outputPrefix}"`;

    try {
      await execAsync(command);
    } catch (execError: any) {
      // Limpiar directorio temporal en caso de error
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn('Error al limpiar directorio temporal:', cleanupError);
      }
      throw new Error(`Error al ejecutar pdftoppm: ${execError.message}`);
    }

    // Leer todas las imágenes generadas
    const files = fs
      .readdirSync(tempDir)
      .filter((file) => file.endsWith('.png'))
      .sort((a, b) => {
        // Ordenar por número de página (page-1.png, page-2.png, etc.)
        const numA = parseInt(a.match(/-(\d+)\.png$/)?.[1] || '0');
        const numB = parseInt(b.match(/-(\d+)\.png$/)?.[1] || '0');
        return numA - numB;
      });

    if (files.length === 0) {
      // Limpiar directorio temporal
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn('Error al limpiar directorio temporal:', cleanupError);
      }
      throw new Error('No se generaron imágenes del PDF');
    }

    const images: string[] = [];
    for (const file of files) {
      const imagePath = path.join(tempDir, file);
      const imageBuffer = fs.readFileSync(imagePath);

      if (imageBuffer.length === 0) {
        console.warn(`Advertencia: La imagen ${file} está vacía`);
        continue;
      }

      const imageBase64 = imageBuffer.toString('base64');
      images.push(imageBase64);

      // Limpiar archivo temporal
      try {
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.warn(
          `No se pudo eliminar archivo temporal: ${imagePath}`,
          error,
        );
      }
    }

    // Limpiar directorio temporal
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn('Error al limpiar directorio temporal:', cleanupError);
    }

    if (images.length === 0) {
      throw new Error('No se pudieron generar imágenes del PDF');
    }

    console.log(
      `PDF convertido exitosamente: ${images.length} imagen(es) generada(s) usando pdftoppm`,
    );
    return images;
  } catch (error) {
    console.error('Error al convertir PDF a imágenes:', error);
    throw new Error(
      `Error al convertir PDF a imágenes: ${(error as Error).message}`,
    );
  }
}

const PASSED_SUBJECTS_IMAGE_CHUNKS = 6;

/**
 * Divide una imagen (base64) en N franjas verticales con solapamiento para no perder filas en bordes.
 */
async function splitImageIntoVerticalChunks(
  imageBase64: string,
  numChunks: number,
): Promise<string[]> {
  try {
    const { createCanvas, loadImage } = await import('canvas');
    const buffer = Buffer.from(imageBase64, 'base64');
    const img = await loadImage(buffer);
    const w = Number(img.width);
    const h = Number(img.height);
    const chunkHeight = Math.ceil(h / numChunks);
    const overlap = Math.floor(chunkHeight * 0.15);
    const out: string[] = [];
    for (let i = 0; i < numChunks; i++) {
      const y = Math.max(0, i * chunkHeight - (i > 0 ? overlap : 0));
      const sliceH = Math.min(
        chunkHeight + (i < numChunks - 1 ? overlap : 0),
        h - y,
      );
      if (sliceH <= 0) break;
      const canvas = createCanvas(w, sliceH);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, y, w, sliceH, 0, 0, w, sliceH);
      out.push(canvas.toBuffer('image/png').toString('base64'));
    }
    return out.length > 0 ? out : [imageBase64];
  } catch {
    return [imageBase64];
  }
}

type PassedSubjectItem = { cycle: string; code: string; subject: string };

/**
 * Calcula la precisión de validación (0-100) según la confianza del modelo y la cobertura extraída.
 */
function computePassedSubjectsValidationAccuracy(options: {
  passedCount: number;
  totalSubjects: number;
  isChunked: boolean;
  rawModelPercent?: number;
}): number {
  const { passedCount, totalSubjects, isChunked, rawModelPercent } = options;
  let score = 70;
  if (
    typeof rawModelPercent === 'number' &&
    rawModelPercent >= 0 &&
    rawModelPercent <= 100
  ) {
    score = rawModelPercent;
  }
  if (totalSubjects > 0 && passedCount <= totalSubjects) {
    const ratio = passedCount / totalSubjects;
    score = Math.round(score * 0.6 + ratio * 100 * 0.4);
  }
  if (isChunked) {
    score = Math.max(0, score - 5);
  }
  return Math.round(Math.min(100, Math.max(0, score)));
}

function mergePassedSubjectsAnalyses(
  analyses: PassedSubjectsOpenAIAnalysis[],
): PassedSubjectsOpenAIAnalysis {
  const byCode = new Map<string, PassedSubjectItem>();
  for (const a of analyses) {
    const list = Array.isArray(a.passedSubjects) ? a.passedSubjects : [];
    for (const s of list) {
      const code = String(s.code ?? '').trim();
      if (!code) continue;
      const cycle = String(s.cycle ?? '').trim();
      const subject = String(s.subject ?? '').trim();
      if (!subject) continue;
      const existing = byCode.get(code);
      if (!existing || subject.length > (existing.subject?.length ?? 0)) {
        byCode.set(code, { cycle, code, subject });
      }
    }
  }
  const passedSubjects = Array.from(byCode.values());
  const first = analyses[0];
  return {
    isValid: analyses.every((a) => a.isValid !== false),
    hasValidFormat: first?.hasValidFormat ?? false,
    errors: analyses.flatMap((a) => (Array.isArray(a.errors) ? a.errors : [])),
    warnings: analyses.flatMap((a) =>
      Array.isArray(a.warnings) ? a.warnings : [],
    ),
    passedSubjects,
    totalSubjects: first?.totalSubjects ?? passedSubjects.length,
    passedCount: passedSubjects.length,
    validationAccuracyPercent: first?.validationAccuracyPercent,
    documentStudentName: first?.documentStudentName,
    documentIdentificationNumber: first?.documentIdentificationNumber,
  };
}

/**
 * Valida un documento de materias ganadas usando OpenAI GPT-4 Vision
 *
 * @param documentPath - Ruta del archivo PDF a validar
 * @param configService - Servicio de configuración de NestJS
 * @param context - Datos del estudiante para verificar coincidencia nombre/carnet
 * @returns Resultado de la validación con las materias ganadas extraídas
 */
export async function validatePassedSubjectsDocumentWithOpenAI(
  documentPath: string,
  configService: ConfigService,
  context?: PassedSubjectsValidationContext,
): Promise<PassedSubjectsValidationResult> {
  const result: PassedSubjectsValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    hasValidFormat: false,
    passedSubjects: [],
    totalSubjects: 0,
    passedCount: 0,
    validationAccuracyPercent: undefined,
    documentStudentName: undefined,
    documentIdentificationNumber: undefined,
  };

  try {
    // Validar configuración de OpenAI
    const openaiApiKey = configService.get<string>('openai.apiKey');
    if (!openaiApiKey) {
      throw new Error(
        'OPENAI_API_KEY no está configurada. Por favor, agrega OPENAI_API_KEY a tu archivo .env',
      );
    }

    // Inicializar cliente de OpenAI
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Obtener ruta del documento de referencia
    const referencePath = path.join(
      __dirname,
      '..',
      'assets',
      'materias_ganadas.pdf',
    );

    // Convertir PDFs a imágenes de alta calidad
    console.log('Convirtiendo documento PDF de materias ganadas a imágenes...');
    const documentImages = await convertPdfToImages(documentPath);

    if (documentImages.length === 0) {
      throw new Error('No se pudieron generar imágenes del documento PDF');
    }

    console.log(`Documento convertido: ${documentImages.length} página(s)`);

    let documentImagesToUse = documentImages;
    if (documentImages.length === 1) {
      documentImagesToUse = await splitImageIntoVerticalChunks(
        documentImages[0],
        PASSED_SUBJECTS_IMAGE_CHUNKS,
      );
      console.log(
        `Imagen única dividida en ${documentImagesToUse.length} partes para extracción completa`,
      );
    }

    const referenceImages = fs.existsSync(referencePath)
      ? await convertPdfToImages(referencePath)
      : [];

    if (referenceImages.length === 0) {
      console.warn(
        'Advertencia: No se encontró el documento de referencia de materias ganadas',
      );
    }

    const isChunked = documentImagesToUse.length > 1;

    let analysis: PassedSubjectsOpenAIAnalysis;
    if (isChunked) {
      const analyses = await Promise.all(
        documentImagesToUse.map((chunkImage) => {
          const partMessages = buildPassedSubjectsOpenAIMessages(
            [chunkImage],
            referenceImages,
          );
          return validatePassedSubjectsWithOpenAI(openai, partMessages);
        }),
      );
      analysis = mergePassedSubjectsAnalyses(analyses);
    } else {
      const messages = buildPassedSubjectsOpenAIMessages(
        documentImagesToUse,
        referenceImages,
      );
      analysis = await validatePassedSubjectsWithOpenAI(openai, messages);
    }

    result.isValid = analysis.isValid ?? false;
    result.hasValidFormat = analysis.hasValidFormat ?? false;
    result.errors = Array.isArray(analysis.errors) ? analysis.errors : [];
    result.warnings = Array.isArray(analysis.warnings) ? analysis.warnings : [];
    result.passedSubjects = [];
    result.totalSubjects = analysis.totalSubjects ?? 0;
    result.passedCount = analysis.passedCount ?? 0;
    result.validationAccuracyPercent = computePassedSubjectsValidationAccuracy({
      passedCount: result.passedCount,
      totalSubjects: result.totalSubjects,
      isChunked,
      rawModelPercent:
        typeof analysis.validationAccuracyPercent === 'number' &&
        analysis.validationAccuracyPercent >= 0 &&
        analysis.validationAccuracyPercent <= 100
          ? analysis.validationAccuracyPercent
          : undefined,
    });
    result.documentStudentName = safeString(analysis.documentStudentName);
    result.documentIdentificationNumber = safeString(
      analysis.documentIdentificationNumber,
    );

    let pdfText = '';
    try {
      pdfText = await extractTextFromPdf(documentPath);
    } catch {
      // ignore
    }
    if (pdfText?.trim()) {
      const nameCarnetFromText =
        parsePassedSubjectsNameAndCarnetFromText(pdfText);
      if (!result.documentStudentName && nameCarnetFromText.documentStudentName)
        result.documentStudentName = nameCarnetFromText.documentStudentName;
      if (
        !result.documentIdentificationNumber &&
        nameCarnetFromText.documentIdentificationNumber
      )
        result.documentIdentificationNumber =
          nameCarnetFromText.documentIdentificationNumber;
      const totalPlanMatch = pdfText.match(/Materias\s+del\s+plan:\s*(\d+)/i);
      const passedMatch = pdfText.match(/Materias\s+ganadas:\s*(\d+)/i);
      if (totalPlanMatch?.[1])
        result.totalSubjects = parseInt(totalPlanMatch[1], 10);
      if (passedMatch?.[1]) result.passedCount = parseInt(passedMatch[1], 10);
    }
    if (result.documentStudentName || result.documentIdentificationNumber) {
      result.warnings = result.warnings.filter(
        (w) =>
          !/no (se )?pudo extraer el nombre/i.test(w) &&
          !/no (se )?pudo extraer el (número de )?carnet/i.test(w) &&
          !/no fue posible leer/i.test(w) &&
          !/no se puede leer/i.test(w),
      );
    }

    if (context && result.documentStudentName && context.expectedStudentName) {
      const docName = normalizeForComparison(result.documentStudentName);
      const expectedName = normalizeForComparison(context.expectedStudentName);
      if (docName !== expectedName) {
        result.errors.push(
          `El nombre del documento ("${result.documentStudentName}") no coincide con el del estudiante ("${context.expectedStudentName}").`,
        );
        result.isValid = false;
      }
    }
    if (
      context &&
      result.documentIdentificationNumber &&
      context.expectedIdentificationNumber
    ) {
      const docCarnet = normalizeForComparison(
        result.documentIdentificationNumber,
      );
      const expectedCarnet = normalizeForComparison(
        context.expectedIdentificationNumber,
      );
      if (docCarnet !== expectedCarnet) {
        result.errors.push(
          `El número de carnet del documento ("${result.documentIdentificationNumber}") no coincide con el del estudiante ("${context.expectedIdentificationNumber}").`,
        );
        result.isValid = false;
      }
    }

    if (
      result.totalSubjects > 0 &&
      result.passedCount < result.totalSubjects - 1
    ) {
      result.isValid = false;
      result.errors.push(
        'La plataforma ha detectado que no todas las materias del plan aparecen como aprobadas en el documento. Todas deben estar marcadas con check (☑), excepto la última que es opcional.',
      );
    }

    if (result.totalSubjects === 0 && result.isValid) {
      result.warnings.push(
        'No se pudo obtener el total de materias del documento. Verifica que el formato sea correcto.',
      );
    }

    return result;
  } catch (error: any) {
    result.isValid = false;

    // Manejar errores específicos de OpenAI
    if (error?.status === 429) {
      if (error?.code === 'insufficient_quota') {
        result.errors.push(
          'La cuenta de OpenAI no tiene créditos disponibles. Por favor, agrega un método de pago en https://platform.openai.com/account/billing para activar tu cuenta.',
        );
      } else {
        result.errors.push(
          'Se excedió el límite de solicitudes a OpenAI. Por favor, intenta de nuevo más tarde.',
        );
      }
    } else if (error?.status === 401) {
      result.errors.push(
        'La API key de OpenAI no es válida. Por favor, verifica tu OPENAI_API_KEY en el archivo .env',
      );
    } else if (error?.status === 400) {
      result.errors.push(
        `Error en la solicitud a OpenAI: ${error?.message || 'Solicitud inválida'}`,
      );
    } else {
      const errorMessage = error?.message || 'Error desconocido';
      result.errors.push(`Error al validar con OpenAI: ${errorMessage}`);
    }

    console.error('Error en validación OpenAI de materias ganadas:', error);
    return result;
  }
}

/**
 * Construye los mensajes para enviar a OpenAI para validación de materias ganadas
 */
function buildPassedSubjectsOpenAIMessages(
  documentImages: string[],
  referenceImages: string[],
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: 'text', text: PASSED_SUBJECTS_USER_PROMPT },
  ];

  // Agregar imágenes del documento a validar
  documentImages.forEach((imageBase64) => {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${PDF_TO_IMAGE_CONFIG.imageFormat};base64,${imageBase64}`,
        detail: 'high',
      },
    });
  });

  if (referenceImages.length > 0) {
    userContent.push({
      type: 'text',
      text: PASSED_SUBJECTS_REFERENCE_LABEL,
    });
    referenceImages.forEach((imageBase64) => {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${PDF_TO_IMAGE_CONFIG.imageFormat};base64,${imageBase64}`,
          detail: 'low',
        },
      });
    });
  }

  userContent.push({
    type: 'text',
    text: PASSED_SUBJECTS_EXTRACTION_INSTRUCTIONS,
  });

  return [
    { role: 'system', content: PASSED_SUBJECTS_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

/**
 * Realiza la validación de materias ganadas con OpenAI
 */
async function validatePassedSubjectsWithOpenAI(
  openai: OpenAI,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
): Promise<PassedSubjectsOpenAIAnalysis> {
  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    messages,
    response_format: { type: 'json_object' },
    max_tokens: 16384,
    temperature: OPENAI_CONFIG.temperature,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No se recibió respuesta de OpenAI');
  }

  try {
    return JSON.parse(content) as PassedSubjectsOpenAIAnalysis;
  } catch (parseError) {
    throw new Error(
      `Error al parsear respuesta de OpenAI: ${(parseError as Error).message}. Respuesta: ${content.substring(0, 200)}`,
    );
  }
}

/**
 * Valida un comprobante de inscripción (PDF) usando OpenAI GPT-4 Vision.
 * El documento típico tiene: cabecera (institución, título "COMPROBANTE DE INSCRIPCION DE ASIGNATURAS", ciclo, fecha),
 * datos del estudiante (nombre, carnet, especialidad, correo), tabla de asignaturas inscritas (No., Asignatura, Matr., Tipo/Grupo, Fecha inicio, Fecha fin).
 */
export async function validateEnrollmentProofDocumentWithOpenAI(
  documentPath: string,
  configService: ConfigService,
  context?: EnrollmentProofValidationContext,
): Promise<EnrollmentProofValidationResult> {
  const result: EnrollmentProofValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    hasValidFormat: false,
  };

  try {
    const openaiApiKey = configService.get<string>('openai.apiKey');
    if (!openaiApiKey) {
      throw new Error(
        'OPENAI_API_KEY no está configurada. Por favor, agrega OPENAI_API_KEY a tu archivo .env',
      );
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });
    const documentImages = await convertPdfToImages(documentPath);
    if (documentImages.length === 0) {
      throw new Error('No se pudieron generar imágenes del documento PDF');
    }

    const messages = buildEnrollmentProofOpenAIMessages(documentImages);
    const analysis = await validateEnrollmentProofWithOpenAI(openai, messages);

    result.isValid = analysis.isValid ?? false;
    result.hasValidFormat = analysis.hasValidFormat ?? false;
    result.errors = Array.isArray(analysis.errors) ? analysis.errors : [];
    result.warnings = Array.isArray(analysis.warnings) ? analysis.warnings : [];
    result.documentStudentName = safeString(analysis.documentStudentName);
    result.documentIdentificationNumber = safeString(
      analysis.documentIdentificationNumber,
    );
    result.cycle = safeString(analysis.cycle);
    result.enrolledSubjects = Array.isArray(analysis.enrolledSubjects)
      ? analysis.enrolledSubjects
      : undefined;

    let textFallback: EnrollmentProofFromText | null = null;
    try {
      const pdfText = await extractTextFromPdf(documentPath);
      if (pdfText?.trim())
        textFallback = parseEnrollmentProofFromPdfText(pdfText);
    } catch {
      // ignore
    }
    if (textFallback) {
      if (textFallback.documentStudentName)
        result.documentStudentName = textFallback.documentStudentName;
      if (textFallback.documentIdentificationNumber)
        result.documentIdentificationNumber =
          textFallback.documentIdentificationNumber;
      if (textFallback.cycle) result.cycle = textFallback.cycle;
      if (
        textFallback.enrolledSubjects?.length &&
        (!result.enrolledSubjects?.length ||
          textFallback.enrolledSubjects.length >=
            result.enrolledSubjects.length)
      )
        result.enrolledSubjects = textFallback.enrolledSubjects;
    }
    if (
      result.documentStudentName ||
      result.documentIdentificationNumber ||
      result.cycle
    ) {
      result.warnings = result.warnings.filter(
        (w) =>
          !/no (se )?pudo extraer el nombre/i.test(w) &&
          !/no (se )?pudo extraer el (número de )?carnet/i.test(w) &&
          !/no (se )?pudo extraer el ciclo/i.test(w) &&
          !/no fue posible leer/i.test(w) &&
          !/no se puede leer/i.test(w),
      );
    }

    if (context && result.documentStudentName && context.expectedStudentName) {
      const docName = normalizeForComparison(result.documentStudentName);
      const expectedName = normalizeForComparison(context.expectedStudentName);
      if (docName !== expectedName) {
        result.errors.push(
          `El nombre del documento ("${result.documentStudentName}") no coincide con el del estudiante ("${context.expectedStudentName}").`,
        );
        result.isValid = false;
      }
    }
    if (
      context &&
      result.documentIdentificationNumber &&
      context.expectedIdentificationNumber
    ) {
      const docCarnet = normalizeForComparison(
        result.documentIdentificationNumber,
      );
      const expectedCarnet = normalizeForComparison(
        context.expectedIdentificationNumber,
      );
      if (docCarnet !== expectedCarnet) {
        result.errors.push(
          `El número de carnet del documento ("${result.documentIdentificationNumber}") no coincide con el del estudiante ("${context.expectedIdentificationNumber}").`,
        );
        result.isValid = false;
      }
    }

    return result;
  } catch (error: unknown) {
    result.isValid = false;
    const err = error as { status?: number; code?: string; message?: string };
    if (err?.status === 429) {
      result.errors.push(
        err?.code === 'insufficient_quota'
          ? 'La cuenta de OpenAI no tiene créditos disponibles.'
          : 'Se excedió el límite de solicitudes a OpenAI. Intenta más tarde.',
      );
    } else if (err?.status === 401) {
      result.errors.push(
        'La API key de OpenAI no es válida. Verifica OPENAI_API_KEY en .env',
      );
    } else if (err?.status === 400) {
      result.errors.push(
        `Error en la solicitud a OpenAI: ${err?.message || 'Solicitud inválida'}`,
      );
    } else {
      result.errors.push(
        `Error al validar con OpenAI: ${(error as Error)?.message || 'Error desconocido'}`,
      );
    }
    console.error(
      'Error en validación OpenAI comprobante de inscripción:',
      error,
    );
    return result;
  }
}

function buildEnrollmentProofOpenAIMessages(
  documentImages: string[],
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: 'text', text: ENROLLMENT_PROOF_USER_PROMPT },
  ];
  documentImages.forEach((imageBase64) => {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${PDF_TO_IMAGE_CONFIG.imageFormat};base64,${imageBase64}`,
        detail: 'high',
      },
    });
  });
  userContent.push({
    type: 'text',
    text: ENROLLMENT_PROOF_EXTRACTION_INSTRUCTIONS,
  });
  return [
    { role: 'system', content: ENROLLMENT_PROOF_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

async function validateEnrollmentProofWithOpenAI(
  openai: OpenAI,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
): Promise<EnrollmentProofOpenAIAnalysis> {
  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    messages,
    response_format: { type: 'json_object' },
    max_tokens: 2000,
    temperature: OPENAI_CONFIG.temperature,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No se recibió respuesta de OpenAI');
  }

  try {
    return JSON.parse(content) as EnrollmentProofOpenAIAnalysis;
  } catch (parseError) {
    throw new Error(
      `Error al parsear respuesta de OpenAI: ${(parseError as Error).message}. Respuesta: ${content.substring(0, 200)}`,
    );
  }
}
