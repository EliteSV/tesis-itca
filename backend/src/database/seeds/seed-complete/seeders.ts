import { Connection } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole } from '@/modules/auth/schemas/user.schema';
import { CompanyStatus } from '@/modules/companies/schemas/company.schema';
import { StudentStatus } from '@/modules/students/schemas/student.schema';
import {
  OpportunityStatus,
  OpportunityModality,
  OpportunityWorkType,
} from '@/modules/opportunities/schemas/opportunity.schema';
import { ApplicationStatus } from '@/modules/opportunities/schemas/application.schema';
import { SeedData, OpportunityTemplates } from './types';

export class SeedSeeders {
  constructor(protected readonly connection: Connection) {}

  protected async exists(
    collectionName: string,
    filter: object,
  ): Promise<boolean> {
    const collection = this.connection.collection(collectionName);
    const count = await collection.countDocuments(filter);
    return count > 0;
  }
  async seedCareerCategories(
    categories: SeedData['careerCategories'],
  ): Promise<void> {
    const collection = this.connection.collection('careercategories');

    for (const category of categories) {
      const exists = await this.exists('careercategories', {
        name: category.name,
      });
      if (!exists) {
        await collection.insertOne({
          ...category,
          isActive: true,
        });
      }
    }

    console.log(`Categorías de carrera procesadas: ${categories.length}`);
  }

  async seedCareers(careers: SeedData['careers']): Promise<void> {
    const categoriesCollection = this.connection.collection('careercategories');
    const careersCollection = this.connection.collection('careers');

    const categories = await categoriesCollection.find({}).toArray();
    const categoryMap = new Map(
      categories.map((cat: any) => [cat.name.toLowerCase().trim(), cat._id]),
    );

    let insertedCount = 0;
    for (const career of careers) {
      const exists = await this.exists('careers', { code: career.code });
      if (exists) continue;

      let categoryId: any = null;
      if (career.categoryName) {
        categoryId = categoryMap.get(career.categoryName.toLowerCase().trim());
      }

      if (!categoryId && categories.length > 0) {
        categoryId =
          categories[Math.floor(Math.random() * categories.length)]._id;
      }

      if (categoryId) {
        await careersCollection.insertOne({
          code: career.code,
          name: career.name,
          categoryId,
          description: career.description,
          duration: career.duration,
          isActive: true,
        });
        insertedCount++;
      }
    }

    console.log(`Carreras procesadas: ${insertedCount} de ${careers.length}`);
  }

  async seedCompanies(companies: SeedData['companies']): Promise<void> {
    const collection = this.connection.collection('companies');

    for (const company of companies) {
      const exists = await this.exists('companies', { nit: company.nit });
      if (!exists) {
        await collection.insertOne({
          ...company,
          status: CompanyStatus.ACTIVE,
          isActive: true,
        });
      }
    }

    console.log(`Empresas procesadas: ${companies.length}`);
  }

  async seedCompanyUsers(): Promise<void> {
    const companiesCollection = this.connection.collection('companies');
    const usersCollection = this.connection.collection('users');
    const password = 'Itca123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const companiesList = await companiesCollection.find({}).toArray();

    for (const company of companiesList) {
      const userExists = await this.exists('users', {
        email: company.email,
        companyId: company._id,
      });

      if (!userExists) {
        await usersCollection.insertOne({
          email: company.email,
          password: hashedPassword,
          name: `Usuario ${company.name}`,
          role: UserRole.COMPANY,
          companyId: company._id,
          isActive: true,
          isTemporaryPassword: false,
        });
      }
    }

    console.log(`Usuarios de empresa procesados`);
  }

