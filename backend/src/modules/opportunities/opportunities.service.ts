import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import {
  Opportunity,
  OpportunityDocument,
  OpportunityStatus,
} from '@/modules/opportunities/schemas/opportunity.schema';
import {
  Application,
  ApplicationDocument,
  ApplicationStatus,
} from '@/modules/opportunities/schemas/application.schema';
import {
  SavedOpportunity,
  SavedOpportunityDocument,
} from '@/modules/opportunities/schemas/saved-opportunity.schema';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import {
  Student,
  StudentDocument,
} from '@/modules/students/schemas/student.schema';
import { CreateOpportunityDto } from '@/modules/opportunities/dto/create-opportunity.dto';
import { UpdateOpportunityDto } from '@/modules/opportunities/dto/update-opportunity.dto';
import { UpdateApplicationStatusDto } from '@/modules/opportunities/dto/update-application-status.dto';
import {
  PracticeProfessional,
  PracticeProfessionalDocument,
} from '@/modules/practice-professional/schemas/practice-professional.schema';
import OpenAI from 'openai';

@Injectable()
export class OpportunitiesService {
  private transformStudentWithCareer(student: Record<string, unknown>) {
    const careerIdValue = student.careerId;
    const career =
      careerIdValue &&
      typeof careerIdValue === 'object' &&
      careerIdValue !== null &&
      !(careerIdValue instanceof Types.ObjectId)
        ? (careerIdValue as {
            _id?: Types.ObjectId;
            name?: string;
            code?: string;
          })
        : null;

    return {
      ...student,
      career,
      careerId:
        career?._id?.toString() ||
        (careerIdValue instanceof Types.ObjectId
          ? careerIdValue.toString()
          : typeof careerIdValue === 'string'
            ? careerIdValue
            : null),
    };
  }

  constructor(
    @InjectModel(Opportunity.name)
    private opportunityModel: Model<OpportunityDocument>,
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(SavedOpportunity.name)
    private savedOpportunityModel: Model<SavedOpportunityDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(PracticeProfessional.name)
    private practiceProfessionalModel: Model<PracticeProfessionalDocument>,
    private configService: ConfigService,
  ) {}

  private async getCompanyIdByUserId(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (!user.companyId) {
      throw new BadRequestException(
        'No tienes una empresa asociada. Por favor, crea tu empresa primero usando el endpoint POST /companies/my-company',
      );
    }
    return user.companyId.toString();
  }

