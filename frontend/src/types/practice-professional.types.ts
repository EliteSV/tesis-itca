export const ActivityStatus = {
  PENDING_APPROVAL: 'pendiente_aprobacion',
  APPROVED: 'aprobada',
  REJECTED: 'rechazada',
} as const;

export type ActivityStatus = (typeof ActivityStatus)[keyof typeof ActivityStatus];

export interface PracticeActivity {
  _id: string;
  applicationId: string;
  description: string;
  activityDate: string;
  hours: number;
  equipmentOrTool: string;
  status: ActivityStatus;
  rejectionReason?: string;
  evaluation?: {
    type: 'warning' | 'approval';
    message: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityDto {
  description: string;
  activityDate: string;
  hours: number;
  equipmentOrTool: string;
}

export interface PracticeProfessional {
  application: {
    _id: string;
    opportunityId: string;
    studentId: string;
    coverLetter?: string;
    status: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
  };
  opportunity: {
    _id: string;
    title: string;
    description?: string;
    activities?: string;
    careerId: string;
    companyId: string;
    responsibleUserId?: string;
    totalHours: number;
    availablePositions: number;
    modality?: string;
    workType?: string;
    expirationDate?: string;
    status: string;
    isActive: boolean;
    shareToken?: string;
    createdAt: string;
    updatedAt: string;
    career?: {
      _id: string;
      name: string;
      code: string;
    };
    company?: {
      _id: string;
      name: string;
      logo?: string;
    };
  };
  activities: PracticeActivity[];
  totalHours: number;
  approvedHours: number;
  status: PracticeStatus;
}

export interface ActivitiesResponse {
  data: PracticeActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const PracticeStatus = {
  EN_CURSO: 'en_curso',
  FINALIZADA: 'finalizada',
} as const;

export type PracticeStatus = (typeof PracticeStatus)[keyof typeof PracticeStatus];

export interface PracticeHistoryItem {
  applicationId: string;
  opportunityId: string;
  opportunityTitle: string;
  companyName: string;
  companyLogo?: string;
  startDate: string;
  endDate?: string;
  totalHours: number;
  approvedHours: number;
  requiredHours: number;
  status: PracticeStatus;
}

export interface PracticeHistoryResponse {
  data: PracticeHistoryItem[];
  total: number;
}
