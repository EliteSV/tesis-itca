import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  User,
  UserDocument,
  UserRole,
} from '@/modules/auth/schemas/user.schema';
import {
  Student,
  StudentDocument,
  StudentStatus,
} from '@/modules/students/schemas/student.schema';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { UpdateUserProfileDto } from '@/modules/auth/dto/update-user-profile.dto';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email, isActive: true });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isTemporaryPassword: user.isTemporaryPassword || false,
      careerId: user.careerId ? user.careerId.toString() : undefined,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const payload = { sub: user.id, email: user.email, role: user.role };

    let isProfileIncomplete = false;
    if (user.role === UserRole.ESTUDIANTE) {
      const student = await this.studentModel
        .findOne({ userId: new Types.ObjectId(user.id) })
        .lean()
        .exec();
      if (student && student.status === StudentStatus.PERFIL_INCOMPLETO) {
        isProfileIncomplete = true;
      }
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isTemporaryPassword: user.isTemporaryPassword,
        isProfileIncomplete,
        careerId: user.careerId,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingStudent = await this.studentModel.findOne({
      $or: [
        { email: registerDto.email },
        { identificationNumber: registerDto.identificationNumber },
      ],
    });

    if (existingStudent) {
      if (existingStudent.email === registerDto.email) {
        throw new ConflictException(
          'Ya existe un estudiante con este correo electrónico',
        );
      }
      if (
        existingStudent.identificationNumber ===
        registerDto.identificationNumber
      ) {
        throw new ConflictException(
          'Ya existe un estudiante con este número de identificación',
        );
      }
    }

    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
    });

    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con este correo electrónico',
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const user = new this.userModel({
      name: `${registerDto.firstName} ${registerDto.lastName}`,
      email: registerDto.email,
      password: hashedPassword,
      role: UserRole.ESTUDIANTE,
      isActive: true,
      isTemporaryPassword: false,
    });

    const savedUser = await user.save();

    const student = new this.studentModel({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      identificationNumber: registerDto.identificationNumber,
      phone: registerDto.phone,
      address: registerDto.address,
      dateOfBirth: registerDto.dateOfBirth
        ? new Date(registerDto.dateOfBirth)
        : undefined,
      gender: registerDto.gender,
      careerId: new Types.ObjectId(registerDto.careerId),
      status: StudentStatus.PERFIL_INCOMPLETO,
      userId: savedUser._id,
      isActive: true,
    });

    await student.save();

    const payload = {
      sub: savedUser._id.toString(),
      email: savedUser.email,
      role: savedUser.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser._id.toString(),
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        isTemporaryPassword: false,
        isProfileIncomplete: true,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let isProfileIncomplete = false;
    if (user.role === UserRole.ESTUDIANTE) {
      const student = await this.studentModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .lean()
        .exec();
      if (student && student.status === StudentStatus.PERFIL_INCOMPLETO) {
        isProfileIncomplete = true;
      }
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isTemporaryPassword: user.isTemporaryPassword || false,
      isProfileIncomplete,
    };
  }

  async updateProfile(userId: string, updateDto: UpdateUserProfileDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        email: updateDto.email,
        _id: { $ne: userId },
      });

      if (existingUser) {
        throw new ConflictException(
          'Ya existe un usuario con este correo electrónico',
        );
      }
    }

    const updateData: {
      name?: string;
      email?: string;
    } = {};

    if (updateDto.name) {
      updateData.name = updateDto.name;
    }

    if (updateDto.email) {
      updateData.email = updateDto.email;
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la contraseña actual',
      );
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      saltRounds,
    );

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { password: hashedPassword, isTemporaryPassword: false },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    };
  }

  async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    const existingStudent = await this.studentModel.findOne({ email });
    const existingUser = await this.userModel.findOne({ email });

    return {
      available: !existingStudent && !existingUser,
    };
  }
}
