import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { MulterFile } from '@/common/types/multer.types';
import {
  Student,
  StudentDocument,
  StudentStatus,
} from '@/modules/students/schemas/student.schema';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import { UserRole } from '@/modules/auth/schemas/user.schema';
import { CreateStudentDto } from '@/modules/students/dto/create-student.dto';
import { UpdateStudentDto } from '@/modules/students/dto/update-student.dto';
import {
  validateSocialServiceDocumentWithOpenAI,
  validatePassedSubjectsDocumentWithOpenAI,
  validateEnrollmentProofDocumentWithOpenAI,
} from '@/utils/openai-validator';

@Injectable()
export class StudentsService {
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
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  private generateRandomPassword(): string {
    const length = 12;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  async create(createStudentDto: CreateStudentDto) {
    const existingStudent = await this.studentModel.findOne({
      $or: [
        { email: createStudentDto.email },
        { identificationNumber: createStudentDto.identificationNumber },
      ],
    });

    if (existingStudent) {
      if (existingStudent.email === createStudentDto.email) {
        throw new ConflictException(
          'Ya existe un estudiante con este correo electrónico',
        );
      }
      if (
        existingStudent.identificationNumber ===
        createStudentDto.identificationNumber
      ) {
        throw new ConflictException(
          'Ya existe un estudiante con este número de identificación',
        );
      }
    }

    const existingUser = await this.userModel.findOne({
      email: createStudentDto.email,
    });

    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con este correo electrónico',
      );
    }

