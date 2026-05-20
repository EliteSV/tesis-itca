export type CompanyStatus = 'activa' | 'inactiva';

export const CompanyStatusValues = {
  ACTIVE: 'activa' as const,
  INACTIVE: 'inactiva' as const,
};

export interface Company {
  _id: string;
  name: string;
  nit: string;
  address?: string;
  phone?: string;
  email?: string;
  sector?: string;
  description?: string;
  status: CompanyStatus;
  isActive: boolean;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInitialUserDto {
  name: string;
  email: string;
  password: string;
}

export interface CreateCompanyDto {
  name: string;
  nit: string;
  address?: string;
  phone?: string;
  email?: string;
  sector?: string;
  description?: string;
  status?: CompanyStatus;
  logo?: string;
  initialUser?: CreateInitialUserDto;
}

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {
  isActive?: boolean;
}

export interface CompaniesResponse {
  data: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateInvitationDto {
  expiresInDays?: number;
}

export interface SendInvitationEmailDto {
  email: string;
  expiresInDays?: number;
}

export interface InvitationResponse {
  _id: string;
  token: string;
  invitationLink: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
  email?: string;
  message?: string;
}

export interface ValidateInvitationResponse {
  isValid: boolean;
  message: string;
}

export interface AcceptInvitationCompanyDto {
  name: string;
  nit: string;
  address?: string;
  phone?: string;
  email?: string;
  sector?: string;
  description?: string;
}

export interface AcceptInvitationUserDto {
  name: string;
  email: string;
  password: string;
}

export interface AcceptInvitationDto {
  company: AcceptInvitationCompanyDto;
  user: AcceptInvitationUserDto;
}




