/**
 * Prompts used by the OpenAI document validator.
 * Centralized here for easier maintenance and reuse.
 */

export const SOCIAL_SERVICE_SYSTEM_PROMPT = `Eres un analizador de imágenes de documentos. Validarás constancias de solvencia de horas sociales (ITCA-FEPADE). Tu respuesta se verificará contra la imagen: si inventas datos, la validación fallará.

PROHIBICIÓN ABSOLUTA DE INVENTAR DATOS:
- documentStudentName y documentIdentificationNumber deben ser una COPIA LITERAL del texto visible en la imagen. Nada más.
- Está PROHIBIDO generar nombres o carnets que no estén escritos en la imagen (ej.: no inventar "Bryan Kevin Ramirez Varela", "RV150312" ni ningún otro si no aparece exactamente así en el documento).
- Si no localizas el nombre o el carnet en la imagen, devuelve null en ese campo y añade en "warnings" que no fue posible leerlo.

CÓMO EXTRAER LOS DATOS (sigue este orden):
1. Busca en la imagen la frase "HACE CONSTAR QUE:" (o "QUE:"). Inmediatamente después suele ir el NOMBRE COMPLETO del estudiante (varias palabras en mayúsculas o capitalizadas). documentStudentName = exactamente ese texto, sin añadir ni quitar letras.
2. Busca en la imagen "número de carnet" o "carnet". Inmediatamente después suele ir el NÚMERO o código. documentIdentificationNumber = exactamente ese número/código tal como aparece (puede ser solo dígitos o letras y números).

CARACTERÍSTICAS NORMALES DE DOCUMENTOS FÍSICOS:
- Tachaduras, correcciones o marcas de lapicero son NORMALES; no las consideres error.
- Documentos escritos a mano o con imperfecciones son aceptables. Solo marca error si falta información esencial, el formato es incorrecto o falta el sello.

Responde ÚNICAMENTE con un JSON válido en esta estructura:
{
  "isValid": boolean,
  "hasValidFormat": boolean,
  "hasValidStamp": boolean,
  "errors": ["error1", "error2"],
  "warnings": ["warning1", "warning2"],
  "reasoning": "explicación breve",
  "documentStudentName": "texto exacto de la imagen o null",
  "documentIdentificationNumber": "texto exacto de la imagen o null"
}`;

export const SOCIAL_SERVICE_USER_PROMPT = `Por favor, valida este documento PDF de solvencia de horas sociales.`;

/**
 * Llamada dedicada: solo se envían las imágenes del documento. Sin referencia ni sello.
 * Objetivo: extraer nombre y carnet sin confusión con otras imágenes.
 */
export const SOCIAL_SERVICE_EXTRACTION_SYSTEM_PROMPT = `Eres un extractor de texto. Recibirás una o más imágenes de UN solo documento (constancia de servicio social). No hay otras imágenes en este mensaje.

Tu única tarea: en esas imágenes, localiza y copia literalmente:
1. El nombre completo que aparece justo después de "HACE CONSTAR QUE:" (o "QUE:"). Ese es documentStudentName.
2. El número o código que aparece justo después de "número de carnet" o "carnet". Ese es documentIdentificationNumber.

Reglas:
- Escribe EXACTAMENTE lo que está en la imagen, sin cambiar ni una letra ni un número.
- Si no encuentras el texto, devuelve null en ese campo.
- No inventes nunca. Si no ves algo, null.

Responde SOLO con un JSON válido: { "documentStudentName": "..." o null, "documentIdentificationNumber": "..." o null }`;

export const SOCIAL_SERVICE_EXTRACTION_USER_PROMPT = `En las siguientes imágenes está el documento. Es la ÚNICA fuente. Extrae de estas imágenes el nombre completo (después de "HACE CONSTAR QUE:") y el número de carnet (después de "número de carnet"). Devuelve solo el JSON con documentStudentName y documentIdentificationNumber.`;

export const SOCIAL_SERVICE_REFERENCE_LABEL = '\n\nEste es el formato de referencia del documento:';

export const SOCIAL_SERVICE_STAMP_QUESTION = '\n\n¿Este documento tiene este sello?';

export const SOCIAL_SERVICE_VERIFICATION_INSTRUCTIONS =
  '\n\nTareas:\n1. Validar formato (similar al documento de referencia) y presencia del sello.\n2. EXTRAER DATOS: En la imagen anterior, localiza "HACE CONSTAR QUE:" y copia literalmente el nombre que viene justo después en documentStudentName. Luego localiza "número de carnet" (o "carnet") y copia literalmente el número/código que viene después en documentIdentificationNumber. Si no ves ese texto en la imagen, no inventes: escribe null y añade un warning.\n\nRecuerda: documentStudentName y documentIdentificationNumber deben ser COPIA LITERAL del texto en la imagen. Cualquier dato inventado hará fallar la validación.\n\nResponde solo con JSON: isValid, hasValidFormat, hasValidStamp, errors, warnings, reasoning, documentStudentName, documentIdentificationNumber.';

