import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  CompanyInvitation,
  CompanyInvitationDocument,
} from '@/modules/companies/schemas/company-invitation.schema';
import {
  Company,
  CompanyDocument,
  CompanyStatus,
} from '@/modules/companies/schemas/company.schema';
import {
  User,
  UserDocument,
  UserRole,
} from '@/modules/auth/schemas/user.schema';
import { AcceptInvitationDto } from '@/modules/companies/dto/accept-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel(CompanyInvitation.name)
    private invitationModel: Model<CompanyInvitationDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async validateInvitation(token: string) {
    const invitation = await this.invitationModel.findOne({ token }).exec();

    if (!invitation) {
      return {
        isValid: false,
        message: 'Token de invitación no encontrado',
      };
    }

    if (invitation.isUsed) {
      return {
        isValid: false,
        message: 'Esta invitación ya ha sido utilizada',
      };
    }

    if (new Date() > invitation.expiresAt) {
      return {
        isValid: false,
        message: 'Esta invitación ha expirado',
      };
    }

    return {
      isValid: true,
      message: 'Invitación válida',
    };
  }

  async acceptInvitation(
    token: string,
    acceptInvitationDto: AcceptInvitationDto,
  ) {
    if (!acceptInvitationDto?.company || !acceptInvitationDto?.user) {
      throw new BadRequestException(
        'Los datos de la empresa y usuario son requeridos',
      );
    }

    const invitation = await this.invitationModel.findOne({ token }).exec();

    if (!invitation) {
      throw new NotFoundException('Token de invitación no encontrado');
    }

    if (invitation.isUsed) {
      throw new BadRequestException('Esta invitación ya ha sido utilizada');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Esta invitación ha expirado');
    }

    const existingCompany = await this.companyModel.findOne({
      nit: acceptInvitationDto.company.nit,
    });

    if (existingCompany) {
      throw new ConflictException('Ya existe una empresa con este NIT');
    }

    const existingUser = await this.userModel.findOne({
      email: acceptInvitationDto.user.email,
    });

    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con este correo electrónico',
      );
    }

    const company = new this.companyModel({
      name: acceptInvitationDto.company.name,
      nit: acceptInvitationDto.company.nit,
      address: acceptInvitationDto.company.address,
      phone: acceptInvitationDto.company.phone,
      email: acceptInvitationDto.company.email,
      sector: acceptInvitationDto.company.sector,
      description: acceptInvitationDto.company.description,
      status: CompanyStatus.ACTIVE,
      isActive: true,
    });

    const savedCompany = await company.save();

    const hashedPassword = await bcrypt.hash(
      acceptInvitationDto.user.password,
      10,
    );

    const user = new this.userModel({
      name: acceptInvitationDto.user.name,
      email: acceptInvitationDto.user.email,
      password: hashedPassword,
      role: UserRole.COMPANY,
      companyId: savedCompany._id,
      isActive: true,
    });

    await user.save();

    invitation.isUsed = true;
    invitation.usedAt = new Date();
    invitation.usedBy = user._id;
    invitation.companyId = savedCompany._id;
    await invitation.save();

    return {
      message: 'Invitación aceptada exitosamente. Empresa y usuario creados.',
      company: {
        _id: savedCompany._id.toString(),
        name: savedCompany.name,
        nit: savedCompany.nit,
      },
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
