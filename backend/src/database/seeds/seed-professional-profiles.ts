import { Connection } from 'mongoose';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { BaseSeed } from '@/database/seeds/base.seed';

interface ProfessionalProfileData {
  summary?: string;
  workExperience?: Array<{
    company: string;
    position: string;
    description?: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
  }>;
  skills?: string[];
  languages?: Array<{
    name: string;
    level: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    technologies?: string[];
    url?: string;
  }>;
}

interface OpenAIResponse {
  summary?: string;
  workExperience?: Array<{
    company: string;
    position: string;
    description?: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
  }>;
  skills?: string[];
  languages?: Array<{
    name: string;
    level: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    technologies?: string[];
    url?: string;
  }>;
}

export class SeedProfessionalProfiles extends BaseSeed {
  private openai: OpenAI | null = null;

  constructor(connection: Connection, configService: ConfigService) {
    super(connection);

    const apiKey = configService.get<string>('openai.apiKey');
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY no está configurada. Por favor, agrega OPENAI_API_KEY a tu archivo .env',
      );
    }

    this.openai = new OpenAI({ apiKey });
  }

  async seed(): Promise<void> {
    console.log('Iniciando seed de perfiles profesionales...');

    if (!this.openai) {
      throw new Error('OpenAI no está inicializado');
    }

    const studentsCollection = this.connection.collection('students');
    const careersCollection = this.connection.collection('careers');

    const students = await studentsCollection
      .find({})
      .toArray();

    if (students.length === 0) {
      console.log('No hay estudiantes en la base de datos');
      return;
    }

    const careers = await careersCollection.find({}).toArray();
    const careerMap = new Map(
      careers.map((c: any) => [c._id.toString(), c]),
    );

    console.log(`Procesando ${students.length} estudiantes...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const studentNumber = i + 1;

      try {
        console.log(
          `[${studentNumber}/${students.length}] Procesando estudiante: ${student.firstName} ${student.lastName} (${student.email})`,
        );

        const career = student.careerId
          ? careerMap.get(student.careerId.toString())
          : null;

        const professionalProfile = await this.generateProfessionalProfile(
          this.openai,
          student,
          career,
        );

        if (professionalProfile) {
          const updateData: any = {};

          if (professionalProfile.workExperience) {
            updateData.workExperience = professionalProfile.workExperience.map(
              (exp) => ({
                ...exp,
                startDate: new Date(exp.startDate),
                endDate: exp.endDate ? new Date(exp.endDate) : undefined,
              }),
            );
          }

          if (professionalProfile.education) {
            updateData.education = professionalProfile.education.map((edu) => ({
              ...edu,
              startDate: new Date(edu.startDate),
              endDate: edu.endDate ? new Date(edu.endDate) : undefined,
            }));
          }

          if (professionalProfile.skills) {
            updateData.skills = professionalProfile.skills;
          }

          if (professionalProfile.summary || professionalProfile.languages || professionalProfile.certifications || professionalProfile.projects) {
            updateData.professionalProfile = {};

            if (professionalProfile.summary) {
              updateData.professionalProfile.summary = professionalProfile.summary;
            }

            if (professionalProfile.languages) {
              updateData.professionalProfile.languages = professionalProfile.languages;
            }

            if (professionalProfile.certifications) {
              updateData.professionalProfile.certifications =
                professionalProfile.certifications.map((cert) => ({
                  ...cert,
                  date: new Date(cert.date),
                  expiryDate: cert.expiryDate
                    ? new Date(cert.expiryDate)
                    : undefined,
                }));
            }

            if (professionalProfile.projects) {
              updateData.professionalProfile.projects = professionalProfile.projects;
            }
          }

          await studentsCollection.updateOne(
            { _id: student._id },
            { $set: updateData },
          );

          successCount++;
          console.log(
            `✓ Perfil profesional generado para ${student.firstName} ${student.lastName}`,
          );
        } else {
          errorCount++;
          console.log(
            `✗ No se pudo generar perfil para ${student.firstName} ${student.lastName}`,
          );
        }

        await this.delay(1000);
      } catch (error: any) {
        errorCount++;
        console.error(
          `✗ Error procesando estudiante ${student.firstName} ${student.lastName}:`,
          error.message,
        );
      }
    }

    console.log('\n=== Resumen ===');
    console.log(`Total de estudiantes: ${students.length}`);
    console.log(`Exitosos: ${successCount}`);
    console.log(`Errores: ${errorCount}`);
    console.log('Seed de perfiles profesionales finalizado');
  }

  private async generateProfessionalProfile(
    openai: OpenAI,
    student: any,
    career: any,
  ): Promise<ProfessionalProfileData | null> {
    const prompt = this.buildPrompt(student, career);

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en generar perfiles profesionales realistas y coherentes para estudiantes universitarios. 
Genera información profesional creíble y variada que sea apropiada para un estudiante de nivel universitario en El Salvador.
La información debe ser realista, coherente y variada entre diferentes estudiantes.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 3000,
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No se recibió respuesta de OpenAI');
      }

      const data = JSON.parse(content) as OpenAIResponse;

      return {
        summary: data.summary,
        workExperience: data.workExperience?.map((exp) => ({
          ...exp,
          startDate: this.parseDate(exp.startDate),
          endDate: exp.endDate ? this.parseDate(exp.endDate) : undefined,
        })),
        education: data.education?.map((edu) => ({
          ...edu,
          startDate: this.parseDate(edu.startDate),
          endDate: edu.endDate ? this.parseDate(edu.endDate) : undefined,
        })),
        skills: data.skills,
        languages: data.languages,
        certifications: data.certifications?.map((cert) => ({
          ...cert,
          date: this.parseDate(cert.date),
          expiryDate: cert.expiryDate ? this.parseDate(cert.expiryDate) : undefined,
        })),
        projects: data.projects,
      };
    } catch (error: any) {
      console.error('Error generando perfil profesional:', error.message);
      return null;
    }
  }

  private buildPrompt(student: any, career: any): string {
    const careerName = career?.name || 'una carrera técnica';
    const careerCode = career?.code || '';
    const currentYear = new Date().getFullYear();
    const birthYear = student.dateOfBirth
      ? new Date(student.dateOfBirth).getFullYear()
      : currentYear - 20;
    const age = currentYear - birthYear;
    const estimatedStartYear = currentYear - Math.floor(Math.random() * 3) - 1;

    return `Genera un perfil profesional completo y realista para un estudiante universitario en El Salvador.

Información del estudiante:
- Nombre: ${student.firstName} ${student.lastName}
- Edad aproximada: ${age} años
- Carrera: ${careerName} ${careerCode ? `(${careerCode})` : ''}
- Email: ${student.email}
${student.phone ? `- Teléfono: ${student.phone}` : ''}
${student.address ? `- Dirección: ${student.address}` : ''}

Genera un perfil profesional variado y realista que incluya:

1. **Resumen profesional** (summary): Un párrafo breve (2-4 oraciones) describiendo al estudiante, sus intereses profesionales y objetivos.

2. **Experiencia laboral** (workExperience): 0-3 experiencias laborales. Puede incluir:
   - Trabajos de medio tiempo
   - Prácticas profesionales previas
   - Trabajos temporales
   - Voluntariados relevantes
   Cada experiencia debe tener: company, position, description (opcional), startDate (YYYY-MM-DD), endDate (opcional, YYYY-MM-DD), isCurrent (boolean)

3. **Formación académica** (education): 1-2 entradas educativas. Puede incluir:
   - Educación secundaria o bachillerato
   - Cursos técnicos previos
   - La carrera actual (si aplica)
   Cada entrada debe tener: institution, degree, field (opcional), startDate (YYYY-MM-DD), endDate (opcional), isCurrent (boolean), description (opcional)

4. **Habilidades** (skills): 5-12 habilidades técnicas y blandas relevantes para la carrera. Ejemplos:
   - Para carreras de tecnología: JavaScript, React, Node.js, Git, etc.
   - Para carreras administrativas: Microsoft Office, Contabilidad, etc.
   - Habilidades blandas: Trabajo en equipo, Comunicación, etc.

5. **Idiomas** (languages): 1-3 idiomas con niveles. Incluir al menos español. Ejemplos:
   - Español: Nativo
   - Inglés: Intermedio/Avanzado/Básico

6. **Certificaciones** (certifications): 0-3 certificaciones relevantes. Puede incluir:
   - Certificaciones técnicas
   - Cursos online
   - Certificaciones de software
   Cada certificación debe tener: name, issuer, date (YYYY-MM-DD), expiryDate (opcional, YYYY-MM-DD)

7. **Proyectos** (projects): 0-3 proyectos personales o académicos. Cada proyecto debe tener:
   - name: Nombre del proyecto
   - description: Descripción breve (opcional)
   - technologies: Array de tecnologías usadas (opcional)
   - url: URL del proyecto si está disponible (opcional)

IMPORTANTE:
- Las fechas deben ser realistas considerando la edad del estudiante
- La información debe ser coherente con la carrera del estudiante
- Varía la cantidad y tipo de información entre estudiantes (no todos deben tener todo)
- Usa nombres de empresas, instituciones y proyectos realistas para El Salvador
- Las fechas de inicio deben ser anteriores a la fecha actual
- Si isCurrent es true, no incluir endDate

Responde SOLO con un JSON válido con esta estructura exacta:
{
  "summary": "texto del resumen profesional",
  "workExperience": [
    {
      "company": "Nombre de la empresa",
      "position": "Cargo o posición",
      "description": "Descripción opcional",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "isCurrent": false
    }
  ],
  "education": [
    {
      "institution": "Nombre de la institución",
      "degree": "Título o grado",
      "field": "Campo de estudio opcional",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "isCurrent": false,
      "description": "Descripción opcional"
    }
  ],
  "skills": ["Habilidad 1", "Habilidad 2", ...],
  "languages": [
    {
      "name": "Idioma",
      "level": "Nivel"
    }
  ],
  "certifications": [
    {
      "name": "Nombre de la certificación",
      "issuer": "Organización emisora",
      "date": "YYYY-MM-DD",
      "expiryDate": "YYYY-MM-DD"
    }
  ],
  "projects": [
    {
      "name": "Nombre del proyecto",
      "description": "Descripción opcional",
      "technologies": ["Tech1", "Tech2"],
      "url": "URL opcional"
    }
  ]
}`;
  }

  private parseDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error(`Fecha inválida: ${dateString}`);
      }
      return date.toISOString();
    } catch (error) {
      console.warn(`Error parseando fecha: ${dateString}, usando fecha actual`);
      return new Date().toISOString();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