    const generatedPassword = this.generateRandomPassword();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds);

    const user = new this.userModel({
      name: `${createStudentDto.firstName} ${createStudentDto.lastName}`,
      email: createStudentDto.email,
      password: hashedPassword,
      role: UserRole.ESTUDIANTE,
      isActive: true,
      isTemporaryPassword: true,
    });

    const savedUser = await user.save();

    const student = new this.studentModel({
      ...createStudentDto,
      careerId: new Types.ObjectId(createStudentDto.careerId),
      status: StudentStatus.PERFIL_INCOMPLETO,
      userId: savedUser._id,
      dateOfBirth: createStudentDto.dateOfBirth
        ? new Date(createStudentDto.dateOfBirth)
        : undefined,
    });

    const savedStudent = await student.save();
    const studentObj = savedStudent.toObject();

    return {
      ...studentObj,
      generatedPassword,
    };
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    careerId?: string,
    status?: string,
    isActive?: boolean,
    sortBy?: string,
    sortOrder?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: {
      $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
      careerId?: Types.ObjectId;
      status?: StudentStatus;
      isActive?: boolean;
      createdAt?: { $gte?: Date; $lte?: Date };
    } = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { identificationNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (careerId) {
      query.careerId = new Types.ObjectId(careerId);
    }

    if (status) {
      query.status = status as StudentStatus;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    const sortField = sortBy || 'createdAt';
    const sortDirection: 1 | -1 = sortOrder === 'asc' ? 1 : -1;
    const sortObj: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [data, total] = await Promise.all([
      this.studentModel
        .find(query)
        .populate('careerId', 'name code')
        .skip(skip)
        .limit(limit)
        .sort(sortObj)
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

  async findOne(
    id: string,
    user?: { id: string; role: string; careerId?: string },
  ) {
    // Try to find by _id first (Student ID)
    let student = await this.studentModel
      .findById(id)
      .populate('careerId', 'name code')
      .lean()
      .exec();

    // If not found by _id, try to find by userId (User ID)
    if (!student) {
      student = await this.studentModel
        .findOne({ userId: new Types.ObjectId(id) })
        .populate('careerId', 'name code')
        .lean()
        .exec();
    }

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Si es coordinador, verificar que el estudiante pertenezca a su carrera
    if (user?.role === 'coordinador') {
      if (!user.careerId) {
        throw new ForbiddenException(
          'El coordinador no tiene una carrera asignada',
        );
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

      if (studentCareerId !== user.careerId) {
        throw new ForbiddenException(
          'No tienes permiso para ver este estudiante. Solo puedes ver estudiantes de tu carrera.',
        );
      }
    }

    return this.transformStudentWithCareer(student as Record<string, unknown>);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    if (updateStudentDto.email) {
      const existingStudent = await this.studentModel.findOne({
        email: updateStudentDto.email,
        _id: { $ne: id },
      });

      if (existingStudent) {
        throw new ConflictException(
          'Ya existe un estudiante con este correo electrónico',
        );
      }
    }

    if (updateStudentDto.identificationNumber) {
      const existingStudent = await this.studentModel.findOne({
        identificationNumber: updateStudentDto.identificationNumber,
        _id: { $ne: id },
      });

      if (existingStudent) {
        throw new ConflictException(
          'Ya existe un estudiante con este número de identificación',
        );
      }
    }

    const updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      identificationNumber?: string;
      phone?: string;
      address?: string;
      dateOfBirth?: Date;
      gender?: string;
      careerId?: Types.ObjectId;
    } = {
      firstName: updateStudentDto.firstName,
      lastName: updateStudentDto.lastName,
      email: updateStudentDto.email,
      identificationNumber: updateStudentDto.identificationNumber,
      phone: updateStudentDto.phone,
      address: updateStudentDto.address,
      gender: updateStudentDto.gender,
    };

    if (updateStudentDto.careerId) {
      updateData.careerId = new Types.ObjectId(updateStudentDto.careerId);
    }

    if (updateStudentDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateStudentDto.dateOfBirth);
    }

    const student = await this.studentModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .populate('careerId', 'name code')
      .lean()
      .exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (updateStudentDto.email) {
      const studentDoc = await this.studentModel.findById(id).exec();
      if (studentDoc && studentDoc.userId) {
        await this.userModel.findByIdAndUpdate(studentDoc.userId, {
          email: updateStudentDto.email,
          name: `${updateStudentDto.firstName || studentDoc.firstName} ${
            updateStudentDto.lastName || studentDoc.lastName
          }`,
        });
      }
    }

    return student;
  }

  async remove(id: string) {
    const student = await this.studentModel.findById(id).exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (student.userId) {
      await this.userModel.findByIdAndDelete(student.userId).exec();
    }

    await this.studentModel.findByIdAndDelete(id).exec();
    return { message: 'Estudiante eliminado exitosamente' };
  }

  async toggleStatus(id: string) {
    const student = await this.studentModel.findById(id).exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    student.isActive = !student.isActive;
    const saved = await student.save();

    if (student.userId) {
      await this.userModel.findByIdAndUpdate(student.userId, {
        isActive: saved.isActive,
      });
    }

    return saved.toObject();
  }

  async generateTemporaryPassword(id: string) {
    const student = await this.studentModel.findById(id).exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (!student.userId) {
      throw new NotFoundException('El estudiante no tiene un usuario asociado');
    }

    const generatedPassword = this.generateRandomPassword();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds);

    await this.userModel.findByIdAndUpdate(student.userId, {
      password: hashedPassword,
      isTemporaryPassword: true,
    });

    return {
      generatedPassword,
    };
  }

  async getStudentByUserId(userId: string) {
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('careerId', 'name code')
      .lean()
      .exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return student;
  }

  async updateMyProfile(userId: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (updateStudentDto.email && updateStudentDto.email !== student.email) {
      const existingStudent = await this.studentModel.findOne({
        email: updateStudentDto.email,
        _id: { $ne: student._id },
      });

      if (existingStudent) {
        throw new ConflictException(
          'Ya existe un estudiante con este correo electrónico',
        );
      }
    }

    if (
      updateStudentDto.identificationNumber &&
      updateStudentDto.identificationNumber !== student.identificationNumber
    ) {
      const existingStudent = await this.studentModel.findOne({
        identificationNumber: updateStudentDto.identificationNumber,
        _id: { $ne: student._id },
      });

      if (existingStudent) {
        throw new ConflictException(
          'Ya existe un estudiante con este número de identificación',
        );
      }
    }

    const updateData: any = { ...updateStudentDto };

    if (updateStudentDto.careerId) {
      updateData.careerId = new Types.ObjectId(updateStudentDto.careerId);
    }

    if (updateStudentDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateStudentDto.dateOfBirth);
    }

    const updatedStudent = await this.studentModel
      .findByIdAndUpdate(student._id, updateData, {
        new: true,
        runValidators: true,
      })
      .populate('careerId', 'name code')
      .lean()
      .exec();

    if (!updatedStudent) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (updateStudentDto.email || updateStudentDto.firstName || updateStudentDto.lastName) {
      const studentDoc = await this.studentModel.findById(student._id).exec();
      if (studentDoc && studentDoc.userId) {
        const updateUserData: {
          email?: string;
          name?: string;
        } = {};

        if (updateStudentDto.email) {
          updateUserData.email = updateStudentDto.email;
        }

        if (updateStudentDto.firstName || updateStudentDto.lastName) {
          updateUserData.name = `${updateStudentDto.firstName || studentDoc.firstName} ${
            updateStudentDto.lastName || studentDoc.lastName
          }`;
        }

        if (Object.keys(updateUserData).length > 0) {
          await this.userModel.findByIdAndUpdate(studentDoc.userId, updateUserData);
        }
      }
    }

    return updatedStudent;
  }

  async uploadSocialServiceDocument(userId: string, file: MulterFile) {
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Write buffer to a temp file so CLI tools (pdftotext, pdftoppm) can read it
    const tempFilePath = path.join(
      os.tmpdir(),
      `social-service-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`,
    );
    fs.writeFileSync(tempFilePath, file.buffer);

    let validationResult: Awaited<ReturnType<typeof validateSocialServiceDocumentWithOpenAI>>;
    try {
      const expectedStudentName = [student.firstName, student.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      validationResult = await validateSocialServiceDocumentWithOpenAI(
        tempFilePath,
        this.configService,
        {
          expectedStudentName,
          expectedIdentificationNumber: student.identificationNumber ?? '',
        },
      );
    } finally {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (error) {
        console.error('Error deleting temp social service document:', error);
      }
    }

    // Guardar el documento y la respuesta de validación en MongoDB (siempre, incluso si falla)
    student.socialServiceDocument = {
      fileData: file.buffer.toString('base64'),
      fileName: file.originalname,
      isValidated: validationResult.isValid,
      validatedAt: new Date(),
      validationErrors: validationResult.errors,
      validationWarnings: validationResult.warnings,
      hasValidStamp: validationResult.hasValidStamp,
      hasValidFormat: validationResult.hasValidFormat,
    };
    await student.save();

    // Si la validación falla, lanzar error pero el archivo ya está guardado
    if (!validationResult.isValid) {
      throw new BadRequestException(
        validationResult.errors.length > 0
          ? validationResult.errors.join(', ')
          : 'El documento no pasó la validación. Verifica que tenga el formato correcto y un sello oficial válido.',
      );
    }

    return student.toObject();
  }

  async uploadPassedSubjectsDocument(userId: string, file: MulterFile) {
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const tempFilePath = path.join(
      os.tmpdir(),
      `passed-subjects-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`,
    );
    fs.writeFileSync(tempFilePath, file.buffer);

    let validationResult: Awaited<ReturnType<typeof validatePassedSubjectsDocumentWithOpenAI>>;
    try {
      const expectedStudentName = [student.firstName, student.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      validationResult = await validatePassedSubjectsDocumentWithOpenAI(
        tempFilePath,
        this.configService,
        {
          expectedStudentName,
          expectedIdentificationNumber: student.identificationNumber ?? '',
        },
      );
    } finally {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (error) {
        console.error('Error deleting temp passed subjects document:', error);
      }
    }

    student.passedSubjectsDocument = {
      fileData: file.buffer.toString('base64'),
      fileName: file.originalname,
      isValidated: validationResult.isValid,
      validatedAt: new Date(),
      validationErrors: validationResult.errors,
      validationWarnings: validationResult.warnings,
      hasValidFormat: validationResult.hasValidFormat,
      passedSubjects: [],
      totalSubjects: validationResult.totalSubjects,
      passedCount: validationResult.passedCount,
      validationAccuracyPercent: validationResult.validationAccuracyPercent,
    };
    await student.save();

    if (!validationResult.isValid) {
      const message =
        validationResult.errors.length > 0
          ? validationResult.errors.join(', ')
          : 'El documento no pasó la validación. Verifica que tenga el formato correcto.';
      throw new BadRequestException({
        message,
        passedCount: validationResult.passedCount,
        totalSubjects: validationResult.totalSubjects,
      });
    }

    return student.toObject();
  }

  async deleteSocialServiceDocument(userId: string) {
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    student.socialServiceDocument = undefined;
    await student.save();

    return student.toObject();
  }

  async deletePassedSubjectsDocument(userId: string) {
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    student.passedSubjectsDocument = undefined;
    await student.save();

    return student.toObject();
  }

  async uploadEnrollmentProofDocument(userId: string, file: MulterFile) {
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const tempFilePath = path.join(
      os.tmpdir(),
      `enrollment-proof-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`,
    );
    fs.writeFileSync(tempFilePath, file.buffer);

    let validationResult: Awaited<ReturnType<typeof validateEnrollmentProofDocumentWithOpenAI>>;
    try {
      const expectedStudentName = [student.firstName, student.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      validationResult = await validateEnrollmentProofDocumentWithOpenAI(
        tempFilePath,
        this.configService,
        {
          expectedStudentName,
          expectedIdentificationNumber: student.identificationNumber ?? '',
        },
      );
    } finally {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (error) {
        console.error('Error deleting temp enrollment proof document:', error);
      }
    }

    student.enrollmentProofDocument = {
      fileData: file.buffer.toString('base64'),
      fileName: file.originalname,
      isValidated: validationResult.isValid,
      validatedAt: new Date(),
      validationErrors: validationResult.errors,
      validationWarnings: validationResult.warnings,
      documentStudentName: validationResult.documentStudentName,
      documentIdentificationNumber: validationResult.documentIdentificationNumber,
      cycle: validationResult.cycle,
      enrolledSubjects: validationResult.enrolledSubjects,
    };
    await student.save();

    if (!validationResult.isValid) {
      throw new BadRequestException(
        validationResult.errors.length > 0
          ? validationResult.errors.join(', ')
          : 'El comprobante de inscripción no pasó la validación. Verifica el formato.',
      );
    }

    return student.toObject();
  }

  async deleteEnrollmentProofDocument(userId: string) {
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    student.enrollmentProofDocument = undefined;
    await student.save();

    return student.toObject();
  }

  async findByUserId(userId: string) {
    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('careerId', 'name code description duration')
      .lean()
      .exec();

    if (!student) {
      throw new NotFoundException(
        'Estudiante no encontrado. Por favor, completa tu perfil de estudiante.',
      );
    }

    return student;
  }
}
