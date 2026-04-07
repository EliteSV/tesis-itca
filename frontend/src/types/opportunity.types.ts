export type OpportunityStatus = 'activa' | 'cerrada' | 'borrador';

export const OpportunityStatusValues = {
  ACTIVE: 'activa' as const,
  CLOSED: 'cerrada' as const,
  DRAFT: 'borrador' as const,
};

export type OpportunityModality = 'presencial' | 'remoto';

export const OpportunityModalityValues = {
  PRESENCIAL: 'presencial' as const,
  REMOTO: 'remoto' as const,
};

export type OpportunityWorkType = 'part-time' | 'full-time';

export const OpportunityWorkTypeValues = {
  PART_TIME: 'part-time' as const,
  FULL_TIME: 'full-time' as const,
};

export interface Career {
  _id: string;
  name: string;
  code: string;
}

export interface Company {
  _id: string;
  name: string;
  logo?: string;
  nit?: string;
  address?: string;
  phone?: string;
  email?: string;
  sector?: string;
  description?: string;
}

export interface ResponsibleUser {
  _id: string;
  name: string;
  email: string;
}

export interface Opportunity {
  _id: string;
  title: string;
  description?: string;
  applicationsCount?: number;
  activities?: string;
  careerId: string;
  career?: Career;
  companyId: string;
  company?: Company;
  responsibleUserId?: string;
  responsibleUser?: ResponsibleUser;
  totalHours: number;
  availablePositions: number;
  modality?: OpportunityModality;
  workType?: OpportunityWorkType;
  expirationDate?: string;
  status: OpportunityStatus;
  isActive: boolean;
  shareToken?: string;
  shareLink?: string;
  isSaved?: boolean;
  hasApplied?: boolean;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpportunityDto {
  title: string;
  description: string;
  activities: string;
  careerId: string;
  responsibleUserId: string;
  totalHours: number;
  availablePositions: number;
  modality: OpportunityModality;
  workType: OpportunityWorkType;
  expirationDate: string;
  status?: OpportunityStatus;
}

export interface UpdateOpportunityDto extends Partial<CreateOpportunityDto> {
  isActive?: boolean;
}

export interface OpportunitiesResponse {
  data: Opportunity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ApplicationStatus = 'pendiente' | 'aprobada' | 'aceptada' | 'rechazada';

export const ApplicationStatusValues = {
  PENDING: 'pendiente' as const,
  APPROVED: 'aprobada' as const,
  ACCEPTED: 'aceptada' as const,
  REJECTED: 'rechazada' as const,
};

export interface Student {
  _id: string;
  name: string;
  email: string;
}

export interface Application {
  _id: string;
  opportunityId: string;
  studentId: string;
  student?: Student;
  coverLetter?: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  matchScore?: number;
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationStatus;
  rejectionReason?: string;
}

export interface CreateApplicationDto {
  opportunityId: string;
  coverLetter?: string;
}

export interface ApplicationWithOpportunity extends Application {
  opportunity?: Opportunity;
}

export interface ApplicationsResponse {
  data: ApplicationWithOpportunity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

