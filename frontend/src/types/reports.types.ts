export interface AdminReports {
  applicationsByMonth: Array<{
    month: string;
    count: number;
  }>;
  applicationsByStatus: Array<{
    status: string;
    count: number;
  }>;
  topOpportunities: Array<{
    id: string;
    title: string;
    applicationsCount: number;
  }>;
  topCompanies: Array<{
    id: string;
    name: string;
    opportunitiesCount: number;
    applicationsCount: number;
  }>;
  careersByApplications: Array<{
    id: string;
    name: string;
    applicationsCount: number;
    opportunitiesCount: number;
  }>;
  studentsByCareer: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  opportunitiesByStatus: Array<{
    status: string;
    count: number;
  }>;
  applicationRates: {
    total: number;
    accepted: number;
    rejected: number;
    pending: number;
    acceptanceRate: number;
    rejectionRate: number;
  };
  matchScoreStats: {
    average: number;
    min: number;
    max: number;
    count: number;
  } | null;
  activitiesByStatus: Array<{
    status: string;
    count: number;
    totalHours: number;
  }>;
  usersGrowth: Array<{
    month: string;
    role: string;
    count: number;
  }>;
}
