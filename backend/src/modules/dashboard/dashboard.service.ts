import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  User,
  UserDocument,
  UserRole,
} from '@/modules/auth/schemas/user.schema';
import {
  Company,
  CompanyDocument,
  CompanyStatus,
} from '@/modules/companies/schemas/company.schema';
import {
  Career,
  CareerDocument,
} from '@/modules/careers/schemas/career.schema';
import {
  CareerCategory,
  CareerCategoryDocument,
} from '@/modules/career-categories/schemas/career-category.schema';
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
  PracticeActivity,
  PracticeActivityDocument,
  ActivityStatus,
} from '@/modules/practice-professional/schemas/practice-activity.schema';
import {
  PracticeProfessional,
  PracticeProfessionalDocument,
} from '@/modules/practice-professional/schemas/practice-professional.schema';
import {
  Student,
  StudentDocument,
  StudentStatus,
} from '@/modules/students/schemas/student.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Career.name) private careerModel: Model<CareerDocument>,
    @InjectModel(CareerCategory.name)
    private careerCategoryModel: Model<CareerCategoryDocument>,
    @InjectModel(Opportunity.name)
    private opportunityModel: Model<OpportunityDocument>,
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    @InjectModel(PracticeActivity.name)
    private practiceActivityModel: Model<PracticeActivityDocument>,
    @InjectModel(PracticeProfessional.name)
    private practiceProfessionalModel: Model<PracticeProfessionalDocument>,
    @InjectModel(Student.name)
    private studentModel: Model<StudentDocument>,
  ) {}

  async getStats(userId: string, userRole: string, careerId?: string) {
    // Si es usuario COMPANY, devolver estadísticas específicas de la empresa
    if (userRole === 'company') {
      return this.getCompanyStats(userId);
    }

    // Si es usuario ESTUDIANTE, devolver estadísticas específicas del estudiante
    if (userRole === 'estudiante') {
      return this.getStudentStats(userId);
    }

    // Si es COORDINADOR, devolver estadísticas filtradas por su carrera
    if (userRole === 'coordinador' && careerId) {
      return this.getCoordinatorStats(careerId);
    }

    // Para ADMIN, devolver estadísticas generales
    const [
      totalUsers,
      students,
      companies,
      admins,
      totalCompanies,
      activeCompanies,
      inactiveCompanies,
      totalCareers,
      activeCareers,
      inactiveCareers,
      totalCategories,
      activeCategories,
      inactiveCategories,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
    ] = await Promise.all([
      this.userModel.countDocuments({ isActive: true }),
      this.userModel.countDocuments({
        role: UserRole.ESTUDIANTE,
        isActive: true,
      }),
      this.userModel.countDocuments({
        role: UserRole.COMPANY,
        isActive: true,
      }),
      this.userModel.countDocuments({
        role: UserRole.ADMIN,
        isActive: true,
      }),
      this.companyModel.countDocuments(),
      this.companyModel.countDocuments({ status: CompanyStatus.ACTIVE }),
      this.companyModel.countDocuments({ status: CompanyStatus.INACTIVE }),
      this.careerModel.countDocuments(),
      this.careerModel.countDocuments({ isActive: true }),
      this.careerModel.countDocuments({ isActive: false }),
      this.careerCategoryModel.countDocuments(),
      this.careerCategoryModel.countDocuments({ isActive: true }),
      this.careerCategoryModel.countDocuments({ isActive: false }),
      this.applicationModel.countDocuments(),
      this.applicationModel.countDocuments({
        status: ApplicationStatus.PENDING,
      }),
      this.applicationModel.countDocuments({
        status: ApplicationStatus.ACCEPTED,
      }),
      this.applicationModel.countDocuments({
        status: ApplicationStatus.REJECTED,
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        students,
        companies,
        admins,
      },
      companies: {
        total: totalCompanies,
        active: activeCompanies,
        inactive: inactiveCompanies,
      },
      requests: {
        total: totalApplications,
        pending: pendingApplications,
        approved: acceptedApplications,
        rejected: rejectedApplications,
        inProgress: acceptedApplications, // Aplicaciones aceptadas están en proceso
      },
      careers: {
        total: totalCareers,
        active: activeCareers,
        inactive: inactiveCareers,
      },
      careerCategories: {
        total: totalCategories,
        active: activeCategories,
        inactive: inactiveCategories,
      },
    };
  }

  private async getCompanyStats(userId: string) {
    // Obtener el companyId del usuario
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.companyId) {
      throw new NotFoundException(
        'Usuario no encontrado o no tiene una empresa asociada',
      );
    }

    const companyId = new Types.ObjectId(user.companyId);

    // Obtener los IDs de todas las oportunidades de la empresa
    const opportunityIds = await this.opportunityModel
      .find({ companyId })
      .distinct('_id')
      .exec();

    // Obtener estadísticas de oportunidades
    const [
      totalOpportunities,
      activeOpportunities,
      closedOpportunities,
      draftOpportunities,
      inactiveOpportunities,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      totalPositions,
    ] = await Promise.all([
      this.opportunityModel.countDocuments({ companyId }),
      this.opportunityModel.countDocuments({
        companyId,
        status: OpportunityStatus.ACTIVE,
        isActive: true,
      }),
      this.opportunityModel.countDocuments({
        companyId,
        status: OpportunityStatus.CLOSED,
      }),
      this.opportunityModel.countDocuments({
        companyId,
        status: OpportunityStatus.DRAFT,
      }),
      this.opportunityModel.countDocuments({
        companyId,
        isActive: false,
      }),
      this.applicationModel.countDocuments({
        opportunityId: { $in: opportunityIds },
      }),
      this.applicationModel.countDocuments({
        opportunityId: { $in: opportunityIds },
        status: ApplicationStatus.PENDING,
      }),
      this.applicationModel.countDocuments({
        opportunityId: { $in: opportunityIds },
        status: ApplicationStatus.ACCEPTED,
      }),
      this.applicationModel.countDocuments({
        opportunityId: { $in: opportunityIds },
        status: ApplicationStatus.REJECTED,
      }),
      this.opportunityModel.aggregate<{ total: number }>([
        { $match: { companyId } },
        { $group: { _id: null, total: { $sum: '$availablePositions' } } },
      ]),
    ]);

    const totalPositionsValue =
      totalPositions.length > 0 && totalPositions[0]?.total
        ? totalPositions[0].total
        : 0;

    return {
      opportunities: {
        total: totalOpportunities,
        active: activeOpportunities,
        closed: closedOpportunities,
        draft: draftOpportunities,
        inactive: inactiveOpportunities,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
      },
      positions: {
        total: totalPositionsValue,
        occupied: acceptedApplications,
        available: totalPositionsValue - acceptedApplications,
      },
    };
  }

  private async getStudentStats(userId: string) {
    const studentId = new Types.ObjectId(userId);

    // Obtener IDs de oportunidades a las que el estudiante ya ha aplicado
    const appliedOpportunityIds = await this.applicationModel
      .find({ studentId })
      .distinct('opportunityId')
      .exec();

    // Obtener estadísticas de aplicaciones del estudiante
    const [
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      availableOpportunities,
    ] = await Promise.all([
      this.applicationModel.countDocuments({ studentId }),
      this.applicationModel.countDocuments({
        studentId,
        status: ApplicationStatus.PENDING,
      }),
      this.applicationModel.countDocuments({
        studentId,
        status: ApplicationStatus.ACCEPTED,
      }),
      this.applicationModel.countDocuments({
        studentId,
        status: ApplicationStatus.REJECTED,
      }),
      this.opportunityModel.countDocuments({
        status: OpportunityStatus.ACTIVE,
        isActive: true,
        _id: { $nin: appliedOpportunityIds },
        $or: [
          { expirationDate: { $exists: false } },
          { expirationDate: { $gte: new Date() } },
        ],
      }),
    ]);

    // Calcular estadísticas de práctica profesional desde la colección PracticeProfessional
    let practiceProfessional: {
      totalHours: number;
      approvedHours: number;
      remainingHours: number;
      requiredHours: number;
      isFinalized: boolean;
    } | null = null;

    const practicesList = await this.practiceProfessionalModel
      .find({ studentId })
      .populate({ path: 'opportunityId', select: 'totalHours' })
      .lean()
      .exec();

    if (practicesList.length > 0) {
      const practiceIds = practicesList.map((p) => p._id);

      const allActivities = await this.practiceActivityModel
        .find({ practiceProfessionalId: { $in: practiceIds } })
        .lean()
        .exec();

      let totalHours = 0;
      let approvedHours = 0;
      let totalRequiredHours = 0;
      let allFinalized = true;
      let hasAnyInProgress = false;

      for (const practice of practicesList) {
        const opportunity = practice.opportunityId as unknown as {
          totalHours?: number;
        };
        const requiredHours = opportunity?.totalHours || 0;
        totalRequiredHours += requiredHours;

        if (!practice.finalizedAt) {
          allFinalized = false;
          hasAnyInProgress = true;
        }

        const practiceActivities = allActivities.filter(
          (activity) =>
            activity.practiceProfessionalId &&
            activity.practiceProfessionalId.toString() ===
              practice._id.toString(),
        );

        totalHours += practiceActivities.reduce(
          (sum, a) => sum + (a.hours || 0),
          0,
        );
        approvedHours += practiceActivities
          .filter((a) => a.status === ActivityStatus.APPROVED)
          .reduce((sum, a) => sum + (a.hours || 0), 0);
      }

      practiceProfessional = {
        totalHours,
        approvedHours,
        remainingHours: Math.max(0, totalRequiredHours - approvedHours),
        requiredHours: totalRequiredHours,
        isFinalized: allFinalized && !hasAnyInProgress,
      };
    }

    return {
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
      },
      opportunities: {
        available: availableOpportunities,
      },
      practiceProfessional,
    };
  }

  private async getCoordinatorStats(careerId: string) {
    const careerObjectId = new Types.ObjectId(careerId);

    // Obtener IDs de oportunidades de la carrera primero
    const opportunityIds = await this.opportunityModel
      .find({ careerId: careerObjectId })
      .distinct('_id')
      .exec();

    // Obtener estadísticas de estudiantes de la carrera
    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      graduatedStudents,
      totalOpportunities,
      activeOpportunities,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
    ] = await Promise.all([
      this.studentModel.countDocuments({ careerId: careerObjectId }),
      this.studentModel.countDocuments({
        careerId: careerObjectId,
        status: StudentStatus.ACTIVO,
        isActive: true,
      }),
      this.studentModel.countDocuments({
        careerId: careerObjectId,
        isActive: false,
      }),
      this.studentModel.countDocuments({
        careerId: careerObjectId,
        status: StudentStatus.GRADUADO,
      }),
      this.opportunityModel.countDocuments({ careerId: careerObjectId }),
      this.opportunityModel.countDocuments({
        careerId: careerObjectId,
        status: OpportunityStatus.ACTIVE,
        isActive: true,
      }),
      this.applicationModel.countDocuments({
        opportunityId: { $in: opportunityIds },
      }),
      this.applicationModel.countDocuments({
        opportunityId: { $in: opportunityIds },
        status: ApplicationStatus.PENDING,
      }),
      this.applicationModel.countDocuments({
        opportunityId: { $in: opportunityIds },
        status: ApplicationStatus.ACCEPTED,
      }),
      this.applicationModel.countDocuments({
        opportunityId: { $in: opportunityIds },
        status: ApplicationStatus.REJECTED,
      }),
    ]);

    return {
      students: {
        total: totalStudents,
        active: activeStudents,
        inactive: inactiveStudents,
        graduated: graduatedStudents,
      },
      opportunities: {
        total: totalOpportunities,
        active: activeOpportunities,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
      },
    };
  }

  async getAdminReports() {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    // Aplicaciones por mes (últimos 6 meses)
    const applicationsByMonth = await this.applicationModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Aplicaciones por estado
    const applicationsByStatus = await this.applicationModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Oportunidades más populares (top 10)
    const topOpportunities = await this.applicationModel
      .aggregate([
        {
          $group: {
            _id: '$opportunityId',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
        {
          $lookup: {
            from: 'opportunities',
            localField: '_id',
            foreignField: '_id',
            as: 'opportunity',
          },
        },
        {
          $unwind: '$opportunity',
        },
        {
          $project: {
            _id: 1,
            title: '$opportunity.title',
            count: 1,
          },
        },
      ])
      .exec();

    // Empresas más activas (top 10)
    const topCompanies = await this.opportunityModel
      .aggregate([
        {
          $group: {
            _id: '$companyId',
            opportunityCount: { $sum: 1 },
          },
        },
        {
          $sort: { opportunityCount: -1 },
        },
        {
          $limit: 10,
        },
        {
          $lookup: {
            from: 'companies',
            localField: '_id',
            foreignField: '_id',
            as: 'company',
          },
        },
        {
          $unwind: '$company',
        },
        {
          $lookup: {
            from: 'applications',
            localField: '_id',
            foreignField: 'opportunityId',
            as: 'applications',
          },
        },
        {
          $project: {
            _id: 1,
            name: '$company.name',
            opportunityCount: 1,
            applicationCount: { $size: '$applications' },
          },
        },
      ])
      .exec();

    // Carreras más demandadas
    const careersByApplications = await this.opportunityModel
      .aggregate([
        {
          $lookup: {
            from: 'applications',
            localField: '_id',
            foreignField: 'opportunityId',
            as: 'applications',
          },
        },
        {
          $unwind: '$careerId',
        },
        {
          $group: {
            _id: '$careerId',
            applicationCount: { $sum: { $size: '$applications' } },
            opportunityCount: { $sum: 1 },
          },
        },
        {
          $sort: { applicationCount: -1 },
        },
        {
          $limit: 10,
        },
        {
          $lookup: {
            from: 'careers',
            localField: '_id',
            foreignField: '_id',
            as: 'career',
          },
        },
        {
          $unwind: '$career',
        },
        {
          $project: {
            _id: 1,
            name: '$career.name',
            applicationCount: 1,
            opportunityCount: 1,
          },
        },
      ])
      .exec();

    // Distribución de estudiantes por carrera
    const studentsByCareer = await this.userModel
      .aggregate([
        {
          $match: {
            role: UserRole.ESTUDIANTE,
            isActive: true,
          },
        },
        {
          $lookup: {
            from: 'students',
            localField: '_id',
            foreignField: 'userId',
            as: 'student',
          },
        },
        {
          $unwind: '$student',
        },
        {
          $group: {
            _id: '$student.careerId',
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'careers',
            localField: '_id',
            foreignField: '_id',
            as: 'career',
          },
        },
        {
          $unwind: '$career',
        },
        {
          $project: {
            _id: 1,
            name: '$career.name',
            count: 1,
          },
        },
        {
          $sort: { count: -1 },
        },
      ])
      .exec();

    // Oportunidades por estado
    const opportunitiesByStatus = await this.opportunityModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Tasa de aceptación/rechazo
    const totalApplications = await this.applicationModel.countDocuments();
    const acceptedApplications = await this.applicationModel.countDocuments({
      status: ApplicationStatus.ACCEPTED,
    });
    const rejectedApplications = await this.applicationModel.countDocuments({
      status: ApplicationStatus.REJECTED,
    });
    const pendingApplications = await this.applicationModel.countDocuments({
      status: ApplicationStatus.PENDING,
    });

    const acceptanceRate =
      totalApplications > 0
        ? ((acceptedApplications / totalApplications) * 100).toFixed(2)
        : '0.00';
    const rejectionRate =
      totalApplications > 0
        ? ((rejectedApplications / totalApplications) * 100).toFixed(2)
        : '0.00';

    // Match scores promedio
    const matchScoreStats = await this.applicationModel.aggregate([
      {
        $match: {
          matchScore: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$matchScore' },
          min: { $min: '$matchScore' },
          max: { $max: '$matchScore' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Actividades de práctica profesional por estado
    const activitiesByStatus = await this.practiceActivityModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: '$hours' },
        },
      },
    ]);

    // Crecimiento de usuarios (último año)
    const usersGrowth = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return {
      applicationsByMonth: applicationsByMonth.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        count: item.count,
      })),
      applicationsByStatus: applicationsByStatus.map((item) => ({
        status: item._id,
        count: item.count,
      })),
      topOpportunities: topOpportunities.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        applicationsCount: item.count,
      })),
      topCompanies: topCompanies.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        opportunitiesCount: item.opportunityCount,
        applicationsCount: item.applicationCount,
      })),
      careersByApplications: careersByApplications.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        applicationsCount: item.applicationCount,
        opportunitiesCount: item.opportunityCount,
      })),
      studentsByCareer: studentsByCareer.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        count: item.count,
      })),
      opportunitiesByStatus: opportunitiesByStatus.map((item) => ({
        status: item._id,
        count: item.count,
      })),
      applicationRates: {
        total: totalApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
        pending: pendingApplications,
        acceptanceRate: parseFloat(acceptanceRate),
        rejectionRate: parseFloat(rejectionRate),
      },
      matchScoreStats:
        matchScoreStats.length > 0
          ? {
              average: parseFloat(matchScoreStats[0].avg.toFixed(2)),
              min: matchScoreStats[0].min,
              max: matchScoreStats[0].max,
              count: matchScoreStats[0].count,
            }
          : null,
      activitiesByStatus: activitiesByStatus.map((item) => ({
        status: item._id,
        count: item.count,
        totalHours: item.totalHours || 0,
      })),
      usersGrowth: usersGrowth.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        role: item._id.role,
        count: item.count,
      })),
    };
  }
}
