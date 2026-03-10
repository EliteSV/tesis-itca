import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { MulterFile } from '@/common/types/multer.types';
import {
  Company,
  CompanyDocument,
  CompanyStatus,
} from '@/modules/companies/schemas/company.schema';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import {
  CompanyInvitation,
  CompanyInvitationDocument,
} from '@/modules/companies/schemas/company-invitation.schema';
import { CreateCompanyDto } from '@/modules/companies/dto/create-company.dto';
import { UpdateCompanyDto } from '@/modules/companies/dto/update-company.dto';
import { CreateInvitationDto } from '@/modules/companies/dto/create-invitation.dto';
import { SendInvitationEmailDto } from '@/modules/companies/dto/send-invitation-email.dto';
import { CreateCompanyUserDto } from '@/modules/companies/dto/create-company-user.dto';
import { UpdateCompanyUserDto } from '@/modules/companies/dto/update-company-user.dto';
import { UserRole } from '@/modules/auth/schemas/user.schema';
import { EmailService } from '@/modules/email/email.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(CompanyInvitation.name)
    private invitationModel: Model<CompanyInvitationDocument>,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'logos');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  async create(createCompanyDto: CreateCompanyDto, logo?: MulterFile) {
    const existingCompany = await this.companyModel.findOne({
      nit: createCompanyDto.nit,
    });

    if (existingCompany) {
      throw new ConflictException('Ya existe una empresa con este NIT');
    }

    let logoPath: string | undefined;
    if (logo) {
      logoPath = `/uploads/logos/${logo.filename}`;
    }

    const company = new this.companyModel({
      name: createCompanyDto.name,
      nit: createCompanyDto.nit,
      address: createCompanyDto.address,
      phone: createCompanyDto.phone,
      email: createCompanyDto.email,
      sector: createCompanyDto.sector,
      description: createCompanyDto.description,
      status: createCompanyDto.status || CompanyStatus.ACTIVE,
      logo: logoPath,
    });
    const savedCompany = await company.save();

    if (createCompanyDto.initialUser) {
      const existingUser = await this.userModel.findOne({
        email: createCompanyDto.initialUser.email,
      });

      if (existingUser) {
        await this.companyModel.findByIdAndDelete(savedCompany._id);
        throw new ConflictException(
          'Ya existe un usuario con este correo electrónico',
        );
      }

      const hashedPassword = await bcrypt.hash(
        createCompanyDto.initialUser.password,
        10,
      );

      const user = new this.userModel({
        name: createCompanyDto.initialUser.name,
        email: createCompanyDto.initialUser.email,
        password: hashedPassword,
        role: UserRole.COMPANY,
        companyId: savedCompany._id,
        isActive: true,
      });

      await user.save();
    }

    return savedCompany;
  }

  async findAll(page = 1, limit = 10, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const query: {
      $or?: Array<{
        name?: { $regex: string; $options: string };
        nit?: { $regex: string; $options: string };
        email?: { $regex: string; $options: string };
      }>;
      status?: string;
    } = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nit: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const [data, total] = await Promise.all([
      this.companyModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.companyModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const company = await this.companyModel.findById(id).exec();

    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return company;
  }

  async findUsersByCompany(companyId: string, currentUserId?: string) {
    try {
      const objectId = new Types.ObjectId(companyId);
      const users = await this.userModel
        .find({
          companyId: objectId,
          role: UserRole.COMPANY,
        })
        .select('-password')
        .lean()
        .exec();

      const usersList = [...users];

      if (currentUserId) {
        const currentUserIdStr = currentUserId.toString();
        const currentUserInList = usersList.some((user) => {
          const userIdStr = user._id.toString();
          return userIdStr === currentUserIdStr;
        });

        if (!currentUserInList) {
          const currentUserIdObj = new Types.ObjectId(currentUserId);
          const currentUser = await this.userModel
            .findById(currentUserIdObj)
            .select('-password')
            .lean()
            .exec();

          if (
            currentUser &&
            currentUser.role === UserRole.COMPANY &&
            currentUser.companyId &&
            currentUser.companyId.toString() === companyId
          ) {
            usersList.push(currentUser);
          }
        }
      }

      return usersList;
    } catch {
      return [];
    }
  }

  async createCompanyUser(
    companyId: string,
    createUserDto: CreateCompanyUserDto,
  ) {
    await this.findOne(companyId);

    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con este correo electrónico',
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      role: UserRole.COMPANY,
      companyId: new Types.ObjectId(companyId),
      isActive: true,
    });

    const savedUser = await user.save();

    return {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      companyId: savedUser.companyId,
      isActive: savedUser.isActive,
    };
  }

  async updateCompanyUser(
    companyId: string,
    userId: string,
    updateUserDto: UpdateCompanyUserDto,
  ) {
    await this.findOne(companyId);

    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(userId),
      companyId: new Types.ObjectId(companyId),
      role: UserRole.COMPANY,
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado en esta empresa');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: new Types.ObjectId(userId) },
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
      password?: string;
    } = {};

    if (updateUserDto.name) {
      updateData.name = updateUserDto.name;
    }

    if (updateUserDto.email) {
      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return updatedUser;
  }

  async removeCompanyUser(companyId: string, userId: string) {
    await this.findOne(companyId);

    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(userId),
      companyId: new Types.ObjectId(companyId),
      role: UserRole.COMPANY,
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado en esta empresa');
    }

    await this.userModel.findByIdAndDelete(userId).exec();

    return { message: 'Usuario eliminado exitosamente' };
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    logo?: MulterFile,
  ) {
    if (updateCompanyDto.nit) {
      const existingCompany = await this.companyModel.findOne({
        nit: updateCompanyDto.nit,
        _id: { $ne: id },
      });

      if (existingCompany) {
        throw new ConflictException('Ya existe una empresa con este NIT');
      }
    }

    const existingCompany = await this.companyModel.findById(id).exec();
    if (!existingCompany) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const updateData: {
      name?: string;
      nit?: string;
      address?: string;
      phone?: string;
      email?: string;
      sector?: string;
      description?: string;
      status?: string;
      isActive?: boolean;
      logo?: string;
    } = { ...updateCompanyDto };

    if (logo) {
      const logoPath = `/uploads/logos/${logo.filename}`;
      updateData.logo = logoPath;

      if (existingCompany.logo) {
        const logoFileName = path.basename(existingCompany.logo);
        const oldLogoPath = path.join(
          process.cwd(),
          'uploads',
          'logos',
          logoFileName,
        );
        try {
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        } catch (error) {
          console.error('Error al eliminar logo anterior:', error);
        }
      }
    }

    const company = await this.companyModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
      .exec();

    return company;
  }

  async remove(id: string) {
    const company = await this.companyModel.findById(id).exec();

    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const usersCount = await this.userModel.countDocuments({ companyId: id });

    if (usersCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar la empresa porque tiene usuarios asociados',
      );
    }

    await this.companyModel.findByIdAndDelete(id).exec();
    return { message: 'Empresa eliminada exitosamente' };
  }

  async toggleStatus(id: string) {
    const company = await this.companyModel.findById(id).exec();

    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    company.isActive = !company.isActive;
    await company.save();

    return company;
  }

  async createInvitation(createInvitationDto: CreateInvitationDto) {
    const expiresInDays = createInvitationDto.expiresInDays || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const token = crypto.randomBytes(32).toString('hex');

    const invitation = new this.invitationModel({
      token,
      expiresAt,
      isUsed: false,
    });

    const savedInvitation = await invitation.save();

    return {
      _id: savedInvitation._id.toString(),
      token: savedInvitation.token,
      invitationLink: `${this.configService.get<string>('frontendUrl') || 'http://localhost:5173'}/invitation/${savedInvitation.token}`,
      expiresAt: savedInvitation.expiresAt,
      isUsed: savedInvitation.isUsed,
      createdAt: savedInvitation.createdAt,
    };
  }

  async sendInvitationEmail(sendInvitationEmailDto: SendInvitationEmailDto) {
    const expiresInDays = sendInvitationEmailDto.expiresInDays || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const token = crypto.randomBytes(32).toString('hex');

    const invitation = new this.invitationModel({
      token,
      expiresAt,
      isUsed: false,
    });

    const savedInvitation = await invitation.save();

    const invitationLink = `${this.configService.get<string>('frontendUrl') || 'http://localhost:5173'}/invitation/${savedInvitation.token}`;

    try {
      await this.emailService.sendCompanyInvitation(
        sendInvitationEmailDto.email,
        invitationLink,
        expiresInDays,
      );
    } catch (error) {
      await this.invitationModel.findByIdAndDelete(savedInvitation._id);
      throw error;
    }

    return {
      _id: savedInvitation._id.toString(),
      token: savedInvitation.token,
      invitationLink,
      expiresAt: savedInvitation.expiresAt,
      isUsed: savedInvitation.isUsed,
      createdAt: savedInvitation.createdAt,
      email: sendInvitationEmailDto.email,
      message: 'Invitación enviada exitosamente por correo electrónico',
    };
  }

  async getCompanyByUserId(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.companyId) {
      throw new NotFoundException(
        'Usuario no encontrado o no tiene una empresa asociada',
      );
    }

    const company = await this.companyModel.findById(user.companyId).exec();
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    return company;
  }

  async createCompanyForUser(
    userId: string,
    createCompanyDto: CreateCompanyDto,
  ) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.companyId) {
      throw new ConflictException('El usuario ya tiene una empresa asociada');
    }

    const existingCompany = await this.companyModel.findOne({
      nit: createCompanyDto.nit,
    });

    if (existingCompany) {
      throw new ConflictException('Ya existe una empresa con este NIT');
    }

    const company = new this.companyModel({
      name: createCompanyDto.name,
      nit: createCompanyDto.nit,
      address: createCompanyDto.address,
      phone: createCompanyDto.phone,
      email: createCompanyDto.email,
      sector: createCompanyDto.sector,
      description: createCompanyDto.description,
      status: createCompanyDto.status || CompanyStatus.ACTIVE,
    });

    const savedCompany = await company.save();

    user.companyId = savedCompany._id;
    await user.save();

    return savedCompany;
  }

  async updateCompanyByUserId(
    userId: string,
    updateCompanyDto: UpdateCompanyDto,
    logo?: MulterFile,
  ) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.companyId) {
      throw new NotFoundException(
        'Usuario no encontrado o no tiene una empresa asociada',
      );
    }

    return this.update(user.companyId.toString(), updateCompanyDto, logo);
  }
}
