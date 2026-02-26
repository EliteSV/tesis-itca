import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsService } from '@/modules/students/students.service';
import { StudentsController } from '@/modules/students/students.controller';
import { Student, StudentSchema } from '@/modules/students/schemas/student.schema';
import { User, UserSchema } from '@/modules/auth/schemas/user.schema';
import { Career, CareerSchema } from '@/modules/careers/schemas/career.schema';
import { StudentOwnershipGuard } from '@/common/guards/student-ownership.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: User.name, schema: UserSchema },
      { name: Career.name, schema: CareerSchema },
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService, StudentOwnershipGuard],
  exports: [StudentsService],
})
export class StudentsModule {}

