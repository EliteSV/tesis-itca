import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Student,
  StudentDocument,
} from '@/modules/students/schemas/student.schema';

interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class StudentOwnershipGuard implements CanActivate {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(user.id) })
      .lean()
      .exec();

    if (!student) {
      throw new ForbiddenException(
        'No se encontró información de estudiante asociada a tu cuenta',
      );
    }

    request.user = {
      ...user,
      studentId: student._id.toString(),
    } as RequestUser & { studentId: string };

    return true;
  }
}
