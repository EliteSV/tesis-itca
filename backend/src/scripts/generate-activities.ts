import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import OpenAI from 'openai';
import { Student, StudentDocument } from '@/modules/students/schemas/student.schema';
import {
  Application,
  ApplicationDocument,
} from '@/modules/opportunities/schemas/application.schema';
import {
  PracticeActivity,
  PracticeActivityDocument,
} from '@/modules/practice-professional/schemas/practice-activity.schema';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import { ApplicationStatus } from '@/modules/opportunities/schemas/application.schema';
import { ActivityStatus } from '@/modules/practice-professional/schemas/practice-activity.schema';

interface GeneratedActivity {
  description: string;
  activityDate: string;
  hours: number;
  equipmentOrTool: string;
}

interface OpenAIResponse {
  activities: GeneratedActivity[];
}

async function generateActivitiesWithOpenAI(
  openai: OpenAI,
  studentEmail: string,
  opportunityTitle: string,
  companyName: string,
  careerName: string,
  opportunityDescription: string,
): Promise<GeneratedActivity[]> {
  const prompt = `Eres un experto en generar registros de actividades realistas para prácticas profesionales en El Salvador.

Genera exactamente 30 actividades profesionales realistas y variadas para un estudiante de práctica profesional.

Contexto:
- Estudiante: ${studentEmail}
- Empresa: ${companyName}
- Oportunidad: ${opportunityTitle}
- Carrera: ${careerName}
- Descripción de la oportunidad: ${opportunityDescription}

Requisitos:
1. Las actividades deben ser realistas y apropiadas para una práctica profesional
2. Deben estar relacionadas con la carrera y el tipo de trabajo de la empresa
3. Las fechas deben distribuirse en los últimos 2-3 meses (fechas pasadas)
4. Las horas por actividad deben ser entre 1 y 8 horas
5. Las herramientas/equipos deben ser relevantes para cada actividad
6. Las actividades deben variar en tipo: desarrollo, investigación, reuniones, documentación, pruebas, etc.
7. Las fechas deben estar en formato YYYY-MM-DD
8. No repitas actividades idénticas

Formato de respuesta JSON:
{
  "activities": [
    {
      "description": "Descripción detallada de la actividad realizada",
      "activityDate": "2024-11-15",
      "hours": 4,
      "equipmentOrTool": "Visual Studio Code, Node.js, MongoDB"
    }
  ]
}

Genera exactamente 30 actividades variadas y realistas.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en generar registros de actividades profesionales realistas para estudiantes en prácticas profesionales. Genera información creíble, variada y apropiada para el contexto laboral en El Salvador.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    const data = JSON.parse(content) as OpenAIResponse;
    return data.activities || [];
  } catch (error: any) {
    console.error('Error generando actividades con OpenAI:', error.message);
    throw error;
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
    const studentModel = app.get<Model<StudentDocument>>(
      getModelToken(Student.name),
    );
    const applicationModel = app.get<Model<ApplicationDocument>>(
      getModelToken(Application.name),
    );
    const practiceActivityModel = app.get<Model<PracticeActivityDocument>>(
      getModelToken(PracticeActivity.name),
    );
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

    const studentEmail = 'ana.gonzalez@estudiante.itca.edu.sv';

    try {
      console.log(`Buscando estudiante con email: ${studentEmail}`);

      const user = await userModel.findOne({ email: studentEmail }).exec();

    if (!user) {
      throw new Error(`No se encontró usuario con email: ${studentEmail}`);
    }

    const student = await studentModel
      .findOne({ userId: user._id })
      .populate('careerId', 'name code')
      .lean()
      .exec();

    if (!student) {
      throw new Error(`No se encontró estudiante para el usuario: ${studentEmail}`);
    }

    console.log(`Estudiante encontrado: ${student.firstName} ${student.lastName}`);

    const acceptedApplication = await applicationModel
      .findOne({
        studentId: user._id,
        status: ApplicationStatus.ACCEPTED,
      })
      .populate({
        path: 'opportunityId',
        populate: [
          { path: 'careerId', select: 'name code' },
          { path: 'companyId', select: 'name logo' },
        ],
      })
      .lean()
      .exec();

    if (!acceptedApplication) {
      throw new Error(
        `El estudiante no tiene una práctica profesional activa (aplicación aceptada)`,
      );
    }

    const opportunity = acceptedApplication.opportunityId as any;
    const company = opportunity.companyId as any;
    const career = opportunity.careerId || student.careerId;

    console.log(`Práctica profesional encontrada:`);
    console.log(`- Empresa: ${company?.name || 'N/A'}`);
    console.log(`- Oportunidad: ${opportunity.title || 'N/A'}`);
    console.log(`- Carrera: ${career?.name || 'N/A'}`);

    const apiKey = configService.get<string>('openai.apiKey');
    if (!apiKey) {
      throw new Error('OpenAI API key no está configurada');
    }

    const openai = new OpenAI({ apiKey });

    console.log('\nGenerando actividades con OpenAI...');
    const activities = await generateActivitiesWithOpenAI(
      openai,
      studentEmail,
      opportunity.title || '',
      company?.name || '',
      career?.name || '',
      opportunity.description || '',
    );

    if (activities.length === 0) {
      throw new Error('No se generaron actividades');
    }

    console.log(`\nSe generaron ${activities.length} actividades`);
    console.log('Insertando actividades en la base de datos...');

    let insertedCount = 0;
    let errorCount = 0;

    for (const activityData of activities) {
      try {
        const activityDate = new Date(activityData.activityDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (activityDate > today) {
          console.warn(
            `⚠️  Fecha futura ignorada: ${activityData.activityDate} - ${activityData.description}`,
          );
          continue;
        }

        const activity = new practiceActivityModel({
          applicationId: acceptedApplication._id,
          description: activityData.description,
          activityDate,
          hours: activityData.hours,
          equipmentOrTool: activityData.equipmentOrTool,
          status: ActivityStatus.APPROVED,
        });

        await activity.save();
        insertedCount++;
        console.log(
          `✓ Insertada: ${activityData.activityDate} - ${activityData.description.substring(0, 50)}...`,
        );
      } catch (error: any) {
        errorCount++;
        console.error(
          `✗ Error insertando actividad: ${activityData.description.substring(0, 50)}... - ${error.message}`,
        );
      }
    }

    console.log(`\n✅ Proceso completado:`);
    console.log(`   - Actividades insertadas: ${insertedCount}`);
    console.log(`   - Errores: ${errorCount}`);
    console.log(`   - Total procesadas: ${activities.length}`);

    await app.close();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