  async seedStudents(students: SeedData['students']): Promise<void> {
    const careersCollection = this.connection.collection('careers');
    const usersCollection = this.connection.collection('users');
    const studentsCollection = this.connection.collection('students');
    const password = 'Itca123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const careers = await careersCollection.find({}).toArray();
    if (careers.length === 0) {
      console.log('No hay carreras disponibles para asignar estudiantes');
      return;
    }

    const careerMap = new Map(careers.map((c: any) => [c.code, c._id]));

    let insertedCount = 0;
    for (const student of students) {
      const studentExists = await this.exists('students', {
        email: student.email,
      });
      if (studentExists) continue;

      let career: any = null;
      if (student.careerCode) {
        const careerId = careerMap.get(student.careerCode);
        if (careerId) {
          career = careers.find((c: any) => c._id.equals(careerId));
        }
      }

      if (!career) {
        career = careers[Math.floor(Math.random() * careers.length)];
      }

      const userResult = await usersCollection.insertOne({
        email: student.email,
        password: hashedPassword,
        name: `${student.firstName} ${student.lastName}`,
        role: UserRole.ESTUDIANTE,
        isActive: true,
        isTemporaryPassword: false,
      });

      await studentsCollection.insertOne({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        identificationNumber: student.identificationNumber,
        phone: student.phone,
        address: student.address,
        dateOfBirth: new Date(student.dateOfBirth),
        gender: student.gender,
        careerId: career._id,
        status: StudentStatus.ACTIVO,
        userId: userResult.insertedId,
        isActive: true,
      });
      insertedCount++;
    }

    console.log(
      `Estudiantes procesados: ${insertedCount} de ${students.length}`,
    );
  }

  async seedOpportunities(
    opportunities: SeedData['opportunities'],
    templates: OpportunityTemplates,
  ): Promise<void> {
    const companiesCollection = this.connection.collection('companies');
    const careersCollection = this.connection.collection('careers');
    const usersCollection = this.connection.collection('users');
    const opportunitiesCollection = this.connection.collection('opportunities');

    const companies = await companiesCollection.find({}).toArray();
    const careers = await careersCollection.find({}).toArray();

    if (companies.length === 0 || careers.length === 0) {
      console.log(
        'No hay empresas o carreras disponibles para crear oportunidades',
      );
      return;
    }

    const { titles, descriptions, activities } = templates;

    if (
      titles.length === 0 ||
      descriptions.length === 0 ||
      activities.length === 0
    ) {
      console.log(
        'Los templates de oportunidades están vacíos. No se generarán oportunidades adicionales.',
      );
    }

    let insertedCount = 0;

    for (const opportunity of opportunities) {
      let company = companies.find(
        (c: any) =>
          c.name.toLowerCase().trim() ===
          opportunity.companyName?.toLowerCase().trim(),
      );
      if (!company) {
        company = companies[Math.floor(Math.random() * companies.length)];
      }

      let career = careers.find((c: any) => c.code === opportunity.careerCode);
      if (!career) {
        career = careers[Math.floor(Math.random() * careers.length)];
      }

      const companyUser = await usersCollection.findOne({
        companyId: company._id,
        role: UserRole.COMPANY,
      });

      const expirationDate = new Date();
      expirationDate.setDate(
        expirationDate.getDate() + Math.floor(Math.random() * 60) + 30,
      );

      const shareToken = crypto.randomBytes(32).toString('hex');

      await opportunitiesCollection.insertOne({
        title: opportunity.title,
        description: opportunity.description,
        activities: opportunity.activities,
        careerId: career._id,
        companyId: company._id,
        responsibleUserId: companyUser?._id,
        totalHours: opportunity.totalHours,
        availablePositions: opportunity.availablePositions,
        modality: opportunity.modality as OpportunityModality,
        workType: opportunity.workType as OpportunityWorkType,
        expirationDate,
        status: OpportunityStatus.ACTIVE,
        isActive: true,
        shareToken,
      });
      insertedCount++;
    }

    const targetCount = 50;
    const existingCount = await opportunitiesCollection.countDocuments({});
    const needed = Math.max(0, targetCount - existingCount);

    if (needed > 0) {
      console.log(
        `Generando ${needed} oportunidades adicionales para llegar a ${targetCount}...`,
      );

      for (let i = 0; i < needed; i++) {
        const company = companies[Math.floor(Math.random() * companies.length)];
        const career = careers[Math.floor(Math.random() * careers.length)];

        const companyUser = await usersCollection.findOne({
          companyId: company._id,
          role: UserRole.COMPANY,
        });

        const expirationDate = new Date();
        expirationDate.setDate(
          expirationDate.getDate() + Math.floor(Math.random() * 60) + 30,
        );

        const shareToken = crypto.randomBytes(32).toString('hex');
        const titleIndex =
          titles.length > 0 ? Math.floor(Math.random() * titles.length) : 0;
        const title =
          titles.length > 0
            ? `${titles[titleIndex]} ${i + 1}`
            : `Oportunidad de Práctica ${i + 1}`;
        const description =
          descriptions.length > 0
            ? descriptions[Math.floor(Math.random() * descriptions.length)]
            : 'Oportunidad para desarrollar habilidades profesionales';
        const activity =
          activities.length > 0
            ? activities[Math.floor(Math.random() * activities.length)]
            : 'Desarrollo de actividades profesionales';

        await opportunitiesCollection.insertOne({
          title,
          description,
          activities: activity,
          careerId: career._id,
          companyId: company._id,
          responsibleUserId: companyUser?._id,
          totalHours: Math.floor(Math.random() * 300) + 200,
          availablePositions: Math.floor(Math.random() * 5) + 1,
          modality:
            Math.random() > 0.5
              ? OpportunityModality.PRESENCIAL
              : OpportunityModality.REMOTO,
          workType:
            Math.random() > 0.5
              ? OpportunityWorkType.FULL_TIME
              : OpportunityWorkType.PART_TIME,
          expirationDate,
          status: OpportunityStatus.ACTIVE,
          isActive: true,
          shareToken,
        });
        insertedCount++;
      }
    }

    console.log(
      `Oportunidades procesadas: ${insertedCount} (total: ${await opportunitiesCollection.countDocuments({})})`,
    );
  }

