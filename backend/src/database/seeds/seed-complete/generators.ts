import OpenAI from 'openai';
import { SeedData, OpportunityTemplates } from './types';

export class SeedGenerators {
  constructor(private readonly openai: OpenAI) {}

  private parseJsonResponse<T>(content: string, context: string): T {
    try {
      // Limpiar el contenido: remover markdown code blocks si existen
      let cleanedContent = content.trim();

      // Remover ```json y ``` si están presentes
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/i, '');
        cleanedContent = cleanedContent.replace(/\s*```$/, '');
        cleanedContent = cleanedContent.trim();
      }

      // Intentar parsear el JSON
      return JSON.parse(cleanedContent) as T;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      console.error(`Error parseando JSON en ${context}:`, errorMessage);
      console.error(
        `Contenido recibido (primeros 500 caracteres):`,
        content.substring(0, 500),
      );
      throw new Error(
        `Error parseando respuesta de OpenAI para ${context}: ${errorMessage}. Contenido: ${content.substring(0, 200)}...`,
      );
    }
  }

  async generateCareerCategories(): Promise<SeedData['careerCategories']> {
    const prompt = `Genera datos de seed para categorías de carrera de un sistema de prácticas profesionales de ITCA (Instituto Técnico de Capacitación y Productividad) en El Salvador.

Necesito EXACTAMENTE 2 categorías con esta estructura:

1. Primera categoría:
   - name: "Técnico"
   - description: descripción breve y realista sobre carreras técnicas (máximo 150 caracteres)
   - requiredProfessionalHours: 300

2. Segunda categoría:
   - name: "Ingeniería"
   - description: descripción breve y realista sobre carreras de ingeniería (máximo 150 caracteres)
   - requiredProfessionalHours: 640

Responde SOLO con un JSON válido con esta estructura exacta:
{
  "careerCategories": [
    {
      "name": "Técnico",
      "description": "...",
      "requiredProfessionalHours": 300
    },
    {
      "name": "Ingeniería",
      "description": "...",
      "requiredProfessionalHours": 640
    }
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en generar datos de prueba realistas para sistemas educativos en El Salvador. Genera información creíble y coherente.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI para categorías');
    }

    const data = this.parseJsonResponse<{
      careerCategories: SeedData['careerCategories'];
    }>(content, 'categorías');
    return data.careerCategories;
  }

  async generateCareers(
    categories: SeedData['careerCategories'],
  ): Promise<SeedData['careers']> {
    const categoryNames = categories.map((c) => c.name).join(', ');

    const prompt = `Genera datos de seed para carreras de un sistema de prácticas profesionales de ITCA (Instituto Técnico de Capacitación y Productividad) en El Salvador.

Necesito 15-20 carreras con esta estructura:
   - code: código único de 6-8 caracteres (ej: "TICS01", "INDUS02", "ADMIN01")
   - name: nombre completo de la carrera
   - description: descripción de la carrera (máximo 200 caracteres)
   - duration: duración en años (3-5 años)
   - categoryName: nombre de la categoría a la que pertenece (DEBE ser uno de estos: ${categoryNames})

IMPORTANTE: Distribuye las carreras entre las categorías disponibles. Usa los nombres exactos de las categorías proporcionadas.

Responde SOLO con un JSON válido con esta estructura exacta:
{
  "careers": [
    {
      "code": "TICS01",
      "name": "...",
      "description": "...",
      "duration": 3,
      "categoryName": "Técnico"
    },
    ...
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en generar datos de prueba realistas para sistemas educativos en El Salvador. Genera información creíble y coherente.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI para carreras');
    }

    const data = this.parseJsonResponse<{ careers: SeedData['careers'] }>(
      content,
      'carreras',
    );
    return data.careers;
  }

  async generateCompanies(): Promise<SeedData['companies']> {
    const prompt = `Genera datos de seed para empresas de un sistema de prácticas profesionales de ITCA (Instituto Técnico de Capacitación y Productividad) en El Salvador.

Necesito 10-12 empresas salvadoreñas realistas con esta estructura:
   - name: nombre de empresa salvadoreña realista
   - nit: NIT salvadoreño válido (formato: 0614-XXXXXX-XXX-X)
   - address: dirección en El Salvador (ciudad y zona específica)
   - phone: teléfono (formato: +503 XXXX-XXXX)
   - email: email corporativo (formato: contacto@empresa.com.sv o similar)
   - sector: sector empresarial (ej: Telecomunicaciones, Tecnología, Inmobiliaria, Retail, etc.)
   - description: descripción breve de la empresa (máximo 150 caracteres)

Responde SOLO con un JSON válido con esta estructura exacta:
{
  "companies": [
    {
      "name": "...",
      "nit": "0614-XXXXXX-XXX-X",
      "address": "...",
      "phone": "+503 XXXX-XXXX",
      "email": "...",
      "sector": "...",
      "description": "..."
    },
    ...
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en generar datos de prueba realistas para sistemas educativos en El Salvador. Genera información creíble y coherente.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI para empresas');
    }

    const data = this.parseJsonResponse<{ companies: SeedData['companies'] }>(
      content,
      'empresas',
    );
    return data.companies;
  }

  private async generateStudentsBatch(
    batchNumber: number,
    totalBatches: number,
    careers: SeedData['careers'],
  ): Promise<SeedData['students']> {
    const careerCodes = careers.map((c) => c.code).join(', ');
    const studentsPerBatch = 12;

    const prompt = `Genera datos de seed para estudiantes de un sistema de prácticas profesionales de ITCA (Instituto Técnico de Capacitación y Productividad) en El Salvador.

Esta es la petición ${batchNumber} de ${totalBatches}. Necesito EXACTAMENTE ${studentsPerBatch} estudiantes con esta estructura:
   - firstName: nombre común salvadoreño
   - lastName: apellido común salvadoreño
   - email: email institucional (formato: nombre.apellido@estudiante.itca.edu.sv)
   - identificationNumber: DUI salvadoreño (formato: 00000000-0)
   - phone: teléfono (formato: +503 XXXX-XXXX)
   - address: dirección en El Salvador (ciudad y zona específica)
   - dateOfBirth: fecha de nacimiento (formato YYYY-MM-DD, entre 1998-2005)
   - gender: "Masculino" o "Femenino"
   - careerCode: código de una carrera (DEBE ser uno de estos: ${careerCodes})

IMPORTANTE: 
- Genera EXACTAMENTE ${studentsPerBatch} estudiantes
- Distribuye los estudiantes entre las carreras disponibles
- Usa los códigos exactos de las carreras proporcionadas
- Asegúrate de que las direcciones sean breves para evitar truncamiento

Responde SOLO con un JSON válido con esta estructura exacta:
{
  "students": [
    {
      "firstName": "...",
      "lastName": "...",
      "email": "nombre.apellido@estudiante.itca.edu.sv",
      "identificationNumber": "00000000-0",
      "phone": "+503 XXXX-XXXX",
      "address": "...",
      "dateOfBirth": "YYYY-MM-DD",
      "gender": "Masculino",
      "careerCode": "TICS01"
    },
    ...
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en generar datos de prueba realistas para sistemas educativos en El Salvador. Genera información creíble y coherente.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error(
        `No se recibió respuesta de OpenAI para estudiantes (batch ${batchNumber})`,
      );
    }

    const data = this.parseJsonResponse<{ students: SeedData['students'] }>(
      content,
      `estudiantes (batch ${batchNumber})`,
    );
    return data.students;
  }

  async generateStudents(
    careers: SeedData['careers'],
  ): Promise<SeedData['students']> {
    const totalBatches = 2;
    const allStudents: SeedData['students'] = [];

    console.log(`Generando estudiantes en ${totalBatches} peticiones...`);

    for (let i = 1; i <= totalBatches; i++) {
      console.log(`Generando batch ${i} de ${totalBatches}...`);
      const batchStudents = await this.generateStudentsBatch(
        i,
        totalBatches,
        careers,
      );
      allStudents.push(...batchStudents);
      console.log(
        `Batch ${i} completado: ${batchStudents.length} estudiantes generados`,
      );
    }

    console.log(`Total de estudiantes generados: ${allStudents.length}`);
    return allStudents;
  }

  async generateOpportunityTemplates(): Promise<OpportunityTemplates> {
    const prompt = `Genera templates de datos para oportunidades de práctica profesional de un sistema de ITCA (Instituto Técnico de Capacitación y Productividad) en El Salvador.

Necesito tres arrays con datos variados y realistas:

1. **Títulos de oportunidades** (20-25 títulos):
   - Títulos de puestos de trabajo para prácticas profesionales
   - Ejemplos: "Desarrollador de Software", "Analista de Sistemas", "Asistente de Administración"
   - Variados y relacionados con diferentes áreas profesionales

2. **Descripciones genéricas** (10-15 descripciones):
   - Descripciones breves y profesionales para oportunidades de práctica
   - Máximo 150 caracteres cada una
   - Variadas y atractivas

3. **Actividades** (15-20 actividades):
   - Actividades típicas que se realizan en prácticas profesionales
   - Máximo 100 caracteres cada una
   - Variadas y específicas

Responde SOLO con un JSON válido con esta estructura exacta:
{
  "titles": ["Título 1", "Título 2", ...],
  "descriptions": ["Descripción 1", "Descripción 2", ...],
  "activities": ["Actividad 1", "Actividad 2", ...]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en generar datos de prueba realistas para sistemas educativos en El Salvador. Genera información creíble y coherente.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error(
        'No se recibió respuesta de OpenAI para templates de oportunidades',
      );
    }

    const data = this.parseJsonResponse<OpportunityTemplates>(
      content,
      'templates de oportunidades',
    );

    return {
      titles: data.titles || [],
      descriptions: data.descriptions || [],
      activities: data.activities || [],
    };
  }

  private async generateOpportunitiesBatch(
    batchNumber: number,
    totalBatches: number,
    careers: SeedData['careers'],
    companies: SeedData['companies'],
  ): Promise<SeedData['opportunities']> {
    const careerCodes = careers.map((c) => c.code).join(', ');
    const companyNames = companies.map((c) => c.name).join(', ');
    const opportunitiesPerBatch = 18;

    const prompt = `Genera datos de seed para oportunidades de práctica profesional de un sistema de ITCA (Instituto Técnico de Capacitación y Productividad) en El Salvador.

Esta es la petición ${batchNumber} de ${totalBatches}. Necesito EXACTAMENTE ${opportunitiesPerBatch} oportunidades con esta estructura:
   - title: título de la oportunidad (ej: "Desarrollador de Software Junior", "Asistente de Administración")
   - description: descripción detallada de la oportunidad (máximo 300 caracteres)
   - activities: actividades específicas a realizar (máximo 200 caracteres)
   - totalHours: horas totales (entre 200-500)
   - availablePositions: posiciones disponibles (1-5)
   - modality: "presencial" o "remoto"
   - workType: "part-time" o "full-time"
   - careerCode: código de una carrera (DEBE ser uno de estos: ${careerCodes})
   - companyName: nombre de una empresa (DEBE ser uno de estos: ${companyNames})

IMPORTANTE: 
- Genera EXACTAMENTE ${opportunitiesPerBatch} oportunidades
- Distribuye las oportunidades entre las carreras y empresas disponibles
- Usa los códigos exactos de las carreras y nombres exactos de las empresas proporcionados
- Varía las modalidades y tipos de trabajo
- Asegúrate de que las descripciones y actividades sean breves para evitar truncamiento

Responde SOLO con un JSON válido con esta estructura exacta:
{
  "opportunities": [
    {
      "title": "...",
      "description": "...",
      "activities": "...",
      "totalHours": 300,
      "availablePositions": 3,
      "modality": "presencial",
      "workType": "part-time",
      "careerCode": "TICS01",
      "companyName": "Nombre de Empresa"
    },
    ...
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en generar datos de prueba realistas para sistemas educativos en El Salvador. Genera información creíble y coherente.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error(
        `No se recibió respuesta de OpenAI para oportunidades (batch ${batchNumber})`,
      );
    }

    const data = this.parseJsonResponse<{
      opportunities: SeedData['opportunities'];
    }>(content, `oportunidades (batch ${batchNumber})`);
    return data.opportunities;
  }

  async generateOpportunities(
    careers: SeedData['careers'],
    companies: SeedData['companies'],
  ): Promise<SeedData['opportunities']> {
    const totalBatches = 3;
    const allOpportunities: SeedData['opportunities'] = [];

    console.log(`Generando oportunidades en ${totalBatches} peticiones...`);

    for (let i = 1; i <= totalBatches; i++) {
      console.log(`Generando batch ${i} de ${totalBatches}...`);
      const batchOpportunities = await this.generateOpportunitiesBatch(
        i,
        totalBatches,
        careers,
        companies,
      );
      allOpportunities.push(...batchOpportunities);
      console.log(
        `Batch ${i} completado: ${batchOpportunities.length} oportunidades generadas`,
      );
    }

    console.log(`Total de oportunidades generadas: ${allOpportunities.length}`);
    return allOpportunities;
  }
}
