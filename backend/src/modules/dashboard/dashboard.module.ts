import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from '@/modules/dashboard/dashboard.controller';
import { DashboardService } from '@/modules/dashboard/dashboard.service';
import { User, UserSchema } from '@/modules/auth/schemas/user.schema';
import {
  Company,
  CompanySchema,
} from '@/modules/companies/schemas/company.schema';
import { Career, CareerSchema } from '@/modules/careers/schemas/career.schema';
import {
  CareerCategory,
  CareerCategorySchema,
} from '@/modules/career-categories/schemas/career-category.schema';
import {
  Opportunity,
  OpportunitySchema,
} from '@/modules/opportunities/schemas/opportunity.schema';
import {
  Application,
  ApplicationSchema,
} from '@/modules/opportunities/schemas/application.schema';
import {
  PracticeActivity,
  PracticeActivitySchema,
} from '@/modules/practice-professional/schemas/practice-activity.schema';
import {
  Student,
  StudentSchema,
} from '@/modules/students/schemas/student.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Career.name, schema: CareerSchema },
      { name: CareerCategory.name, schema: CareerCategorySchema },
      { name: Opportunity.name, schema: OpportunitySchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: PracticeActivity.name, schema: PracticeActivitySchema },
      { name: Student.name, schema: StudentSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
