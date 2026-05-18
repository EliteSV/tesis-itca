import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import OpenAI from 'openai';
import {
  PracticeActivity,
  PracticeActivityDocument,
  ActivityStatus,
} from './schemas/practice-activity.schema';
import {
  PracticeProfessional,
  PracticeProfessionalDocument,
  PracticeStatus,
} from './schemas/practice-professional.schema';
import {
  Application,
  ApplicationDocument,
} from '@/modules/opportunities/schemas/application.schema';
import {
  Opportunity,
  OpportunityDocument,
} from '@/modules/opportunities/schemas/opportunity.schema';
import {
  Student,
  StudentDocument,
} from '@/modules/students/schemas/student.schema';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityStatusDto } from './dto/update-activity-status.dto';
import { PracticeProfessionalResponseDto } from './dto/practice-professional-response.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { ActivitiesResponseDto } from './dto/activities-response.dto';
import { PracticeHistoryResponseDto } from './dto/practice-history-response.dto';
import { PracticeHistoryItemDto } from './dto/practice-history-item.dto';
import { StudentsService } from '@/modules/students/students.service';
import { HolidaysService } from './holidays.service';

@Injectable()
export class PracticeProfessionalService {
  constructor(
    @InjectModel(PracticeActivity.name)
    private practiceActivityModel: Model<PracticeActivityDocument>,
    @InjectModel(PracticeProfessional.name)
    private practiceProfessionalModel: Model<PracticeProfessionalDocument>,
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Opportunity.name)
    private opportunityModel: Model<OpportunityDocument>,
    @InjectModel(Student.name)
    private studentModel: Model<StudentDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private studentsService: StudentsService,
    private configService: ConfigService,
    private holidaysService: HolidaysService,
  ) {}

  private async getCompanyIdByUserId(userId: string): Promise<string> {
    const user = await this.userModel
      .findById(userId)
      .select('companyId')
      .lean()
      .exec();

    if (!user || !user.companyId) {
      throw new NotFoundException('Usuario de empresa no encontrado');
    }

    return user.companyId.toString();
  }

  private async resolveStudentUserId(
    studentId: string,
  ): Promise<Types.ObjectId> {
    const student = await this.studentModel
      .findById(studentId)
      .select('userId')
      .lean()
      .exec();

    if (student?.userId) {
      const val = student.userId;
      return val instanceof Types.ObjectId
        ? val
        : new Types.ObjectId(String(val));
    }

    try {
      return new Types.ObjectId(studentId);
    } catch {
      throw new NotFoundException('Estudiante no encontrado');
    }
  }

  private async verifyCompanyAccess(
    opportunity: OpportunityDocument,
    companyUserId: string,
  ): Promise<void> {
    const opportunityCompanyId = opportunity.companyId.toString();
    const responsibleUserId = opportunity.responsibleUserId?.toString();
    const userCompanyId = await this.getCompanyIdByUserId(companyUserId);

    if (
      opportunityCompanyId !== userCompanyId &&
      (!responsibleUserId || responsibleUserId !== companyUserId)
    ) {
      throw new BadRequestException(
        'No tienes permiso para ver las actividades de este estudiante',
      );
    }
  }

  private mapActivityToDto(
    activity: PracticeActivityDocument,
    evaluation?: { type: 'warning' | 'approval'; message: string },
  ): ActivityResponseDto {
    return {
      _id: activity._id.toString(),
      practiceProfessionalId: activity.practiceProfessionalId.toString(),
      description: activity.description,
      activityDate: activity.activityDate,
      hours: activity.hours,
      equipmentOrTool: activity.equipmentOrTool,
      status: activity.status,
      rejectionReason: activity.rejectionReason,
      evaluation,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    };
  }

  private mapOpportunity(opportunity: OpportunityDocument) {
    return {
      _id: opportunity._id.toString(),
      title: opportunity.title,
      description: opportunity.description,
      activities: opportunity.activities,
      careerId: opportunity.careerId.toString(),
      companyId: opportunity.companyId.toString(),
      responsibleUserId: opportunity.responsibleUserId?.toString(),
      totalHours: opportunity.totalHours,
      availablePositions: opportunity.availablePositions,
      modality: opportunity.modality,
      workType: opportunity.workType,
      expirationDate: opportunity.expirationDate,
      status: opportunity.status,
      isActive: opportunity.isActive,
      shareToken: opportunity.shareToken,
      createdAt: opportunity.createdAt,
      updatedAt: opportunity.updatedAt,
      career: opportunity.career
        ? {
            _id: opportunity.career._id.toString(),
            name: opportunity.career.name,
            code: opportunity.career.code,
          }
        : undefined,
      company: opportunity.company
        ? {
            _id: opportunity.company._id.toString(),
            name: opportunity.company.name,
            logo: opportunity.company.logo,
          }
        : undefined,
    };
  }

  async getPracticeProfessional(
    userId: string,
  ): Promise<PracticeProfessionalResponseDto> {
    const practice = await this.practiceProfessionalModel
      .findOne({ studentId: new Types.ObjectId(userId), finalizedAt: null })
      .populate({
        path: 'opportunity',
        populate: [
          { path: 'career', select: 'name code' },
          { path: 'company', select: 'name logo' },
        ],
      })
      .populate('application')
      .exec();

    if (!practice) {
      throw new NotFoundException('No tienes una práctica profesional activa');
    }

    const opportunity = practice.opportunity!;
    const application = practice.application!;

    const activities = await this.practiceActivityModel
      .find({ practiceProfessionalId: practice._id })
      .sort({ activityDate: -1, createdAt: -1 })
      .exec();

    const totalHours = activities.reduce((sum, a) => sum + (a.hours || 0), 0);
    const approvedHours = activities
      .filter((a) => a.status === ActivityStatus.APPROVED)
      .reduce((sum, a) => sum + (a.hours || 0), 0);

    return {
      application: {
        _id: application._id.toString(),
        opportunityId: practice.opportunityId.toString(),
        studentId: application.studentId.toString(),
        coverLetter: application.coverLetter,
        status: application.status,
        rejectionReason: application.rejectionReason,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
      },
      opportunity: this.mapOpportunity(opportunity),
      activities: activities.map((a) => this.mapActivityToDto(a)),
      totalHours,
      approvedHours,
      status: practice.status,
    };
  }

  async createActivity(
    userId: string,
    createActivityDto: CreateActivityDto,
  ): Promise<ActivityResponseDto> {
    const practice = await this.practiceProfessionalModel
      .findOne({ studentId: new Types.ObjectId(userId), finalizedAt: null })
      .exec();

    if (!practice) {
      throw new NotFoundException('No tienes una práctica profesional activa');
    }

    const activityDateStr = createActivityDto.activityDate.split('T')[0];
    const [year, month, day] = activityDateStr.split('-').map(Number);
    const activityDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);
    const todayDate = new Date(
      Date.UTC(todayYear, todayMonth - 1, todayDay, 23, 59, 59, 999),
    );

    if (activityDate > todayDate) {
      throw new BadRequestException(
        'La fecha de la actividad no puede ser futura',
      );
    }

    const isHoliday = await this.holidaysService.isHoliday(activityDateStr);
    if (isHoliday) {
      throw new BadRequestException(
        'No se pueden registrar actividades en días festivos',
      );
    }

    const existingActivities = await this.practiceActivityModel
      .find({
        practiceProfessionalId: practice._id,
        status: {
          $in: [ActivityStatus.APPROVED, ActivityStatus.PENDING_APPROVAL],
        },
      })
      .lean()
      .exec();

    const activitiesOnSameDate = existingActivities.filter((activity) => {
      const actDate = new Date(activity.activityDate);
      return actDate.toISOString().split('T')[0] === activityDateStr;
    });

    const dailyHours = activitiesOnSameDate.reduce(
      (sum, a) => sum + (a.hours || 0),
      0,
    );

    if (dailyHours + createActivityDto.hours > 8) {
      throw new BadRequestException(
        `No puedes registrar más de 8 horas por día. Ya tienes ${dailyHours} horas registradas en esta fecha.`,
      );
    }

    const dayOfWeek = activityDate.getUTCDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(
      Date.UTC(
        activityDate.getUTCFullYear(),
        activityDate.getUTCMonth(),
        activityDate.getUTCDate() - daysToMonday,
        0,
        0,
        0,
        0,
      ),
    );
    const weekEnd = new Date(
      Date.UTC(
        weekStart.getUTCFullYear(),
        weekStart.getUTCMonth(),
        weekStart.getUTCDate() + 6,
        23,
        59,
        59,
        999,
      ),
    );

    const activitiesInSameWeek = existingActivities.filter((activity) => {
      const actDateStr = new Date(activity.activityDate)
        .toISOString()
        .split('T')[0];
      const [y, m, d] = actDateStr.split('-').map(Number);
      const normalized = new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
      return normalized >= weekStart && normalized <= weekEnd;
    });

    const weeklyHours = activitiesInSameWeek.reduce(
      (sum, a) => sum + (a.hours || 0),
      0,
    );

    if (weeklyHours + createActivityDto.hours > 40) {
      throw new BadRequestException(
        `No puedes registrar más de 40 horas por semana. Ya tienes ${weeklyHours} horas registradas esta semana.`,
      );
    }

    const activity = new this.practiceActivityModel({
      practiceProfessionalId: practice._id,
      description: createActivityDto.description,
      activityDate: new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)),
      hours: createActivityDto.hours,
      equipmentOrTool: createActivityDto.equipmentOrTool,
      status: ActivityStatus.PENDING_APPROVAL,
    });

    const savedActivity = await activity.save();
    return this.mapActivityToDto(savedActivity);
  }

  async getActivities(userId: string, page = 1, limit = 20) {
    const practice = await this.practiceProfessionalModel
      .findOne({ studentId: new Types.ObjectId(userId), finalizedAt: null })
      .exec();

    if (!practice) {
      throw new NotFoundException('No tienes una práctica profesional activa');
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.practiceActivityModel
        .find({ practiceProfessionalId: practice._id })
        .sort({ activityDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.practiceActivityModel
        .countDocuments({ practiceProfessionalId: practice._id })
        .exec(),
    ]);

    return {
      data: activities.map((a) => this.mapActivityToDto(a)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStudentActivities(
    studentId: string,
    companyUserId: string,
    page = 1,
    limit = 20,
  ): Promise<ActivitiesResponseDto> {
    const studentUserId = await this.resolveStudentUserId(studentId);

    const practice = await this.practiceProfessionalModel
      .findOne({ studentId: studentUserId, })
      .populate({
        path: 'opportunity',
        select: 'companyId responsibleUserId title description activities',
      })
      .exec();

    if (!practice) {
      throw new NotFoundException(
        'El estudiante no tiene una práctica profesional activa',
      );
    }

    const opportunity = practice.opportunity!;
    await this.verifyCompanyAccess(opportunity, companyUserId);

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.practiceActivityModel
        .find({ practiceProfessionalId: practice._id })
        .sort({ activityDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.practiceActivityModel
        .countDocuments({ practiceProfessionalId: practice._id })
        .exec(),
    ]);

    const data = await Promise.all(
      activities.map(async (activity) => {
        const evaluation =
          activity.status === ActivityStatus.PENDING_APPROVAL
            ? await this.evaluateActivityRelevance(
                activity.description,
                opportunity.title || '',
                opportunity.description || '',
                opportunity.activities || '',
              )
            : undefined;

        return this.mapActivityToDto(activity, evaluation);
      }),
    );

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private async evaluateActivityRelevance(
    activityDescription: string,
    opportunityTitle: string,
    opportunityDescription: string,
    opportunityActivities: string,
  ): Promise<{ type: 'warning' | 'approval'; message: string }> {
    const apiKey = this.configService.get<string>('openai.apiKey');
    if (!apiKey) {
      return {
        type: 'approval',
        message:
          'La actividad reportada está alineada con los objetivos y requerimientos de la oportunidad de práctica profesional.',
      };
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `Eres un experto en evaluación de actividades de práctica profesional.

Evalúa si la actividad reportada por el estudiante está relacionada con la oportunidad de práctica profesional a la cual pertenece.

ACTIVIDAD REPORTADA POR EL ESTUDIANTE:
${activityDescription}

OPORTUNIDAD DE PRÁCTICA PROFESIONAL:
- Título: ${opportunityTitle}
- Descripción: ${opportunityDescription || 'No especificada'}
- Actividades requeridas: ${opportunityActivities || 'No especificadas'}

INSTRUCCIONES:
1. Evalúa si la actividad reportada tiene relación con la oportunidad de práctica profesional
2. Considera si la actividad es relevante para el tipo de trabajo, las actividades requeridas y la descripción de la oportunidad
3. Responde con uno de estos dos tipos:
   - Si la actividad NO tiene relación o tiene muy poca relación: responde con tipo "warning" y mensaje "La actividad reportada no guarda relación con los objetivos y actividades definidas en la oportunidad de práctica profesional."
   - Si la actividad SÍ tiene relación y hace sentido: responde con tipo "approval" y mensaje "La actividad reportada está alineada con los objetivos y requerimientos de la oportunidad de práctica profesional."

Responde SOLO con un JSON válido en este formato exacto:
{
  "type": "warning" o "approval",
  "message": "el mensaje correspondiente"
}

No incluyas ningún texto adicional, solo el JSON.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Eres un experto en evaluación de actividades de práctica profesional. Evalúa objetivamente si las actividades reportadas están relacionadas con las oportunidades de práctica. Responde solo con JSON válido.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        return {
          type: 'approval',
          message:
            'La actividad reportada está alineada con los objetivos y requerimientos de la oportunidad de práctica profesional.',
        };
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const evaluation = JSON.parse(jsonMatch[0]);
        if (evaluation.type === 'warning' || evaluation.type === 'approval') {
          return {
            type: evaluation.type,
            message:
              evaluation.message ||
              (evaluation.type === 'warning'
                ? 'La actividad reportada no guarda relación con los objetivos y actividades definidas en la oportunidad de práctica profesional.'
                : 'La actividad reportada está alineada con los objetivos y requerimientos de la oportunidad de práctica profesional.'),
          };
        }
      }

      const activityLower = activityDescription.toLowerCase();
      const opportunityText =
        `${opportunityTitle} ${opportunityDescription} ${opportunityActivities}`.toLowerCase();
      const commonWords = activityLower
        .split(/\s+/)
        .filter((w) => w.length > 3)
        .some((w) => opportunityText.includes(w));

      return {
        type: commonWords ? 'approval' : 'warning',
        message: commonWords
          ? 'La actividad reportada está alineada con los objetivos y requerimientos de la oportunidad de práctica profesional.'
          : 'La actividad reportada no guarda relación con los objetivos y actividades definidas en la oportunidad de práctica profesional.',
      };
    } catch (error) {
      console.error('Error evaluando actividad con OpenAI:', error);
      return {
        type: 'approval',
        message:
          'La actividad reportada está alineada con los objetivos y requerimientos de la oportunidad de práctica profesional.',
      };
    }
  }

  async updateActivityStatus(
    activityId: string,
    companyUserId: string,
    updateDto: UpdateActivityStatusDto,
  ): Promise<ActivityResponseDto> {
    const activity = await this.practiceActivityModel
      .findById(activityId)
      .exec();

    if (!activity) {
      throw new NotFoundException('Actividad no encontrada');
    }

    const practice = await this.practiceProfessionalModel
      .findById(activity.practiceProfessionalId)
      .populate({
        path: 'opportunity',
        select: 'companyId responsibleUserId',
      })
      .exec();

    if (!practice) {
      throw new NotFoundException('Práctica profesional no encontrada');
    }

    await this.verifyCompanyAccess(practice.opportunity!, companyUserId);

    if (
      updateDto.status === ActivityStatus.REJECTED &&
      (!updateDto.rejectionReason || updateDto.rejectionReason.trim() === '')
    ) {
      throw new BadRequestException(
        'La razón de rechazo es requerida cuando se rechaza una actividad',
      );
    }

    activity.status = updateDto.status;
    if (updateDto.rejectionReason) {
      activity.rejectionReason = updateDto.rejectionReason;
    } else if (updateDto.status !== ActivityStatus.REJECTED) {
      activity.rejectionReason = undefined;
    }

    const savedActivity = await activity.save();
    return this.mapActivityToDto(savedActivity);
  }

  async getStudentDetailForCompany(studentId: string, companyUserId: string) {
    const studentUserId = await this.resolveStudentUserId(studentId);

    const practice = await this.practiceProfessionalModel
      .findOne({ studentId: studentUserId })
      .populate({
        path: 'opportunity',
        populate: [
          { path: 'career', select: 'name code' },
          { path: 'company', select: 'name logo' },
        ],
      })
      .populate('application')
      .exec();

    if (!practice) {
      throw new NotFoundException(
        'El estudiante no tiene una práctica profesional activa',
      );
    }

    await this.verifyCompanyAccess(practice.opportunity!, companyUserId);

    const transformedStudent = await this.studentsService.findOne(studentId);

    const approvedActivities = await this.practiceActivityModel
      .find({
        practiceProfessionalId: practice._id,
        status: ActivityStatus.APPROVED,
      })
      .select('hours')
      .lean()
      .exec();

    const approvedHours = approvedActivities.reduce(
      (sum, a) => sum + (a.hours || 0),
      0,
    );

    return {
      student: transformedStudent,
      application: practice.application,
      opportunity: practice.opportunity,
      practiceProfessional: practice,
      approvedHours,
    };
  }

  async finishPracticeProfessional(
    studentId: string,
    companyUserId: string,
    finishDto: {
      earlyTerminationReason?: string;
      evaluation: {
        qualityAndOrganization: number;
        knowledgeAndApplication: number;
        learningCapacity: number;
        attendanceAndPunctuality: number;
        initiativeAndJudgment: number;
      };
    },
  ): Promise<{ message: string }> {
    const studentUserId = await this.resolveStudentUserId(studentId);

    const practice = await this.practiceProfessionalModel
      .findOne({ studentId: studentUserId, finalizedAt: null })
      .populate({ path: 'opportunity', select: 'companyId totalHours' })
      .exec();

    if (!practice) {
      throw new NotFoundException(
        'El estudiante no tiene una práctica profesional activa',
      );
    }

    const opportunity = practice.opportunity!;
    const opportunityCompanyId = opportunity.companyId.toString();
    const userCompanyId = await this.getCompanyIdByUserId(companyUserId);

    if (opportunityCompanyId !== userCompanyId) {
      throw new BadRequestException(
        'No tienes permiso para finalizar la práctica profesional de este estudiante',
      );
    }

    const approvedActivities = await this.practiceActivityModel
      .find({
        practiceProfessionalId: practice._id,
        status: ActivityStatus.APPROVED,
      })
      .select('hours')
      .lean()
      .exec();

    const approvedHours = approvedActivities.reduce(
      (sum, a) => sum + (a.hours || 0),
      0,
    );

    const requiredHours = opportunity.totalHours || 0;

    if (approvedHours < requiredHours) {
      if (
        !finishDto.earlyTerminationReason ||
        finishDto.earlyTerminationReason.trim() === ''
      ) {
        throw new BadRequestException(
          'Debes proporcionar un motivo para finalizar la práctica profesional antes de completar las horas requeridas.',
        );
      }
      practice.earlyTerminationReason = finishDto.earlyTerminationReason.trim();
    }

    practice.practiceEvaluation = { ...finishDto.evaluation };
    practice.finalizedAt = new Date();
    practice.status = PracticeStatus.FINALIZADA;
    await practice.save();

    return { message: 'Práctica profesional finalizada exitosamente' };
  }

  async getPracticeHistory(
    userId: string,
  ): Promise<PracticeHistoryResponseDto> {
    const practices = await this.practiceProfessionalModel
      .find({ studentId: new Types.ObjectId(userId) })
      .populate({
        path: 'opportunity',
        populate: [
          { path: 'career', select: 'name code' },
          { path: 'company', select: 'name logo' },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();

    const historyItems: PracticeHistoryItemDto[] = await Promise.all(
      practices.map(async (practice) => {
        const opportunity = practice.opportunity!;

        const activities = await this.practiceActivityModel
          .find({ practiceProfessionalId: practice._id })
          .sort({ activityDate: 1 })
          .lean()
          .exec();

        const totalHours = activities.reduce(
          (sum, a) => sum + (a.hours || 0),
          0,
        );
        const approvedHours = activities
          .filter((a) => a.status === ActivityStatus.APPROVED)
          .reduce((sum, a) => sum + (a.hours || 0), 0);

        const requiredHours = opportunity.totalHours || 0;

        let endDate: Date | undefined;
        let status: PracticeStatus;

        if (practice.finalizedAt) {
          status = PracticeStatus.FINALIZADA;
          endDate = practice.finalizedAt;
        } else if (approvedHours >= requiredHours && requiredHours > 0) {
          status = PracticeStatus.FINALIZADA;
          const lastApproved = activities
            .filter((a) => a.status === ActivityStatus.APPROVED)
            .sort(
              (a, b) =>
                new Date(b.activityDate).getTime() -
                new Date(a.activityDate).getTime(),
            )[0];
          if (lastApproved) endDate = new Date(lastApproved.activityDate);
        } else {
          status = PracticeStatus.EN_CURSO;
        }

        const companyName =
          opportunity.company?.name ?? 'Empresa no especificada';
        const companyLogo = opportunity.company?.logo;

        return {
          practiceId: practice._id.toString(),
          applicationId: practice.applicationId.toString(),
          opportunityId: opportunity._id.toString(),
          opportunityTitle: opportunity.title || 'Sin título',
          companyName,
          companyLogo,
          startDate: practice.startDate,
          endDate,
          totalHours,
          approvedHours,
          requiredHours,
          status,
        };
      }),
    );

    return { data: historyItems, total: historyItems.length };
  }

  async getPracticeProfessionalById(
    practiceId: string,
    userId: string,
  ): Promise<PracticeProfessionalResponseDto> {
    const practice = await this.practiceProfessionalModel
      .findOne({
        _id: new Types.ObjectId(practiceId),
        studentId: new Types.ObjectId(userId),
      })
      .populate({
        path: 'opportunity',
        populate: [
          { path: 'career', select: 'name code' },
          { path: 'company', select: 'name logo' },
        ],
      })
      .populate('application')
      .exec();

    if (!practice) {
      throw new NotFoundException(
        'Práctica profesional no encontrada o no tienes acceso a ella',
      );
    }

    const opportunity = practice.opportunity!;
    const application = practice.application!;

    const activities = await this.practiceActivityModel
      .find({ practiceProfessionalId: practice._id })
      .sort({ activityDate: -1, createdAt: -1 })
      .exec();

    const totalHours = activities.reduce((sum, a) => sum + (a.hours || 0), 0);
    const approvedHours = activities
      .filter((a) => a.status === ActivityStatus.APPROVED)
      .reduce((sum, a) => sum + (a.hours || 0), 0);

    return {
      application: {
        _id: application._id.toString(),
        opportunityId: practice.opportunityId.toString(),
        studentId: application.studentId.toString(),
        coverLetter: application.coverLetter,
        status: application.status,
        rejectionReason: application.rejectionReason,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
      },
      opportunity: this.mapOpportunity(opportunity),
      activities: activities.map((a) => this.mapActivityToDto(a)),
      totalHours,
      approvedHours,
      status: practice.status,
      practiceEvaluation: practice.practiceEvaluation,
    };
  }
}