  async seedApplications(): Promise<void> {
    const studentsCollection = this.connection.collection('students');
    const opportunitiesCollection = this.connection.collection('opportunities');
    const applicationsCollection = this.connection.collection('applications');

    const students = await studentsCollection.find({}).toArray();
    const opportunities = await opportunitiesCollection
      .find({
        status: OpportunityStatus.ACTIVE,
      })
      .toArray();

    if (students.length === 0 || opportunities.length === 0) {
      console.log(
        'No hay estudiantes u oportunidades disponibles para crear aplicaciones',
      );
      return;
    }

    const opportunitiesWithManyApplications = Math.min(5, opportunities.length);
    const selectedOpportunities = opportunities
      .sort(() => Math.random() - 0.5)
      .slice(0, opportunitiesWithManyApplications);

    const createdApplications = new Set<string>();
    const studentsWithAcceptedApplication = new Set<string>();
    let totalApplications = 0;
    let acceptedApplicationsCount = 0;

    for (const opportunity of selectedOpportunities) {
      const applicationsForOpportunity = 20;
      let createdForOpportunity = 0;

      const shuffledStudents = students.sort(() => Math.random() - 0.5);

      for (const student of shuffledStudents) {
        if (createdForOpportunity >= applicationsForOpportunity) break;

        const applicationKey = `${student.userId}_${opportunity._id}`;
        if (createdApplications.has(applicationKey)) continue;

        const exists = await this.exists('applications', {
          studentId: student.userId,
          opportunityId: opportunity._id,
        });

        if (!exists) {
          const hasAcceptedApplication = studentsWithAcceptedApplication.has(
            student.userId.toString(),
          );

          let status: ApplicationStatus;
          if (hasAcceptedApplication) {
            status =
              Math.random() < 0.5
                ? ApplicationStatus.PENDING
                : ApplicationStatus.REJECTED;
          } else if (acceptedApplicationsCount === 0 && Math.random() < 0.1) {
            status = ApplicationStatus.ACCEPTED;
            studentsWithAcceptedApplication.add(student.userId.toString());
            acceptedApplicationsCount++;
          } else {
            status =
              Math.random() < 0.5
                ? ApplicationStatus.PENDING
                : ApplicationStatus.REJECTED;
          }

          const daysAgo = Math.floor(Math.random() * 56) + 1;
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - daysAgo);
          createdAt.setHours(
            Math.floor(Math.random() * 24),
            Math.floor(Math.random() * 60),
            0,
            0,
          );

          const updatedAt = new Date(createdAt);
          if (status !== ApplicationStatus.PENDING) {
            const daysAfter = Math.floor(Math.random() * daysAgo) + 1;
            updatedAt.setDate(updatedAt.getDate() + daysAfter);
          }

          await applicationsCollection.insertOne({
            opportunityId: opportunity._id,
            studentId: student.userId,
            coverLetter: `Estimados señores, me dirijo a ustedes para expresar mi interés en la oportunidad de práctica profesional "${opportunity.title}". Considero que esta posición se alinea perfectamente con mis objetivos profesionales y mi formación académica.`,
            status,
            rejectionReason:
              status === ApplicationStatus.REJECTED
                ? 'No cumple con los requisitos mínimos solicitados'
                : undefined,
            createdAt,
            updatedAt,
          });

          createdApplications.add(applicationKey);
          createdForOpportunity++;
          totalApplications++;
        }
      }
    }