  async create(createOpportunityDto: CreateOpportunityDto, userId: string) {
    const companyId = await this.getCompanyIdByUserId(userId);
    const shareToken = crypto.randomBytes(32).toString('hex');

    const opportunity = new this.opportunityModel({
      title: createOpportunityDto.title,
      description: createOpportunityDto.description,
      activities: createOpportunityDto.activities,
      careerId: new Types.ObjectId(createOpportunityDto.careerId),
      companyId: new Types.ObjectId(companyId),
      responsibleUserId: createOpportunityDto.responsibleUserId
        ? new Types.ObjectId(createOpportunityDto.responsibleUserId)
        : undefined,
      totalHours: createOpportunityDto.totalHours,
      availablePositions: createOpportunityDto.availablePositions || 1,
      modality: createOpportunityDto.modality,
      workType: createOpportunityDto.workType,
      expirationDate: createOpportunityDto.expirationDate
        ? new Date(createOpportunityDto.expirationDate)
        : undefined,
      status: createOpportunityDto.status || OpportunityStatus.ACTIVE,
      shareToken,
    });

    const savedOpportunity = await opportunity.save();
    return this.findOne(savedOpportunity._id.toString(), userId);
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
  ) {
    const companyId = await this.getCompanyIdByUserId(userId);
    const skip = (page - 1) * limit;
    const query: {
      companyId: Types.ObjectId;
      $or?: Array<{
        title?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
      }>;
      status?: string;
    } = {
      companyId: new Types.ObjectId(companyId),
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const [data, total] = await Promise.all([
      this.opportunityModel
        .find(query)
        .populate('career', 'name code')
        .populate('responsibleUserId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.opportunityModel.countDocuments(query).exec(),
    ]);

    const frontendUrl = this.configService.get<string>('frontendUrl') || '';

    const dataWithShareLinks = data.map((opp) => {
      const oppObj = opp.toObject();
      return {
        ...oppObj,
        career: oppObj.career,
        responsibleUser: oppObj.responsibleUserId,
        shareLink: opp.shareToken
          ? `${frontendUrl}/opportunities/${opp.shareToken}`
          : undefined,
      };
    });

    return {
      data: dataWithShareLinks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllForAdmin(
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
    careerId?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: {
      $or?: Array<{
        title?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
      }>;
      status?: string;
      careerId?: Types.ObjectId;
    } = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (careerId) {
      query.careerId = new Types.ObjectId(careerId);
    }

    const [data, total] = await Promise.all([
      this.opportunityModel
        .find(query)
        .populate('career', 'name code')
        .populate('company', 'name logo nit')
        .populate('responsibleUserId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.opportunityModel.countDocuments(query).exec(),
    ]);

    const opportunityIds = data.map((opp) => new Types.ObjectId(opp._id));
    const applicationsCount = await this.applicationModel
      .aggregate([
        {
          $match: {
            opportunityId: { $in: opportunityIds },
          },
        },
        {
          $group: {
            _id: '$opportunityId',
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    const applicationsCountMap = new Map(
      applicationsCount.map((item) => [
        item._id.toString(),
        item.count,
      ]),
    );

    const frontendUrl = this.configService.get<string>('frontendUrl') || '';

    const dataWithShareLinks = data.map((opp) => {
      const oppObj = opp.toObject();
      const applicationsCount = applicationsCountMap.get(opp._id.toString()) || 0;
      return {
        ...oppObj,
        career: oppObj.career,
        company: oppObj.company,
        responsibleUser: oppObj.responsibleUserId,
        applicationsCount,
        shareLink: opp.shareToken
          ? `${frontendUrl}/opportunities/${opp.shareToken}`
          : undefined,
      };
    });

    return {
      data: dataWithShareLinks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string) {
    const query: { _id: Types.ObjectId; companyId?: Types.ObjectId } = {
      _id: new Types.ObjectId(id),
    };

    if (userId) {
      const companyId = await this.getCompanyIdByUserId(userId);
      query.companyId = new Types.ObjectId(companyId);
    }

    const opportunity = await this.opportunityModel
      .findOne(query)
      .populate('career', 'name code')
      .populate(
        'company',
        'name logo nit address phone email sector description status isActive',
      )
      .populate('responsibleUserId', 'name email')
      .exec();

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    const frontendUrl = this.configService.get<string>('frontendUrl') || '';

    const opportunityObj = opportunity.toObject();
    return {
      ...opportunityObj,
      career: opportunityObj.career,
      company: opportunityObj.company,
      responsibleUser: opportunityObj.responsibleUserId,
      shareLink: opportunity.shareToken
        ? `${frontendUrl}/opportunities/${opportunity.shareToken}`
        : undefined,
    };
  }

  async findOneForAdmin(id: string) {
    const opportunity = await this.opportunityModel
      .findOne({ _id: new Types.ObjectId(id) })
      .populate('career', 'name code')
      .populate(
        'company',
        'name logo nit address phone email sector description status isActive',
      )
      .populate('responsibleUserId', 'name email')
      .exec();

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    const frontendUrl = this.configService.get<string>('frontendUrl') || '';

    const opportunityObj = opportunity.toObject();
    return {
      ...opportunityObj,
      career: opportunityObj.career,
      company: opportunityObj.company,
      responsibleUser: opportunityObj.responsibleUserId,
      shareLink: opportunity.shareToken
        ? `${frontendUrl}/opportunities/${opportunity.shareToken}`
        : undefined,
    };
  }

  async findByShareToken(shareToken: string) {
    const opportunity = await this.opportunityModel
      .findOne({ shareToken, isActive: true, status: OpportunityStatus.ACTIVE })
      .populate('career', 'name code')
      .populate('company', 'name logo')
      .populate('responsibleUserId', 'name email')
      .exec();

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada o no disponible');
    }

    const opportunityObj = opportunity.toObject();
    return {
      ...opportunityObj,
      career: opportunityObj.career,
    };
  }

  async update(
    id: string,
    updateOpportunityDto: UpdateOpportunityDto,
    userId: string,
  ) {
    const companyId = await this.getCompanyIdByUserId(userId);
    const opportunity = await this.opportunityModel
      .findOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    const updateData: {
      title?: string;
      description?: string;
      activities?: string;
      careerId?: Types.ObjectId;
      responsibleUserId?: Types.ObjectId;
      totalHours?: number;
      availablePositions?: number;
      modality?: string;
      workType?: string;
      expirationDate?: Date;
      status?: OpportunityStatus;
      isActive?: boolean;
    } = {
      title: updateOpportunityDto.title,
      description: updateOpportunityDto.description,
      activities: updateOpportunityDto.activities,
      totalHours: updateOpportunityDto.totalHours,
      availablePositions: updateOpportunityDto.availablePositions,
      modality: updateOpportunityDto.modality,
      workType: updateOpportunityDto.workType,
      status: updateOpportunityDto.status,
      isActive: updateOpportunityDto.isActive,
    };

    if (updateOpportunityDto.careerId) {
      updateData.careerId = new Types.ObjectId(updateOpportunityDto.careerId);
    }

    if (updateOpportunityDto.responsibleUserId) {
      updateData.responsibleUserId = new Types.ObjectId(
        updateOpportunityDto.responsibleUserId,
      );
    }

    if (updateOpportunityDto.expirationDate) {
      updateData.expirationDate = new Date(updateOpportunityDto.expirationDate);
    }

    const updatedOpportunity = await this.opportunityModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .populate('career', 'name code')
      .populate('company', 'name logo')
      .populate('responsibleUserId', 'name email')
      .exec();

    if (!updatedOpportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    const frontendUrl = this.configService.get<string>('frontendUrl') || '';

    const opportunityObj = updatedOpportunity.toObject();
    return {
      ...opportunityObj,
      career: opportunityObj.career,
      shareLink: updatedOpportunity.shareToken
        ? `${frontendUrl}/opportunities/${updatedOpportunity.shareToken}`
        : undefined,
    };
  }

  async remove(id: string, userId: string) {
    const companyId = await this.getCompanyIdByUserId(userId);
    const opportunity = await this.opportunityModel
      .findOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    const applicationsCount = await this.applicationModel.countDocuments({
      opportunityId: new Types.ObjectId(id),
    });

    if (applicationsCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar la oportunidad porque tiene aplicaciones asociadas',
      );
    }

    await this.opportunityModel.findByIdAndDelete(id).exec();
    return { message: 'Oportunidad eliminada exitosamente' };
  }

  async getApplicationsByOpportunity(opportunityId: string, userId: string) {
    const companyId = await this.getCompanyIdByUserId(userId);
    const opportunity = await this.opportunityModel
      .findOne({
        _id: new Types.ObjectId(opportunityId),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    const applications = await this.getApplicationsByOpportunityInternal(
      opportunityId,
    );

    // Evaluar automáticamente aplicaciones sin calificación (en segundo plano)
    this.evaluateApplicationsWithoutScore(applications, companyId).catch(
      (error) => {
        console.error('Error evaluando aplicaciones automáticamente:', error);
      },
    );

    return applications;
  }

  async getApplicationsByOpportunityForAdmin(opportunityId: string) {
    const opportunity = await this.opportunityModel
      .findOne({
        _id: new Types.ObjectId(opportunityId),
      })
      .exec();

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    return this.getApplicationsByOpportunityInternal(opportunityId);
  }

  private async getApplicationsByOpportunityInternal(opportunityId: string) {
    const applications = await this.applicationModel
      .find({ opportunityId: new Types.ObjectId(opportunityId) })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Map applications to include student information in the correct format
    return applications.map((app) => {
      const studentIdValue = app.studentId;
      let studentInfo: { _id: string; name: string; email: string } | undefined;
      let studentIdString = '';

      if (studentIdValue) {
        // Check if it's a populated object (has name and email properties)
        if (
          typeof studentIdValue === 'object' &&
          'name' in studentIdValue &&
          'email' in studentIdValue
        ) {
          // Populated student object
          const studentObj = studentIdValue as unknown as {
            _id: Types.ObjectId | string;
            name: string;
            email: string;
          };
          studentIdString =
            typeof studentObj._id === 'string'
              ? studentObj._id
              : studentObj._id.toString();
          studentInfo = {
            _id: studentIdString,
            name: studentObj.name || '',
            email: studentObj.email || '',
          };
        } else {
          // Just ObjectId or string, not populated
          if (typeof studentIdValue === 'string') {
            studentIdString = studentIdValue;
          } else if (studentIdValue instanceof Types.ObjectId) {
            studentIdString = studentIdValue.toString();
          } else if (
            studentIdValue &&
            typeof studentIdValue === 'object' &&
            '_id' in studentIdValue
          ) {
            // Handle case where it might be an object with _id
            const idValue = (studentIdValue as { _id: Types.ObjectId | string })
              ._id;
            studentIdString =
              typeof idValue === 'string' ? idValue : idValue.toString();
          } else {
            studentIdString = String(studentIdValue);
          }
        }
      }

      // Ensure studentIdString is always a valid string
      if (!studentIdString || studentIdString === '[object Object]') {
        console.error(
          'Invalid studentIdString generated:',
          studentIdValue,
          studentIdString,
        );
        // Try to get from studentInfo if available
        if (studentInfo?._id) {
          studentIdString = studentInfo._id;
        }
      }

      const matchScoreValue =
        app.matchScore !== undefined && app.matchScore !== null
          ? (app.matchScore as number)
          : undefined;

      return {
        ...app,
        studentId: studentIdString || '',
        student: studentInfo,
        matchScore: matchScoreValue,
      };
    });
  }

  async updateApplicationStatus(
    applicationId: string,
    updateStatusDto: UpdateApplicationStatusDto,
    userId: string,
  ) {
    const companyId = await this.getCompanyIdByUserId(userId);
    const application = await this.applicationModel
      .findById(applicationId)
      .populate({
        path: 'opportunityId',
        populate: { path: 'company' },
      })
      .exec();

    if (!application) {
      throw new NotFoundException('Aplicación no encontrada');
    }

    const opportunity = await this.opportunityModel.findById(
      application.opportunityId,
    );

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    if (opportunity.companyId.toString() !== companyId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta aplicación',
      );
    }

    if (updateStatusDto.status === ApplicationStatus.REJECTED) {
      if (!updateStatusDto.rejectionReason) {
        throw new BadRequestException(
          'La razón de rechazo es requerida cuando se rechaza una aplicación',
        );
      }
    }

    // Cuando la empresa acepta, debe cambiar a "aprobada" en lugar de "aceptada"
    if (updateStatusDto.status === ApplicationStatus.ACCEPTED) {
      // Cambiar a "aprobada" cuando la empresa acepta
      updateStatusDto.status = ApplicationStatus.APPROVED;
    }

    if (updateStatusDto.status === ApplicationStatus.APPROVED) {
      if (application.status === ApplicationStatus.APPROVED) {
        throw new BadRequestException('Esta aplicación ya está aprobada');
      }

      if (opportunity.status === OpportunityStatus.CLOSED) {
        throw new BadRequestException(
          'No se pueden aprobar más aplicaciones. La oportunidad está cerrada.',
        );
      }
    }

    const updateData: {
      status: ApplicationStatus;
      rejectionReason?: string;
    } = {
      status: updateStatusDto.status,
    };

    if (
      updateStatusDto.status === ApplicationStatus.REJECTED &&
      updateStatusDto.rejectionReason
    ) {
      updateData.rejectionReason = updateStatusDto.rejectionReason;
    }

    const updatedApplication = await this.applicationModel
      .findByIdAndUpdate(applicationId, updateData, {
        new: true,
        runValidators: true,
      })
      .populate('studentId', 'name email')
      .populate('opportunityId')
      .exec();

    return updatedApplication;
  }

  async acceptApplicationByCoordinator(
    applicationId: string,
    userId: string,
    careerId: string,
  ) {
    const application = await this.applicationModel
      .findById(applicationId)
      .populate({
        path: 'opportunityId',
        populate: { path: 'career' },
      })
      .exec();

    if (!application) {
      throw new NotFoundException('Aplicación no encontrada');
    }

    const opportunity = await this.opportunityModel.findById(
      application.opportunityId,
    );

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    // Verificar que el estudiante pertenezca a la carrera del coordinador
    // Nota: studentId en Application es userId, no student._id
    const student = await this.studentModel
      .findOne({ userId: application.studentId })
      .exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const studentCareerId =
      student.careerId instanceof Types.ObjectId
        ? student.careerId.toString()
        : typeof student.careerId === 'object' &&
            student.careerId !== null &&
            '_id' in student.careerId
          ? (student.careerId as { _id: Types.ObjectId | string })._id
              instanceof Types.ObjectId
            ? (student.careerId as { _id: Types.ObjectId })._id.toString()
            : String((student.careerId as { _id: string })._id)
          : String(student.careerId);

    if (studentCareerId !== careerId) {
      throw new ForbiddenException(
        'No tienes permiso para aceptar esta aplicación. Solo puedes aceptar solicitudes de estudiantes de tu carrera.',
      );
    }

    if (application.status === ApplicationStatus.ACCEPTED) {
      throw new BadRequestException('Esta aplicación ya está aceptada');
    }

    if (opportunity.status === OpportunityStatus.CLOSED) {
      throw new BadRequestException(
        'No se pueden aceptar más aplicaciones. La oportunidad está cerrada.',
      );
    }

    // Solo se pueden aceptar solicitudes que estén en estado "aprobada"
    if (application.status !== ApplicationStatus.APPROVED) {
      throw new BadRequestException(
        'Solo se pueden aceptar solicitudes que estén en estado aprobada',
      );
    }

    // Verificar que el estudiante no tenga otra solicitud aceptada
    const otherAcceptedApplication = await this.applicationModel
      .findOne({
        studentId: application.studentId,
        status: ApplicationStatus.ACCEPTED,
        _id: { $ne: application._id },
      })
      .exec();

    if (otherAcceptedApplication) {
      throw new BadRequestException(
        'Este estudiante ya tiene una solicitud aceptada. Solo puede tener una solicitud aceptada a la vez.',
      );
    }

    const acceptedCount = await this.applicationModel.countDocuments({
      opportunityId: opportunity._id,
      status: ApplicationStatus.ACCEPTED,
    });

    if (acceptedCount >= opportunity.availablePositions) {
      throw new BadRequestException(
        `Ya se han aceptado todas las vacantes disponibles (${acceptedCount}/${opportunity.availablePositions}). No se pueden aceptar más aplicaciones.`,
      );
    }

    const updatedApplication = await this.applicationModel
      .findByIdAndUpdate(
        applicationId,
        { status: ApplicationStatus.ACCEPTED },
        {
          new: true,
          runValidators: true,
        },
      )
      .populate('studentId', 'name email')
      .populate('opportunityId')
      .exec();

    const opportunityObjectId =
      application.opportunityId instanceof Types.ObjectId
        ? application.opportunityId
        : new Types.ObjectId(
            String(
              (application.opportunityId as unknown as { _id: Types.ObjectId })
                ._id ?? application.opportunityId,
            ),
          );

    await this.practiceProfessionalModel.create({
      applicationId: application._id,
      studentId: application.studentId,
      opportunityId: opportunityObjectId,
      startDate: new Date(),
    });

    // Rechazar automáticamente todas las demás aplicaciones pendientes y aprobadas del mismo estudiante
    await this.applicationModel.updateMany(
      {
        studentId: application.studentId,
        status: {
          $in: [
            ApplicationStatus.PENDING,
            ApplicationStatus.APPROVED,
          ],
        },
        _id: { $ne: application._id },
      },
      {
        status: ApplicationStatus.REJECTED,
        rejectionReason: 'Este estudiante ha sido aceptado en otra solicitud',
      },
    );

    const finalAcceptedCount = await this.applicationModel.countDocuments({
      opportunityId: opportunity._id,
      status: ApplicationStatus.ACCEPTED,
    });

    if (finalAcceptedCount >= opportunity.availablePositions) {
      await this.opportunityModel.findByIdAndUpdate(
        opportunity._id,
        {
          status: OpportunityStatus.CLOSED,
        },
        { new: true },
      );
    }

    return updatedApplication;
  }

  async evaluateApplicationMatch(applicationId: string, userId: string) {
    const companyId = await this.getCompanyIdByUserId(userId);
    const application = await this.applicationModel
      .findById(applicationId)
      .exec();

    if (!application) {
      throw new NotFoundException('Aplicación no encontrada');
    }

    const opportunityId =
      application.opportunityId instanceof Types.ObjectId
        ? application.opportunityId
        : new Types.ObjectId(
            String(application.opportunityId as unknown as string),
          );

    const opportunity = await this.opportunityModel.findById(opportunityId);

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    const opportunityCompanyId =
      opportunity.companyId instanceof Types.ObjectId
        ? opportunity.companyId.toString()
        : String((opportunity.companyId as unknown as string | Types.ObjectId) || '');

    if (opportunityCompanyId !== companyId) {
      throw new ForbiddenException(
        'No tienes permiso para evaluar esta aplicación',
      );
    }

    if (application.matchScore !== undefined && application.matchScore !== null) {
      throw new BadRequestException(
        'Esta aplicación ya tiene una calificación asignada',
      );
    }

    const student = await this.studentModel
      .findOne({ userId: application.studentId })
      .populate('careerId', 'name code')
      .lean()
      .exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const opportunityPopulated = await this.opportunityModel
      .findById(opportunity._id)
      .populate('career', 'name code')
      .lean()
      .exec();

    if (!opportunityPopulated) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    const apiKey = this.configService.get<string>('openai.apiKey');
    if (!apiKey) {
      throw new BadRequestException(
        'OpenAI API key no está configurada. No se puede evaluar la aplicación.',
      );
    }

    const openai = new OpenAI({ apiKey });

    const studentProfile = {
      firstName: student.firstName,
      lastName: student.lastName,
      career: (student.careerId as any)?.name || 'No especificada',
      workExperience: student.workExperience || [],
      education: student.education || [],
      skills: student.skills || [],
      professionalProfile: student.professionalProfile || {},
    };

    const opportunityInfo = {
      title: opportunityPopulated.title,
      description: opportunityPopulated.description || '',
      activities: opportunityPopulated.activities || '',
      career: (opportunityPopulated as any).career?.name || 'No especificada',
      totalHours: opportunityPopulated.totalHours,
      modality: opportunityPopulated.modality,
      workType: opportunityPopulated.workType,
    };

    const prompt = `Eres un experto en recursos humanos y evaluación de perfiles profesionales.

Evalúa qué tan bien coincide el perfil profesional del estudiante con los requisitos y características de la oportunidad de práctica profesional.

PERFIL DEL ESTUDIANTE:
- Nombre: ${studentProfile.firstName} ${studentProfile.lastName}
- Carrera: ${studentProfile.career}
- Experiencia laboral: ${JSON.stringify(studentProfile.workExperience)}
- Formación académica: ${JSON.stringify(studentProfile.education)}
- Habilidades: ${studentProfile.skills.join(', ') || 'No especificadas'}
- Resumen profesional: ${studentProfile.professionalProfile?.summary || 'No disponible'}
- Idiomas: ${JSON.stringify(studentProfile.professionalProfile?.languages || [])}
- Certificaciones: ${JSON.stringify(studentProfile.professionalProfile?.certifications || [])}
- Proyectos: ${JSON.stringify(studentProfile.professionalProfile?.projects || [])}

OPORTUNIDAD DE PRÁCTICA:
- Título: ${opportunityInfo.title}
- Descripción: ${opportunityInfo.description}
- Actividades requeridas: ${opportunityInfo.activities}
- Carrera requerida: ${opportunityInfo.career}
- Horas totales: ${opportunityInfo.totalHours}
- Modalidad: ${opportunityInfo.modality || 'No especificada'}
- Tipo de trabajo: ${opportunityInfo.workType || 'No especificado'}

INSTRUCCIONES:
1. Evalúa el match entre el perfil del estudiante y la oportunidad
2. Considera: experiencia relevante, habilidades técnicas, formación académica, proyectos, certificaciones, idiomas
3. Asigna una calificación de 1.0 a 5.0 (puedes usar decimales como 1.5, 2.5, 3.5, 4.5)
4. 1.0 = Muy bajo match, 3.0 = Match moderado, 5.0 = Match excelente
5. Sé objetivo y justo en tu evaluación

Responde SOLO con un número decimal entre 1.0 y 5.0 (puede incluir .5), sin texto adicional.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Eres un experto en recursos humanos especializado en evaluar la compatibilidad entre perfiles profesionales y oportunidades laborales. Evalúa objetivamente y proporciona solo un número decimal entre 1.0 y 5.0.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 50,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('No se recibió respuesta de OpenAI');
      }

      const matchScore = parseFloat(content);
      if (isNaN(matchScore) || matchScore < 1 || matchScore > 5) {
        throw new Error(
          `Calificación inválida recibida de OpenAI: ${content}. Debe ser un número entre 1.0 y 5.0`,
        );
      }

      const roundedScore = Math.round(matchScore * 2) / 2;

      const updatedApplication = await this.applicationModel
        .findByIdAndUpdate(
          applicationId,
          { matchScore: roundedScore },
          { new: true, runValidators: true },
        )
        .populate('studentId', 'name email')
        .populate('opportunityId')
        .exec();

      return updatedApplication;
    } catch (error: any) {
      console.error('Error evaluando aplicación con OpenAI:', error);
      throw new BadRequestException(
        `Error al evaluar la aplicación: ${error.message}`,
      );
    }
  }

  async toggleActiveStatus(id: string, userId: string) {
    const companyId = await this.getCompanyIdByUserId(userId);
    const opportunity = await this.opportunityModel
      .findOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    opportunity.isActive = !opportunity.isActive;
    await opportunity.save();

    const updatedOpportunity = await this.opportunityModel
      .findById(opportunity._id)
      .populate('career', 'name code')
      .populate('company', 'name logo')
      .populate('responsibleUserId', 'name email')
      .exec();

    if (!updatedOpportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    const frontendUrl = this.configService.get<string>('frontendUrl') || '';

    const opportunityObj = updatedOpportunity.toObject();
    return {
      ...opportunityObj,
      career: opportunityObj.career,
      responsibleUser: opportunityObj.responsibleUserId,
      shareLink: updatedOpportunity.shareToken
        ? `${frontendUrl}/opportunities/${updatedOpportunity.shareToken}`
        : undefined,
    };
  }

  async getStudentsWithApplications(
    userId: string,
    userRole: string,
    page = 1,
    limit = 10,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    let opportunityIds: Types.ObjectId[] = [];

    // Si es admin, obtener todas las oportunidades
    if (userRole === 'admin') {
      const allOpportunities = await this.opportunityModel
        .find()
        .select('_id')
        .lean()
        .exec();
      opportunityIds = allOpportunities.map((opp) => opp._id);
    } else {
      // Si es company, obtener solo las oportunidades de su empresa
      const companyId = await this.getCompanyIdByUserId(userId);
      const companyOpportunities = await this.opportunityModel
        .find({ companyId: new Types.ObjectId(companyId) })
        .select('_id')
        .lean()
        .exec();
      opportunityIds = companyOpportunities.map((opp) => opp._id);
    }

    if (opportunityIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Obtener solo las aplicaciones aceptadas a esas oportunidades
    const applications = await this.applicationModel
      .find({
        opportunityId: { $in: opportunityIds },
        status: ApplicationStatus.ACCEPTED,
      })
      .select('studentId')
      .lean()
      .exec();

    // Obtener IDs únicos de estudiantes
    const studentUserIds = [
      ...new Set(applications.map((app) => app.studentId.toString())),
    ].map((id) => new Types.ObjectId(id));

    if (studentUserIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Construir query para estudiantes
    const query: {
      userId: { $in: Types.ObjectId[] };
      $or?: Array<{
        firstName?: { $regex: string; $options: string };
        lastName?: { $regex: string; $options: string };
        email?: { $regex: string; $options: string };
        identificationNumber?: { $regex: string; $options: string };
      }>;
    } = {
      userId: { $in: studentUserIds },
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { identificationNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.studentModel
        .find(query)
        .populate('careerId', 'name code')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.studentModel.countDocuments(query).exec(),
    ]);

    const transformedData = data.map((student) =>
      this.transformStudentWithCareer(student as Record<string, unknown>),
    );

    return {
      data: transformedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Calcula el matchScore entre un estudiante y una oportunidad usando OpenAI.
   * Este método SIEMPRE calcula el score en tiempo real, sin usar valores guardados.
   * Se ejecuta cada vez que se carga la lista de oportunidades disponibles.
   */
  private async calculateStudentOpportunityMatch(
    student: StudentDocument,
    opportunity: OpportunityDocument,
  ): Promise<number | null> {
    try {
      const apiKey = this.configService.get<string>('openai.apiKey');
      if (!apiKey) {
        return null;
      }

      // Siempre crear una nueva instancia de OpenAI para asegurar evaluación fresca
      const openai = new OpenAI({ apiKey });

      const studentPopulated = await this.studentModel
        .findById(student._id)
        .populate('careerId', 'name code')
        .lean()
        .exec();

      if (!studentPopulated) {
        return null;
      }

      const opportunityPopulated = await this.opportunityModel
        .findById(opportunity._id)
        .populate('career', 'name code')
        .lean()
        .exec();

      if (!opportunityPopulated) {
        return null;
      }

      const studentProfile = {
        firstName: studentPopulated.firstName,
        lastName: studentPopulated.lastName,
        career: (studentPopulated.careerId as any)?.name || 'No especificada',
        workExperience: studentPopulated.workExperience || [],
        education: studentPopulated.education || [],
        skills: studentPopulated.skills || [],
        professionalProfile: studentPopulated.professionalProfile || {},
      };

      const opportunityInfo = {
        title: opportunityPopulated.title,
        description: opportunityPopulated.description || '',
        activities: opportunityPopulated.activities || '',
        career: (opportunityPopulated as any).career?.name || 'No especificada',
        totalHours: opportunityPopulated.totalHours,
        modality: opportunityPopulated.modality,
        workType: opportunityPopulated.workType,
      };

      const prompt = `Eres un experto en recursos humanos y evaluación de perfiles profesionales.

Evalúa qué tan bien coincide el perfil profesional del estudiante con los requisitos y características de la oportunidad de práctica profesional.

PERFIL DEL ESTUDIANTE:
- Nombre: ${studentProfile.firstName} ${studentProfile.lastName}
- Carrera: ${studentProfile.career}
- Experiencia laboral: ${JSON.stringify(studentProfile.workExperience)}
- Formación académica: ${JSON.stringify(studentProfile.education)}
- Habilidades: ${studentProfile.skills.join(', ') || 'No especificadas'}
- Resumen profesional: ${studentProfile.professionalProfile?.summary || 'No disponible'}
- Idiomas: ${JSON.stringify(studentProfile.professionalProfile?.languages || [])}
- Certificaciones: ${JSON.stringify(studentProfile.professionalProfile?.certifications || [])}
- Proyectos: ${JSON.stringify(studentProfile.professionalProfile?.projects || [])}

OPORTUNIDAD DE PRÁCTICA:
- Título: ${opportunityInfo.title}
- Descripción: ${opportunityInfo.description}
- Actividades requeridas: ${opportunityInfo.activities}
- Carrera requerida: ${opportunityInfo.career}
- Horas totales: ${opportunityInfo.totalHours}
- Modalidad: ${opportunityInfo.modality || 'No especificada'}
- Tipo de trabajo: ${opportunityInfo.workType || 'No especificado'}

INSTRUCCIONES:
1. Evalúa el match entre el perfil del estudiante y la oportunidad
2. Considera: experiencia relevante, habilidades técnicas, formación académica, proyectos, certificaciones, idiomas
3. Asigna una calificación de 1.0 a 5.0 (puedes usar decimales como 1.5, 2.5, 3.5, 4.5)
4. 1.0 = Muy bajo match, 3.0 = Match moderado, 5.0 = Match excelente
5. Sé objetivo y justo en tu evaluación

Responde SOLO con un número decimal entre 1.0 y 5.0 (puede incluir .5), sin texto adicional.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Eres un experto en recursos humanos especializado en evaluar la compatibilidad entre perfiles profesionales y oportunidades laborales. Evalúa objetivamente y proporciona solo un número decimal entre 1.0 y 5.0.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 50,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        return null;
      }

      const matchScore = parseFloat(content);
      if (isNaN(matchScore) || matchScore < 1 || matchScore > 5) {
        return null;
      }

      return Math.round(matchScore * 2) / 2;
    } catch (error: any) {
      console.error(
        `Error calculando matchScore para oportunidad ${opportunity._id}:`,
        error.message,
      );
      return null;
    }
  }

  async getAvailableOpportunitiesForStudent(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
    careerIdFilter?: string,
  ) {
    const skip = (page - 1) * limit;

    // Obtener el estudiante
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    // Obtener IDs de oportunidades a las que el estudiante ya ha aplicado
    const appliedOpportunityIds = await this.applicationModel
      .find({ studentId: new Types.ObjectId(userId) })
      .distinct('opportunityId')
      .exec();
    const appliedIdsSet = new Set(
      appliedOpportunityIds.map((id) => id.toString()),
    );

    // Construir query para oportunidades disponibles
    const query: {
      careerId?: Types.ObjectId;
      status: OpportunityStatus;
      isActive: boolean;
      $or?: Array<{
        title?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
      }>;
      $and?: Array<{
        $or: Array<{
          expirationDate?: { $exists: boolean } | { $gte: Date };
        }>;
      }>;
    } = {
      status: OpportunityStatus.ACTIVE,
      isActive: true,
      $and: [
        {
          $or: [
            { expirationDate: { $exists: false } },
            { expirationDate: { $gte: new Date() } },
          ],
        },
      ],
    };

    // Si se proporciona un filtro de carrera, aplicarlo
    if (careerIdFilter) {
      query.careerId = new Types.ObjectId(careerIdFilter);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.opportunityModel
        .find(query)
        .populate('career', 'name code')
        .populate(
          'company',
          'name logo nit address phone email sector description',
        )
        .populate('responsibleUserId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.opportunityModel.countDocuments(query).exec(),
    ]);

    const frontendUrl = this.configService.get<string>('frontendUrl') || '';

    // Obtener IDs de oportunidades guardadas por el estudiante
    const savedOpportunityIds = await this.getSavedOpportunityIds(userId);
    const savedIdsSet = new Set(savedOpportunityIds);

    // IMPORTANTE: Calcular matchScore en tiempo real para cada oportunidad
    // Siempre se evalúa desde cero usando OpenAI, sin usar valores guardados
    // Esto asegura que el matchScore refleje el estado actual del perfil del estudiante
    const dataWithShareLinks = await Promise.all(
      data.map(async (opp) => {
        const oppObj = opp.toObject();
        const oppId = oppObj._id.toString();

        // Siempre calcular el matchScore en tiempo real, nunca usar valores guardados
        let matchScore: number | null = null;
        if (student) {
          // Calcular matchScore usando OpenAI cada vez que se carga la lista
          matchScore = await this.calculateStudentOpportunityMatch(
            student,
            opp,
          );
        }

        return {
          ...oppObj,
          career: oppObj.career,
          company: oppObj.company,
          responsibleUser: oppObj.responsibleUserId,
          shareLink: opp.shareToken
            ? `${frontendUrl}/opportunities/${opp.shareToken}`
            : undefined,
          isSaved: savedIdsSet.has(oppId),
          hasApplied: appliedIdsSet.has(oppId),
          matchScore, // Siempre calculado en tiempo real
        };
      }),
    );

    return {
      data: dataWithShareLinks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createApplication(
    createApplicationDto: { opportunityId: string; coverLetter?: string },
    userId: string,
  ) {
    // Verificar que el estudiante existe
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!student) {
      throw new NotFoundException(
        'Estudiante no encontrado. Por favor, completa tu perfil de estudiante.',
      );
    }

    const opportunityId = new Types.ObjectId(
      createApplicationDto.opportunityId,
    );

    // Verificar que la oportunidad existe y está disponible
    const opportunity = await this.opportunityModel
      .findById(opportunityId)
      .populate('career')
      .exec();

    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    if (
      !opportunity.isActive ||
      opportunity.status !== OpportunityStatus.ACTIVE
    ) {
      throw new BadRequestException('Esta oportunidad no está disponible');
    }

    // Verificar que la oportunidad no haya expirado
    if (
      opportunity.expirationDate &&
      new Date(opportunity.expirationDate) < new Date()
    ) {
      throw new BadRequestException('Esta oportunidad ha expirado');
    }

    // Normalizar careerId del estudiante (puede ser ObjectId o objeto con _id)
    const studentCareerIdRaw = student.careerId;
    const studentCareerId =
      typeof studentCareerIdRaw === 'object' && studentCareerIdRaw !== null
        ? '_id' in studentCareerIdRaw && studentCareerIdRaw._id
          ? studentCareerIdRaw._id
          : studentCareerIdRaw
        : studentCareerIdRaw;

    if (!studentCareerId) {
      throw new BadRequestException(
        'No tienes una carrera asignada. Por favor, completa tu perfil de estudiante.',
      );
    }

    // Verificar que el estudiante no tenga una solicitud aprobada
    const acceptedApplication = await this.applicationModel
      .findOne({
        studentId: new Types.ObjectId(userId),
        status: ApplicationStatus.ACCEPTED,
      })
      .exec();

    if (acceptedApplication) {
      throw new BadRequestException(
        'Ya tienes una solicitud aprobada. Solo puedes tener una solicitud aprobada a la vez.',
      );
    }

    // Verificar que el estudiante no haya aplicado antes a esta oportunidad
    const existingApplication = await this.applicationModel
      .findOne({
        opportunityId,
        studentId: new Types.ObjectId(userId),
      })
      .exec();

    if (existingApplication) {
      throw new BadRequestException(
        'Ya has aplicado a esta oportunidad anteriormente',
      );
    }

    // Verificar que aún hay vacantes disponibles
    const acceptedCount = await this.applicationModel.countDocuments({
      opportunityId,
      status: ApplicationStatus.ACCEPTED,
    });

    if (acceptedCount >= opportunity.availablePositions) {
      throw new BadRequestException(
        'Ya no hay vacantes disponibles para esta oportunidad',
      );
    }

    // Crear la aplicación
    const application = new this.applicationModel({
      opportunityId,
      studentId: new Types.ObjectId(userId),
      coverLetter: createApplicationDto.coverLetter,
      status: ApplicationStatus.PENDING,
    });

    const savedApplication = await application.save();

    // Evaluar automáticamente el match (en segundo plano, no bloquea la respuesta)
    this.evaluateSingleApplication(savedApplication._id.toString()).catch(
      (error) => {
        console.error(
          `Error evaluando aplicación ${savedApplication._id} automáticamente:`,
          error,
        );
      },
    );

    return this.applicationModel
      .findById(savedApplication._id)
      .populate('studentId', 'name email')
      .populate({
        path: 'opportunityId',
        populate: [
          { path: 'career', select: 'name code' },
          { path: 'company', select: 'name logo' },
        ],
      })
      .exec();
  }

  async saveOpportunity(opportunityId: string, userId: string) {
    const opportunity = await this.opportunityModel
      .findById(opportunityId)
      .exec();
    if (!opportunity) {
      throw new NotFoundException('Oportunidad no encontrada');
    }

    // Verificar si ya está guardada
    const existing = await this.savedOpportunityModel
      .findOne({
        studentId: new Types.ObjectId(userId),
        opportunityId: new Types.ObjectId(opportunityId),
      })
      .exec();

    if (existing) {
      throw new BadRequestException('Ya has guardado esta oportunidad');
    }

    const savedOpportunity = new this.savedOpportunityModel({
      studentId: new Types.ObjectId(userId),
      opportunityId: new Types.ObjectId(opportunityId),
    });

    return savedOpportunity.save();
  }

  async unsaveOpportunity(opportunityId: string, userId: string) {
    const savedOpportunity = await this.savedOpportunityModel
      .findOneAndDelete({
        studentId: new Types.ObjectId(userId),
        opportunityId: new Types.ObjectId(opportunityId),
      })
      .exec();

    if (!savedOpportunity) {
      throw new NotFoundException('Oportunidad guardada no encontrada');
    }

    return { message: 'Oportunidad eliminada de guardadas' };
  }

  async getSavedOpportunities(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const studentId = new Types.ObjectId(userId);

    const query: { studentId: Types.ObjectId } = { studentId };

    // Obtener IDs de oportunidades guardadas
    const savedOpportunities = await this.savedOpportunityModel
      .find(query)
      .select('opportunityId')
      .exec();

    const opportunityIds = savedOpportunities.map(
      (saved) => saved.opportunityId,
    );

    if (opportunityIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Construir query para oportunidades
    const opportunityQuery: {
      _id: { $in: Types.ObjectId[] };
      status: OpportunityStatus;
      isActive: boolean;
      $or?: Array<{
        title?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
      }>;
    } = {
      _id: { $in: opportunityIds },
      status: OpportunityStatus.ACTIVE,
      isActive: true,
    };

    if (search) {
      opportunityQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.opportunityModel
        .find(opportunityQuery)
        .populate('career', 'name code')
        .populate(
          'company',
          'name logo nit address phone email sector description',
        )
        .populate('responsibleUserId', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.opportunityModel.countDocuments(opportunityQuery).exec(),
    ]);

    const frontendUrl = this.configService.get<string>('frontendUrl') || '';

    const dataWithShareLinks = data.map((opp) => {
      const oppObj = opp.toObject();
      return {
        ...oppObj,
        career: oppObj.career,
        company: oppObj.company,
        responsibleUser: oppObj.responsibleUserId,
        shareLink: opp.shareToken
          ? `${frontendUrl}/opportunities/${opp.shareToken}`
          : undefined,
        isSaved: true, // Todas las oportunidades en esta lista están guardadas
      };
    });

    return {
      data: dataWithShareLinks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async isOpportunitySaved(
    opportunityId: string,
    userId: string,
  ): Promise<boolean> {
    const saved = await this.savedOpportunityModel
      .findOne({
        studentId: new Types.ObjectId(userId),
        opportunityId: new Types.ObjectId(opportunityId),
      })
      .exec();

    return !!saved;
  }

  async getSavedOpportunityIds(userId: string): Promise<string[]> {
    const savedOpportunities = await this.savedOpportunityModel
      .find({ studentId: new Types.ObjectId(userId) })
      .select('opportunityId')
      .exec();

    return savedOpportunities.map((saved) => {
      const oppId = saved.opportunityId;
      return oppId instanceof Types.ObjectId ? oppId.toString() : String(oppId);
    });
  }

  async getStudentApplications(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
    status?: ApplicationStatus,
  ) {
    const skip = (page - 1) * limit;
    const studentId = new Types.ObjectId(userId);

    const query: {
      studentId: Types.ObjectId;
      status?: ApplicationStatus;
      $or?: Array<{
        'opportunityId.title'?: { $regex: string; $options: string };
        'opportunityId.description'?: { $regex: string; $options: string };
      }>;
    } = {
      studentId,
    };

    if (status) {
      query.status = status;
    }

    // Primero obtener las aplicaciones
    const applications = await this.applicationModel
      .find(query)
      .populate({
        path: 'opportunityId',
        populate: [
          { path: 'career', select: 'name code' },
          {
            path: 'company',
            select: 'name logo nit address phone email sector description',
          },
          { path: 'responsibleUserId', select: 'name email' },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();

    // Filtrar por búsqueda si se proporciona
    let filteredApplications = applications;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApplications = applications.filter((app) => {
        const opp = app.opportunityId as unknown;
        if (!opp || opp instanceof Types.ObjectId) return false;
        const oppDoc = opp as OpportunityDocument;
        const oppObj = oppDoc.toObject
          ? (oppDoc.toObject() as Record<string, unknown>)
          : (oppDoc as unknown as Record<string, unknown>);

        const title = oppObj.title;
        const titleMatch =
          typeof title === 'string' &&
          title.toLowerCase().includes(searchLower);

        const description = oppObj.description;
        const descriptionMatch =
          typeof description === 'string' &&
          description.toLowerCase().includes(searchLower);

        const companyName = (oppObj as any).company?.name as string | undefined;
        const companyMatch =
          companyName != null &&
          companyName.toLowerCase().includes(searchLower);
        return titleMatch || descriptionMatch || companyMatch;
      });
    }

    const total = filteredApplications.length;
    const paginatedApplications = filteredApplications.slice(
      skip,
      skip + limit,
    );

    const frontendUrl = this.configService.get<string>('frontendUrl') || '';

    const dataWithDetails = paginatedApplications.map((app) => {
      const appObj = app.toObject();
      const opp = appObj.opportunityId as unknown;

      // Ensure createdAt and updatedAt are included
      const createdAt = appObj.createdAt || (app as { createdAt?: Date }).createdAt;
      const updatedAt = appObj.updatedAt || (app as { updatedAt?: Date }).updatedAt;

      if (!opp || opp instanceof Types.ObjectId) {
        return {
          ...appObj,
          createdAt,
          updatedAt,
          opportunity: null,
        };
      }

      const oppDoc = opp as OpportunityDocument;
      const oppObjRaw = oppDoc.toObject
        ? (oppDoc.toObject() as Record<string, unknown>)
        : (oppDoc as unknown as Record<string, unknown>);
      const oppTyped: {
        company?: unknown;
        career?: unknown;
        responsibleUserId?: unknown;
        shareToken?: string;
        [key: string]: unknown;
      } = {
        ...oppObjRaw,
      };

      const company = oppTyped.company ?? null;
      const career = oppTyped.career ?? null;
      const responsibleUser =
        oppTyped.responsibleUserId &&
        typeof oppTyped.responsibleUserId === 'object'
          ? (oppTyped.responsibleUserId as Record<string, unknown>)
          : null;

      return {
        ...appObj,
        createdAt,
        updatedAt,
        opportunity: {
          ...oppTyped,
          career,
          company,
          responsibleUser,
          shareLink:
            oppTyped.shareToken && typeof oppTyped.shareToken === 'string'
              ? `${frontendUrl}/opportunities/${oppTyped.shareToken}`
              : undefined,
        },
      };
    });

    return {
      data: dataWithDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCoordinatorApplications(
    careerId: string,
    page = 1,
    limit = 20,
    opportunityId?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const careerObjectId = new Types.ObjectId(careerId);

    // Primero obtener los estudiantes de la carrera del coordinador
    // Necesitamos obtener los userId de los estudiantes porque en Application,
    // studentId hace referencia a User, no a Student
    const studentsOfCareer = await this.studentModel
      .find({ careerId: careerObjectId })
      .select('_id userId')
      .lean()
      .exec();

    const userIds = studentsOfCareer
      .map((student) => {
        const userIdValue = student.userId;
        if (userIdValue instanceof Types.ObjectId) {
          return userIdValue;
        }
        if (typeof userIdValue === 'string') {
          return new Types.ObjectId(userIdValue);
        }
        if (
          userIdValue &&
          typeof userIdValue === 'object' &&
          '_id' in userIdValue
        ) {
          const idValue = (userIdValue as { _id: Types.ObjectId | string })
            ._id;
          return typeof idValue === 'string'
            ? new Types.ObjectId(idValue)
            : idValue;
        }
        return null;
      })
      .filter((id): id is Types.ObjectId => id !== null);

    if (userIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Construir query para aplicaciones: debe ser de estudiantes de la carrera
    // Si se proporciona opportunityId, filtrar por esa oportunidad específica
    // Si no, mostrar todas las solicitudes de los estudiantes sin importar la carrera de la oportunidad
    // Nota: studentId en Application es userId, no student._id
    const applicationQuery: {
      studentId: { $in: Types.ObjectId[] };
      opportunityId?: Types.ObjectId | { $in: Types.ObjectId[] };
    } = {
      studentId: { $in: userIds },
    };

    // Si se proporciona un opportunityId específico, filtrar por esa oportunidad
    if (opportunityId) {
      applicationQuery.opportunityId = new Types.ObjectId(opportunityId);
    }

    // Obtener todas las aplicaciones (sin paginación inicial para poder filtrar por nombre)
    const allApplications = await this.applicationModel
      .find(applicationQuery)
      .populate('studentId', 'name email')
      .populate({
        path: 'opportunityId',
        select: 'title',
        populate: [
          { path: 'career', select: 'name code' },
          { path: 'company', select: 'name logo' },
        ],
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Filtrar por nombre de estudiante si se proporciona búsqueda
    let filteredApplications = allApplications;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApplications = allApplications.filter((app) => {
        const studentIdValue = app.studentId;
        if (!studentIdValue) return false;

        // Verificar si el estudiante está poblado
        if (
          typeof studentIdValue === 'object' &&
          'name' in studentIdValue &&
          typeof (studentIdValue as { name: unknown }).name === 'string'
        ) {
          const studentName = (
            studentIdValue as { name: string }
          ).name.toLowerCase();
          return studentName.includes(searchLower);
        }

        return false;
      });
    }

    // Ordenar: primero las aprobadas, luego por matchScore (mejores primero), luego por fecha de creación
    const sortedApplications = filteredApplications.sort((a, b) => {
      const aStatus = (a as any).status;
      const bStatus = (b as any).status;
      
      // Prioridad 1: Las aprobadas van primero
      const aIsApproved = aStatus === ApplicationStatus.APPROVED;
      const bIsApproved = bStatus === ApplicationStatus.APPROVED;
      
      if (aIsApproved && !bIsApproved) {
        return -1;
      }
      if (!aIsApproved && bIsApproved) {
        return 1;
      }
      
      // Si ambas tienen el mismo estado (ambas aprobadas o ambas no aprobadas),
      // ordenar por matchScore (mejores primero)
      const aScore = (a as any).matchScore ?? -1;
      const bScore = (b as any).matchScore ?? -1;
      
      // Si ambos tienen calificación, ordenar por calificación descendente
      if (aScore >= 0 && bScore >= 0) {
        return bScore - aScore;
      }
      
      // Si solo uno tiene calificación, el que tiene calificación va primero
      if (aScore >= 0 && bScore < 0) {
        return -1;
      }
      if (aScore < 0 && bScore >= 0) {
        return 1;
      }
      
      // Si ninguno tiene calificación, ordenar por fecha de creación descendente
      const aDate = (a as any).createdAt
        ? new Date((a as any).createdAt).getTime()
        : 0;
      const bDate = (b as any).createdAt
        ? new Date((b as any).createdAt).getTime()
        : 0;
      return bDate - aDate;
    });

    // Aplicar paginación después del filtro y ordenamiento
    const total = sortedApplications.length;
    const paginatedApplications = sortedApplications.slice(skip, skip + limit);

    // Transformar aplicaciones al formato esperado
    const dataWithDetails = paginatedApplications.map((app) => {
      const appObj = app as Record<string, unknown>;
      const studentIdValue = appObj.studentId;
      let studentInfo: { _id: string; name: string; email: string } | undefined;
      let studentIdString = '';

      if (studentIdValue) {
        if (
          typeof studentIdValue === 'object' &&
          'name' in studentIdValue &&
          'email' in studentIdValue
        ) {
          const studentObj = studentIdValue as unknown as {
            _id: Types.ObjectId | string;
            name: string;
            email: string;
          };
          studentIdString =
            typeof studentObj._id === 'string'
              ? studentObj._id
              : studentObj._id.toString();
          studentInfo = {
            _id: studentIdString,
            name: studentObj.name || '',
            email: studentObj.email || '',
          };
        } else {
          if (typeof studentIdValue === 'string') {
            studentIdString = studentIdValue;
          } else if (studentIdValue instanceof Types.ObjectId) {
            studentIdString = studentIdValue.toString();
          } else if (
            studentIdValue &&
            typeof studentIdValue === 'object' &&
            '_id' in studentIdValue
          ) {
            const idValue = (studentIdValue as { _id: Types.ObjectId | string })
              ._id;
            studentIdString =
              typeof idValue === 'string' ? idValue : idValue.toString();
          } else {
            studentIdString = String(studentIdValue);
          }
        }
      }

      const opportunityIdValue = appObj.opportunityId;
      let opportunityInfo: {
        _id: string;
        title: string;
        career?: { _id: string; name: string; code: string };
        company?: { _id: string; name: string; logo?: string };
      } | null = null;

      if (opportunityIdValue) {
        if (
          typeof opportunityIdValue === 'object' &&
          'title' in opportunityIdValue
        ) {
          const oppObj = opportunityIdValue as unknown as {
            _id: Types.ObjectId | string;
            title: string;
            career?: { _id: Types.ObjectId | string; name: string; code: string };
            company?: { _id: Types.ObjectId | string; name: string; logo?: string };
          };
          const oppIdString =
            typeof oppObj._id === 'string'
              ? oppObj._id
              : oppObj._id.toString();
          opportunityInfo = {
            _id: oppIdString,
            title: oppObj.title || '',
            career: oppObj.career
              ? {
                  _id:
                    typeof oppObj.career._id === 'string'
                      ? oppObj.career._id
                      : oppObj.career._id.toString(),
                  name: oppObj.career.name || '',
                  code: oppObj.career.code || '',
                }
              : undefined,
            company: oppObj.company
              ? {
                  _id:
                    typeof oppObj.company._id === 'string'
                      ? oppObj.company._id
                      : oppObj.company._id.toString(),
                  name: oppObj.company.name || '',
                  logo: oppObj.company.logo || undefined,
                }
              : undefined,
          };
        }
      }

      const createdAt =
        appObj.createdAt && typeof appObj.createdAt === 'string'
          ? appObj.createdAt
          : appObj.createdAt && appObj.createdAt instanceof Date
            ? appObj.createdAt.toISOString()
            : (appObj.createdAt as any)?.toString
              ? new Date((appObj.createdAt as any).toString()).toISOString()
              : new Date().toISOString();

      const updatedAt =
        appObj.updatedAt && typeof appObj.updatedAt === 'string'
          ? appObj.updatedAt
          : appObj.updatedAt && appObj.updatedAt instanceof Date
            ? appObj.updatedAt.toISOString()
            : (appObj.updatedAt as any)?.toString
              ? new Date((appObj.updatedAt as any).toString()).toISOString()
              : new Date().toISOString();

      const matchScoreValue =
        appObj.matchScore !== undefined && appObj.matchScore !== null
          ? (appObj.matchScore as number)
          : undefined;

      return {
        _id: (appObj._id as Types.ObjectId).toString(),
        opportunityId: opportunityInfo?._id || '',
        studentId: studentIdString || '',
        student: studentInfo,
        opportunity: opportunityInfo,
        coverLetter: (appObj.coverLetter as string) || '',
        status: appObj.status as ApplicationStatus,
        rejectionReason: (appObj.rejectionReason as string) || undefined,
        matchScore: matchScoreValue,
        createdAt,
        updatedAt,
      };
    });

    return {
      data: dataWithDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCompanyApplications(
    userId: string,
    page = 1,
    limit = 20,
    opportunityId?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const companyId = await this.getCompanyIdByUserId(userId);

    // Obtener IDs de oportunidades de la empresa
    const opportunityQuery: { companyId: Types.ObjectId } = {
      companyId: new Types.ObjectId(companyId),
    };

    if (opportunityId) {
      opportunityQuery['_id'] = new Types.ObjectId(opportunityId);
    }

    const companyOpportunities = await this.opportunityModel
      .find(opportunityQuery)
      .select('_id')
      .lean()
      .exec();

    const opportunityIds = companyOpportunities.map((opp) => opp._id);

    if (opportunityIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Construir query para aplicaciones
    const applicationQuery: {
      opportunityId: { $in: Types.ObjectId[] };
    } = {
      opportunityId: { $in: opportunityIds },
    };

    // Obtener todas las aplicaciones (sin paginación inicial para poder filtrar por nombre)
    const allApplications = await this.applicationModel
      .find(applicationQuery)
      .populate('studentId', 'name email')
      .populate({
        path: 'opportunityId',
        select: 'title',
        populate: [
          { path: 'career', select: 'name code' },
          { path: 'company', select: 'name logo' },
        ],
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Filtrar por nombre de estudiante si se proporciona búsqueda
    let filteredApplications = allApplications;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApplications = allApplications.filter((app) => {
        const studentIdValue = app.studentId;
        if (!studentIdValue) return false;

        // Verificar si el estudiante está poblado
        if (
          typeof studentIdValue === 'object' &&
          'name' in studentIdValue &&
          typeof (studentIdValue as { name: unknown }).name === 'string'
        ) {
          const studentName = (
            studentIdValue as { name: string }
          ).name.toLowerCase();
          return studentName.includes(searchLower);
        }

        return false;
      });
    }

    // Ordenar por matchScore (mejores primero), luego por fecha de creación
    const sortedApplications = filteredApplications.sort((a, b) => {
      const aScore = (a as any).matchScore ?? -1;
      const bScore = (b as any).matchScore ?? -1;
      
      // Si ambos tienen calificación, ordenar por calificación descendente
      if (aScore >= 0 && bScore >= 0) {
        return bScore - aScore;
      }
      
      // Si solo uno tiene calificación, el que tiene calificación va primero
      if (aScore >= 0 && bScore < 0) {
        return -1;
      }
      if (aScore < 0 && bScore >= 0) {
        return 1;
      }
      
      // Si ninguno tiene calificación, ordenar por fecha de creación descendente
      const aDate = (a as any).createdAt
        ? new Date((a as any).createdAt).getTime()
        : 0;
      const bDate = (b as any).createdAt
        ? new Date((b as any).createdAt).getTime()
        : 0;
      return bDate - aDate;
    });

    // Aplicar paginación después del filtro y ordenamiento
    const total = sortedApplications.length;
    const paginatedApplications = sortedApplications.slice(skip, skip + limit);

    // Transformar aplicaciones al formato esperado
    const dataWithDetails = paginatedApplications.map((app) => {
      const appObj = app as Record<string, unknown>;
      const studentIdValue = appObj.studentId;
      let studentInfo: { _id: string; name: string; email: string } | undefined;
      let studentIdString = '';

      if (studentIdValue) {
        if (
          typeof studentIdValue === 'object' &&
          'name' in studentIdValue &&
          'email' in studentIdValue
        ) {
          const studentObj = studentIdValue as unknown as {
            _id: Types.ObjectId | string;
            name: string;
            email: string;
          };
          studentIdString =
            typeof studentObj._id === 'string'
              ? studentObj._id
              : studentObj._id.toString();
          studentInfo = {
            _id: studentIdString,
            name: studentObj.name || '',
            email: studentObj.email || '',
          };
        } else {
          if (typeof studentIdValue === 'string') {
            studentIdString = studentIdValue;
          } else if (studentIdValue instanceof Types.ObjectId) {
            studentIdString = studentIdValue.toString();
          } else if (
            studentIdValue &&
            typeof studentIdValue === 'object' &&
            '_id' in studentIdValue
          ) {
            const idValue = (studentIdValue as { _id: Types.ObjectId | string })
              ._id;
            studentIdString =
              typeof idValue === 'string' ? idValue : idValue.toString();
          } else {
            studentIdString = String(studentIdValue);
          }
        }
      }

      const opportunityIdValue = appObj.opportunityId;
      let opportunityInfo: {
        _id: string;
        title: string;
        career?: { _id: string; name: string; code: string };
        company?: { _id: string; name: string; logo?: string };
      } | null = null;

      if (opportunityIdValue) {
        if (
          typeof opportunityIdValue === 'object' &&
          'title' in opportunityIdValue
        ) {
          const oppObj = opportunityIdValue as unknown as {
            _id: Types.ObjectId | string;
            title: string;
            career?: { _id: Types.ObjectId | string; name: string; code: string };
            company?: { _id: Types.ObjectId | string; name: string; logo?: string };
          };
          const oppIdString =
            typeof oppObj._id === 'string'
              ? oppObj._id
              : oppObj._id.toString();

          let career: { _id: string; name: string; code: string } | undefined;
          let company: { _id: string; name: string; logo?: string } | undefined;

          if (oppObj.career && typeof oppObj.career === 'object') {
            const careerObj = oppObj.career as unknown as {
              _id: Types.ObjectId | string;
              name: string;
              code: string;
            };
            career = {
              _id:
                typeof careerObj._id === 'string'
                  ? careerObj._id
                  : careerObj._id.toString(),
              name: careerObj.name || '',
              code: careerObj.code || '',
            };
          }

          if (oppObj.company && typeof oppObj.company === 'object') {
            const companyObj = oppObj.company as unknown as {
              _id: Types.ObjectId | string;
              name: string;
              logo?: string;
            };
            company = {
              _id:
                typeof companyObj._id === 'string'
                  ? companyObj._id
                  : companyObj._id.toString(),
              name: companyObj.name || '',
              logo: companyObj.logo,
            };
          }

          opportunityInfo = {
            _id: oppIdString,
            title: oppObj.title || '',
            career,
            company,
          };
        }
      }

      const createdAt = appObj.createdAt
        ? new Date(appObj.createdAt as string).toISOString()
        : new Date().toISOString();
      const updatedAt = appObj.updatedAt
        ? new Date(appObj.updatedAt as string).toISOString()
        : new Date().toISOString();

      const matchScoreValue =
        appObj.matchScore !== undefined && appObj.matchScore !== null
          ? (appObj.matchScore as number)
          : undefined;

      return {
        _id: (appObj._id as Types.ObjectId).toString(),
        opportunityId: opportunityInfo?._id || '',
        studentId: studentIdString || '',
        student: studentInfo,
        opportunity: opportunityInfo,
        coverLetter: (appObj.coverLetter as string) || '',
        status: appObj.status as ApplicationStatus,
        rejectionReason: (appObj.rejectionReason as string) || undefined,
        matchScore: matchScoreValue,
        createdAt,
        updatedAt,
      };
    });

    // Evaluar automáticamente aplicaciones sin calificación (en segundo plano)
    this.evaluateApplicationsWithoutScore(dataWithDetails, companyId).catch(
      (error) => {
        console.error('Error evaluando aplicaciones automáticamente:', error);
      },
    );

    return {
      data: dataWithDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async evaluateApplicationsWithoutScore(
    applications: Array<{
      _id: string | Types.ObjectId;
      opportunityId?: string | Types.ObjectId;
      studentId?: string | Types.ObjectId;
      matchScore?: number;
    }>,
    companyId: string,
  ) {
    const applicationsToEvaluate = applications.filter(
      (app) => app.matchScore === undefined || app.matchScore === null,
    );

    for (const app of applicationsToEvaluate) {
      try {
        const appId =
          app._id instanceof Types.ObjectId
            ? app._id
            : new Types.ObjectId(app._id.toString());

        // Buscar la aplicación completa
        const application = await this.applicationModel.findById(appId).exec();

        if (!application) continue;

        // Verificar que no tenga matchScore (por si acaso cambió)
        if (
          application.matchScore !== undefined &&
          application.matchScore !== null
        ) {
          continue;
        }

        // Obtener la oportunidad
        const opportunity = await this.opportunityModel.findById(
          application.opportunityId,
        );

        if (!opportunity) continue;

        // Verificar que pertenezca a la empresa
        const opportunityCompanyId =
          opportunity.companyId instanceof Types.ObjectId
            ? opportunity.companyId.toString()
            : String((opportunity.companyId as unknown as string | Types.ObjectId) || '');

        if (opportunityCompanyId !== companyId) {
          continue;
        }

        // Obtener el estudiante
        const student = await this.studentModel
          .findOne({ userId: application.studentId })
          .populate('careerId', 'name code')
          .lean()
          .exec();

        if (!student) continue;

        // Evaluar con OpenAI
        const apiKey = this.configService.get<string>('openai.apiKey');
        if (!apiKey) {
          console.warn('OpenAI API key no configurada, saltando evaluación');
          continue;
        }

        const openai = new OpenAI({ apiKey });

        const studentProfile = {
          firstName: student.firstName,
          lastName: student.lastName,
          career: (student.careerId as any)?.name || 'No especificada',
          workExperience: student.workExperience || [],
          education: student.education || [],
          skills: student.skills || [],
          professionalProfile: student.professionalProfile || {},
        };

        const opportunityPopulated = await this.opportunityModel
          .findById(opportunity._id)
          .populate('career', 'name code')
          .lean()
          .exec();

        if (!opportunityPopulated) continue;

        const opportunityInfo = {
          title: opportunityPopulated.title,
          description: opportunityPopulated.description || '',
          activities: opportunityPopulated.activities || '',
          career: (opportunityPopulated as any).career?.name || 'No especificada',
          totalHours: opportunityPopulated.totalHours,
          modality: opportunityPopulated.modality,
          workType: opportunityPopulated.workType,
        };

        const prompt = `Eres un experto en recursos humanos y evaluación de perfiles profesionales.

Evalúa qué tan bien coincide el perfil profesional del estudiante con los requisitos y características de la oportunidad de práctica profesional.

PERFIL DEL ESTUDIANTE:
- Nombre: ${studentProfile.firstName} ${studentProfile.lastName}
- Carrera: ${studentProfile.career}
- Experiencia laboral: ${JSON.stringify(studentProfile.workExperience)}
- Formación académica: ${JSON.stringify(studentProfile.education)}
- Habilidades: ${studentProfile.skills.join(', ') || 'No especificadas'}
- Resumen profesional: ${studentProfile.professionalProfile?.summary || 'No disponible'}
- Idiomas: ${JSON.stringify(studentProfile.professionalProfile?.languages || [])}
- Certificaciones: ${JSON.stringify(studentProfile.professionalProfile?.certifications || [])}
- Proyectos: ${JSON.stringify(studentProfile.professionalProfile?.projects || [])}

OPORTUNIDAD DE PRÁCTICA:
- Título: ${opportunityInfo.title}
- Descripción: ${opportunityInfo.description}
- Actividades requeridas: ${opportunityInfo.activities}
- Carrera requerida: ${opportunityInfo.career}
- Horas totales: ${opportunityInfo.totalHours}
- Modalidad: ${opportunityInfo.modality || 'No especificada'}
- Tipo de trabajo: ${opportunityInfo.workType || 'No especificado'}

INSTRUCCIONES:
1. Evalúa el match entre el perfil del estudiante y la oportunidad
2. Considera: experiencia relevante, habilidades técnicas, formación académica, proyectos, certificaciones, idiomas
3. Asigna una calificación de 1.0 a 5.0 (puedes usar decimales como 1.5, 2.5, 3.5, 4.5)
4. 1.0 = Muy bajo match, 3.0 = Match moderado, 5.0 = Match excelente
5. Sé objetivo y justo en tu evaluación

Responde SOLO con un número decimal entre 1.0 y 5.0 (puede incluir .5), sin texto adicional.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content:
                'Eres un experto en recursos humanos especializado en evaluar la compatibilidad entre perfiles profesionales y oportunidades laborales. Evalúa objetivamente y proporciona solo un número decimal entre 1.0 y 5.0.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 50,
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (!content) {
          console.warn(`No se recibió respuesta de OpenAI para aplicación ${app._id}`);
          continue;
        }

        const matchScore = parseFloat(content);
        if (isNaN(matchScore) || matchScore < 1 || matchScore > 5) {
          console.warn(
            `Calificación inválida recibida de OpenAI para aplicación ${app._id}: ${content}`,
          );
          continue;
        }

        const roundedScore = Math.round(matchScore * 2) / 2;

        // Actualizar la aplicación
        await this.applicationModel.findByIdAndUpdate(
          appId,
          { matchScore: roundedScore },
          { new: true, runValidators: true },
        );
      } catch (error: any) {
        console.error(
          `Error evaluando aplicación ${app._id} automáticamente:`,
          error.message,
        );
        // Continuar con la siguiente aplicación
      }
    }
  }

  private async evaluateSingleApplication(applicationId: string) {
    try {
      const application = await this.applicationModel
        .findById(applicationId)
        .exec();

      if (!application) {
        return;
      }

      // Verificar que no tenga matchScore ya
      if (
        application.matchScore !== undefined &&
        application.matchScore !== null
      ) {
        return;
      }

      // Obtener la oportunidad
      const opportunity = await this.opportunityModel
        .findById(application.opportunityId)
        .populate('career', 'name code')
        .lean()
        .exec();

      if (!opportunity) {
        return;
      }

      // Obtener el estudiante
      const student = await this.studentModel
        .findOne({ userId: application.studentId })
        .populate('careerId', 'name code')
        .lean()
        .exec();

      if (!student) {
        return;
      }

      // Evaluar con OpenAI
      const apiKey = this.configService.get<string>('openai.apiKey');
      if (!apiKey) {
        console.warn('OpenAI API key no configurada, saltando evaluación');
        return;
      }

      const openai = new OpenAI({ apiKey });

      const studentProfile = {
        firstName: student.firstName,
        lastName: student.lastName,
        career: (student.careerId as any)?.name || 'No especificada',
        workExperience: student.workExperience || [],
        education: student.education || [],
        skills: student.skills || [],
        professionalProfile: student.professionalProfile || {},
      };

      const opportunityInfo = {
        title: opportunity.title,
        description: opportunity.description || '',
        activities: opportunity.activities || '',
        career: (opportunity as any).career?.name || 'No especificada',
        totalHours: opportunity.totalHours,
        modality: opportunity.modality,
        workType: opportunity.workType,
      };

      const prompt = `Eres un experto en recursos humanos y evaluación de perfiles profesionales.

Evalúa qué tan bien coincide el perfil profesional del estudiante con los requisitos y características de la oportunidad de práctica profesional.

PERFIL DEL ESTUDIANTE:
- Nombre: ${studentProfile.firstName} ${studentProfile.lastName}
- Carrera: ${studentProfile.career}
- Experiencia laboral: ${JSON.stringify(studentProfile.workExperience)}
- Formación académica: ${JSON.stringify(studentProfile.education)}
- Habilidades: ${studentProfile.skills.join(', ') || 'No especificadas'}
- Resumen profesional: ${studentProfile.professionalProfile?.summary || 'No disponible'}
- Idiomas: ${JSON.stringify(studentProfile.professionalProfile?.languages || [])}
- Certificaciones: ${JSON.stringify(studentProfile.professionalProfile?.certifications || [])}
- Proyectos: ${JSON.stringify(studentProfile.professionalProfile?.projects || [])}

OPORTUNIDAD DE PRÁCTICA:
- Título: ${opportunityInfo.title}
- Descripción: ${opportunityInfo.description}
- Actividades requeridas: ${opportunityInfo.activities}
- Carrera requerida: ${opportunityInfo.career}
- Horas totales: ${opportunityInfo.totalHours}
- Modalidad: ${opportunityInfo.modality || 'No especificada'}
- Tipo de trabajo: ${opportunityInfo.workType || 'No especificado'}

INSTRUCCIONES:
1. Evalúa el match entre el perfil del estudiante y la oportunidad
2. Considera: experiencia relevante, habilidades técnicas, formación académica, proyectos, certificaciones, idiomas
3. Asigna una calificación de 1.0 a 5.0 (puedes usar decimales como 1.5, 2.5, 3.5, 4.5)
4. 1.0 = Muy bajo match, 3.0 = Match moderado, 5.0 = Match excelente
5. Sé objetivo y justo en tu evaluación

Responde SOLO con un número decimal entre 1.0 y 5.0 (puede incluir .5), sin texto adicional.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Eres un experto en recursos humanos especializado en evaluar la compatibilidad entre perfiles profesionales y oportunidades laborales. Evalúa objetivamente y proporciona solo un número decimal entre 1.0 y 5.0.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 50,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        console.warn(
          `No se recibió respuesta de OpenAI para aplicación ${applicationId}`,
        );
        return;
      }

      const matchScore = parseFloat(content);
      if (isNaN(matchScore) || matchScore < 1 || matchScore > 5) {
        console.warn(
          `Calificación inválida recibida de OpenAI para aplicación ${applicationId}: ${content}`,
        );
        return;
      }

      const roundedScore = Math.round(matchScore * 2) / 2;

      // Actualizar la aplicación
      await this.applicationModel.findByIdAndUpdate(
        applicationId,
        { matchScore: roundedScore },
        { new: true, runValidators: true },
      );
    } catch (error: any) {
      console.error(
        `Error evaluando aplicación ${applicationId} automáticamente:`,
        error.message,
      );
    }
  }
}
