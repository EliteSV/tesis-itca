import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PracticeProfessionalController } from './practice-professional.controller';
import { PracticeProfessionalCompanyController } from './practice-professional-company.controller';
import { PracticeProfessionalAdminController } from './practice-professional-admin.controller';
import { PracticeProfessionalService } from './practice-professional.service';
import { HolidaysService } from './holidays.service';
import {
  PracticeActivity,
  PracticeActivitySchema,
} from './schemas/practice-activity.schema';
import {
  Application,
  ApplicationSchema,
} from '@/modules/opportunities/schemas/application.schema';
import {
  Opportunity,
  OpportunitySchema,
} from '@/modules/opportunities/schemas/opportunity.schema';
import { Student, StudentSchema } from '@/modules/students/schemas/student.schema';
import { User, UserSchema } from '@/modules/auth/schemas/user.schema';
import { StudentsModule } from '@/modules/students/students.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PracticeActivity.name, schema: PracticeActivitySchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Opportunity.name, schema: OpportunitySchema },
      { name: Student.name, schema: StudentSchema },
      { name: User.name, schema: UserSchema },
    ]),
    StudentsModule,
  ],
  controllers: [
    PracticeProfessionalController,
    PracticeProfessionalCompanyController,
    PracticeProfessionalAdminController,
  ],
  providers: [PracticeProfessionalService, HolidaysService],
  exports: [PracticeProfessionalService],
})
export class PracticeProfessionalModule {}

