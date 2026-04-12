export const StudentStatus = {
  PERFIL_INCOMPLETO: 'PERFIL INCOMPLETO',
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  GRADUADO: 'GRADUADO',
} as const;

export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];

export interface WorkExperience {
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
}

export interface Project {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
}

export interface ProfessionalProfile {
  summary?: string;
  languages?: Language[];
  certifications?: Certification[];
  projects?: Project[];
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  identificationNumber: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  careerId: string | {
    _id: string;
    name: string;
    code: string;
    description?: string;
    duration?: number;
  };
  career?: {
    _id: string;
    name: string;
    code: string;
    description?: string;
    duration?: number;
  };
  status: StudentStatus;
  userId: string;
  isActive: boolean;
  socialServiceDocument?: {
    filePath: string;
    fileName: string;
    isValidated: boolean;
    validatedAt?: string;
    validationErrors?: string[];
    validationWarnings?: string[];
    hasValidStamp?: boolean;
    hasValidFormat?: boolean;
  };
  passedSubjectsDocument?: {
    filePath: string;
    fileName: string;
    isValidated: boolean;
    validatedAt?: string;
    validationErrors?: string[];
    validationWarnings?: string[];
    hasValidStamp?: boolean;
    hasValidFormat?: boolean;
    passedCount?: number;
    totalSubjects?: number;
    validationAccuracyPercent?: number;
    passedSubjects?: Array<{
      cycle: string;
      code: string;
      name?: string;
      subject?: string;
    }>;
  };
  enrollmentProofDocument?: {
    filePath: string;
    fileName: string;
    isValidated: boolean;
    validatedAt?: string;
    validationErrors?: string[];
    validationWarnings?: string[];
    documentStudentName?: string;
    documentIdentificationNumber?: string;
    cycle?: string;
    enrolledSubjects?: Array<{
      name: string;
      code?: string;
      startDate?: string;
      endDate?: string;
    }>;
  };
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: string[];
  professionalProfile?: ProfessionalProfile;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  email: string;
  identificationNumber: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  careerId: string;
}

export interface UpdateStudentDto extends Partial<CreateStudentDto> {
  status?: StudentStatus;
  isActive?: boolean;
  workExperience?: WorkExperience[];
  education?: Education[];
  skills?: string[];
  professionalProfile?: ProfessionalProfile;
}

export interface StudentsResponse {
  data: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateStudentResponse extends Student {
  generatedPassword: string;
}