    const remainingOpportunities = opportunities.filter(
      (opp) => !selectedOpportunities.some((so) => so._id.equals(opp._id)),
    );

    const additionalApplications = Math.floor(students.length * 0.3);
    for (
      let i = 0;
      i < additionalApplications && remainingOpportunities.length > 0;
      i++
    ) {
      const randomStudent =
        students[Math.floor(Math.random() * students.length)];
      const randomOpportunity =
        remainingOpportunities[
          Math.floor(Math.random() * remainingOpportunities.length)
        ];

      const applicationKey = `${randomStudent.userId}_${randomOpportunity._id}`;
      if (createdApplications.has(applicationKey)) continue;

      const exists = await this.exists('applications', {
        studentId: randomStudent.userId,
        opportunityId: randomOpportunity._id,
      });

      if (!exists) {
        const hasAcceptedApplication = studentsWithAcceptedApplication.has(
          randomStudent.userId.toString(),
        );

        let status: ApplicationStatus;
        if (hasAcceptedApplication || acceptedApplicationsCount > 0) {
          status =
            Math.random() < 0.5
              ? ApplicationStatus.PENDING
              : ApplicationStatus.REJECTED;
        } else {
          const statuses = [
            ApplicationStatus.PENDING,
            ApplicationStatus.ACCEPTED,
            ApplicationStatus.REJECTED,
          ];
          status = statuses[Math.floor(Math.random() * statuses.length)];
          if (status === ApplicationStatus.ACCEPTED) {
            studentsWithAcceptedApplication.add(
              randomStudent.userId.toString(),
            );
            acceptedApplicationsCount++;
          }
        }

        const daysAgo = Math.floor(Math.random() * 56) + 1;
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);
        createdAt.setHours(
          Math.floor(Math.random() * 24),
          Math.floor(Math.random() * 60),
          0,
          0,
        );

        const updatedAt = new Date(createdAt);
        if (status !== ApplicationStatus.PENDING) {
          const daysAfter = Math.floor(Math.random() * daysAgo) + 1;
          updatedAt.setDate(updatedAt.getDate() + daysAfter);
        }

        await applicationsCollection.insertOne({
          opportunityId: randomOpportunity._id,
          studentId: randomStudent.userId,
          coverLetter: `Estimados señores, me dirijo a ustedes para expresar mi interés en la oportunidad de práctica profesional "${randomOpportunity.title}". Considero que esta posición se alinea perfectamente con mis objetivos profesionales y mi formación académica.`,
          status,
          rejectionReason:
            status === ApplicationStatus.REJECTED
              ? 'No cumple con los requisitos mínimos solicitados'
              : undefined,
          createdAt,
          updatedAt,
        });

        createdApplications.add(applicationKey);
        totalApplications++;
      }
    }

    console.log(
      `Aplicaciones procesadas: ${totalApplications} (${opportunitiesWithManyApplications} oportunidades con 20 aplicaciones cada una)`,
    );
  }
}