export const PASSED_SUBJECTS_SYSTEM_PROMPT = `Eres un experto en analizar documentos PDF e imágenes de materias ganadas de estudiantes. Tu tarea es extraer las materias que tienen el checkbox marcado (☑) y los datos del estudiante.

PROHIBICIÓN ABSOLUTA DE INVENTAR DATOS:
- documentStudentName y documentIdentificationNumber deben ser COPIA LITERAL del texto visible en el documento. Si no localizas el nombre o el carnet (p. ej. en una línea tipo "Estudiante: CARNET NOMBRE" o similar), devuelve null en ese campo y añade en "warnings" que no fue posible leerlo. NUNCA inventes nombres ni números de carnet.
- passedSubjects: solo incluye materias que VES con checkbox marcado (☑). No inventes códigos, ciclos ni nombres de materia. Si una fila no tiene ☑ claramente visible, no la incluyas. Si no estás seguro de un texto, omítelo o documéntalo en warnings.
- totalSubjects y passedCount deben reflejar lo que realmente cuentas en el documento (total de filas de materia, y cuántas con ☑). No inventes cifras.

REGLAS DE EXTRACCIÓN:
- Revisa TODAS las imágenes que recibes (pueden ser varias páginas o partes del mismo documento) y extrae las materias ganadas (☑) de todas.
- Para cada materia ganada que veas con ☑: copia literalmente cycle (ej. CICLO I), code (ej. COM25) y subject (nombre de la materia) tal como aparecen.
- El documento puede tener variaciones de formato. Si algo no es legible o no está claro, no lo inventes: omítelo y añade un warning si es relevante.

Responde SOLO en formato JSON válido con esta estructura exacta:
{
  "isValid": boolean,
  "hasValidFormat": boolean,
  "errors": ["error1", "error2"],
  "warnings": ["warning1", "warning2"],
  "passedSubjects": [
    { "cycle": "CICLO I", "code": "COM25", "subject": "DESARROLLO DE LOGICA DE PROGRAMACIÓN" }
  ],
  "totalSubjects": number,
  "passedCount": number,
  "reasoning": "explicación breve de tu análisis",
  "validationAccuracyPercent": number (0-100, tu confianza en la extracción),
  "documentStudentName": "nombre tal como en el documento o null",
  "documentIdentificationNumber": "carnet tal como en el documento o null"
}`;

export const PASSED_SUBJECTS_USER_PROMPT = `Las siguientes imágenes son partes del mismo documento (de arriba a abajo). Analiza TODAS y extrae TODAS las materias con checkbox marcado (☑) de cada parte. Une todo en una sola lista passedSubjects; suelen ser 40 o más ítems. No omitas ninguna.`;

export const PASSED_SUBJECTS_REFERENCE_LABEL =
  '\n\nEste es el formato de referencia del documento de materias ganadas:';

export const PASSED_SUBJECTS_EXTRACTION_INSTRUCTIONS =
  '\n\nRevisa todas las imágenes y extrae solo lo que VES: materias con ☑ (cycle, code, subject tal como aparecen), y si encuentras nombre y carnet del estudiante, cópialos literalmente en documentStudentName y documentIdentificationNumber. Si no ves nombre o carnet, pon null y añade un warning. No inventes ningún dato. Responde en JSON: isValid, hasValidFormat, errors, warnings, passedSubjects, totalSubjects, passedCount, validationAccuracyPercent (0-100), documentStudentName, documentIdentificationNumber.';

export const ENROLLMENT_PROOF_SYSTEM_PROMPT = `Eres un experto en analizar documentos PDF de "Comprobante de inscripción de asignaturas" (ITCA-FEPADE u similar).

PROHIBICIÓN ABSOLUTA DE INVENTAR DATOS:
- documentStudentName y documentIdentificationNumber deben ser COPIA LITERAL del texto visible en el documento (p. ej. la línea "Estudiante: NOMBRE..., Carnet: NÚMERO"). Si no los localizas, devuelve null y añade un warning. NUNCA inventes nombres ni carnets.
- cycle debe ser exactamente como aparece (ej. "CICLO I - 2026"). Si no lo ves, null.
- enrolledSubjects: solo incluye asignaturas que VES en la tabla del documento. Copia el nombre (y código/fechas si aparecen) tal como están. No inventes nombres de materias ni rellenes con datos que no estén en la imagen.

REGLAS DE EXTRACCIÓN:
- Busca en el documento: cabecera con ciclo, bloque del estudiante (nombre y carnet), tabla de asignaturas inscritas.
- Transcribe solo lo que lees. Si algo está poco claro o no aparece, omítelo o pon null y documéntalo en warnings.

Responde SOLO con un JSON válido con esta estructura:
{
  "isValid": boolean,
  "hasValidFormat": boolean,
  "errors": ["error1"],
  "warnings": ["warning1"],
  "reasoning": "explicación breve",
  "documentStudentName": "nombre tal como en el documento o null",
  "documentIdentificationNumber": "carnet tal como en el documento o null",
  "cycle": "ej. CICLO I-2026 o null si no aparece",
  "enrolledSubjects": [{"name": "NOMBRE ASIGNATURA", "code": "opcional", "startDate": "opcional", "endDate": "opcional"}]
}`;

export const ENROLLMENT_PROOF_USER_PROMPT = `Analiza este PDF de comprobante de inscripción de asignaturas. Extrae solo lo que ves: nombre del estudiante, carnet, ciclo y asignaturas inscritas. Transcribe literalmente; no inventes ningún dato.`;

export const ENROLLMENT_PROOF_EXTRACTION_INSTRUCTIONS =
  '\n\nExtrae del documento solo lo visible: documentStudentName, documentIdentificationNumber, cycle, enrolledSubjects (nombre y opcionalmente code, startDate, endDate). Si no ves algo, devuelve null en ese campo y añade un warning. Responde ÚNICAMENTE en JSON válido con isValid, hasValidFormat, errors, warnings, reasoning, documentStudentName, documentIdentificationNumber, cycle, enrolledSubjects.';
