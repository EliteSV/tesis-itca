import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsService } from '@/modules/students/students.service';
import { StudentsController } from '@/modules/students/students.controller';
import {
  Student,
  StudentSchema,
} from '@/modules/students/schemas/student.schema';
import { User, UserSchema } from '@/modules/auth/schemas/user.schema';
import { Career, CareerSchema } from '@/modules/careers/schemas/career.schema';
import { StudentOwnershipGuard } from '@/common/guards/student-ownership.guard';
import {
  PracticeProfessional,
  PracticeProfessionalSchema,
} from '@/modules/practice-professional/schemas/practice-professional.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: User.name, schema: UserSchema },
      { name: Career.name, schema: CareerSchema },
      {
        name: PracticeProfessional.name,
        schema: PracticeProfessionalSchema,
      },
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService, StudentOwnershipGuard],
  exports: [StudentsService],
})
export class StudentsModule {}
