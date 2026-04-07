export interface AdminDashboardStats {
  users: {
    total: number;
    students: number;
    companies: number;
    admins: number;
  };
  companies: {
    total: number;
    active: number;
    inactive: number;
  };
  requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    inProgress: number;
  };
  careers: {
    total: number;
    active: number;
    inactive: number;
  };
  careerCategories: {
    total: number;
    active: number;
    inactive: number;
  };
}

export interface CompanyDashboardStats {
  opportunities: {
    total: number;
    active: number;
    closed: number;
    draft: number;
    inactive: number;
  };
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  positions: {
    total: number;
    occupied: number;
    available: number;
  };
}

export interface StudentDashboardStats {
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  opportunities: {
    available: number;
  };
  practiceProfessional?: {
    totalHours: number;
    approvedHours: number;
    remainingHours: number;
    requiredHours: number;
    isFinalized: boolean;
  } | null;
}

export type DashboardStats =
  | AdminDashboardStats
  | CompanyDashboardStats
  | StudentDashboardStats;

