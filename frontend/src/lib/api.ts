import axios, { type InternalAxiosRequestConfig } from 'axios';
import { encryptedStorage } from '@/lib/storage.utils';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  User,
  UpdateUserProfileDto,
  ChangePasswordDto,
} from '@/types/auth.types';
import type {
  Company,
  CompaniesResponse,
  CreateCompanyDto,
  UpdateCompanyDto,
  CreateInvitationDto,
  SendInvitationEmailDto,
  InvitationResponse,
  ValidateInvitationResponse,
  AcceptInvitationDto,
} from '@/types/company.types';
import type {
  CareerCategory,
  CareerCategoriesResponse,
  CreateCareerCategoryDto,
  UpdateCareerCategoryDto,
} from '@/types/career-category.types';
import type {
  Career,
  CareersResponse,
  CreateCareerDto,
  UpdateCareerDto,
} from '@/types/career.types';
import type { DashboardStats } from '@/types/dashboard.types';
import type { AdminReports } from '@/types/reports.types';
import type {
  Opportunity,
  OpportunitiesResponse,
  CreateOpportunityDto,
  UpdateOpportunityDto,
  Application,
  ApplicationsResponse,
  UpdateApplicationStatusDto,
} from '@/types/opportunity.types';
import type {
  Student,
  StudentsResponse,
  CreateStudentDto,
  UpdateStudentDto,
  CreateStudentResponse,
} from '@/types/student.types';
import type {
  User as UserType,
  UsersResponse,
  CreateUserDto,
  UpdateUserDto,
  CreateUserResponse,
} from '@/types/user.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

let cachedToken: string | null = null;

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!cachedToken) {
      cachedToken = await encryptedStorage.getItem('token');
    }
    if (cachedToken && config.headers) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      cachedToken = null;
      await encryptedStorage.removeItem('token');
      await encryptedStorage.removeItem('user');
    }
    return Promise.reject(error);
  },
);

export const setAuthToken = async (token: string | null): Promise<void> => {
  cachedToken = token;
};

export const clearAuthToken = (): void => {
  cachedToken = null;
};

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    
    // Log temporal para debugging
    console.log('Login response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      hasAccessToken: !!response.data?.access_token,
      hasUser: !!response.data?.user,
    });
    
    return response.data;
  },
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response.data;
  },
  checkEmail: async (email: string): Promise<{ available: boolean }> => {
    const response = await api.get<{ available: boolean }>('/auth/check-email', {
      params: { email },
    });
    return response.data;
  },
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },
  updateProfile: async (data: UpdateUserProfileDto): Promise<User> => {
    const response = await api.patch<User>('/auth/profile', data);
    return response.data;
  },
  changePassword: async (data: ChangePasswordDto): Promise<User> => {
    const response = await api.patch<User>('/auth/change-password', data);
    return response.data;
  },
};

export const companiesApi = {
  getAll: async (
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    },
  ): Promise<CompaniesResponse> => {
    const response = await api.get<CompaniesResponse>('/companies', {
      params,
    });
    return response.data;
  },
  getById: async (id: string): Promise<Company> => {
    const response = await api.get<Company>(`/companies/${id}`);
    return response.data;
  },
  getUsersByCompany: async (id: string): Promise<User[]> => {
    const response = await api.get<User[]>(`/companies/${id}/users`);
    return response.data;
  },
  createCompanyUser: async (
    companyId: string,
    data: { name: string; email: string; password: string },
  ): Promise<User> => {
    const response = await api.post<User>(
      `/companies/${companyId}/users`,
      data,
    );
    return response.data;
  },
  updateCompanyUser: async (
    companyId: string,
    userId: string,
    data: { name?: string; email?: string; password?: string },
  ): Promise<User> => {
    const response = await api.patch<User>(
      `/companies/${companyId}/users/${userId}`,
      data,
    );
    return response.data;
  },
  deleteCompanyUser: async (
    companyId: string,
    userId: string,
  ): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/companies/${companyId}/users/${userId}`,
    );
    return response.data;
  },
  create: async (data: CreateCompanyDto): Promise<Company> => {
    const response = await api.post<Company>('/companies', data);
    return response.data;
  },
  update: async (id: string, data: UpdateCompanyDto): Promise<Company> => {
    const response = await api.patch<Company>(`/companies/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/companies/${id}`);
    return response.data;
  },
  toggleStatus: async (id: string): Promise<Company> => {
    const response = await api.patch<Company>(`/companies/${id}/toggle-status`);
    return response.data;
  },
  createInvitation: async (
    data?: CreateInvitationDto,
  ): Promise<InvitationResponse> => {
    const response = await api.post<InvitationResponse>(
      `/companies/invitations`,
      data || {},
    );
    return response.data;
  },
  sendInvitationEmail: async (
    data: SendInvitationEmailDto,
  ): Promise<InvitationResponse> => {
    const response = await api.post<InvitationResponse>(
      `/companies/invitations/send-email`,
      data,
    );
    return response.data;
  },
  getMyCompany: async (): Promise<Company> => {
    const response = await api.get<Company>('/companies/my-company');
    return response.data;
  },
  getMyCompanyUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/companies/my-company/users');
    return response.data;
  },
  createMyCompany: async (data: CreateCompanyDto): Promise<Company> => {
    const response = await api.post<Company>('/companies/my-company', data);
    return response.data;
  },
  updateMyCompany: async (data: UpdateCompanyDto): Promise<Company> => {
    const response = await api.patch<Company>('/companies/my-company', data);
    return response.data;
  },
};

export const invitationsApi = {
  validate: async (token: string): Promise<ValidateInvitationResponse> => {
    const response = await api.get<ValidateInvitationResponse>(
      `/invitations/validate/${token}`,
    );
    return response.data;
  },
  accept: async (
    token: string,
    data: AcceptInvitationDto,
  ): Promise<{ message: string; company: Company; user: User }> => {
    const response = await api.post(`/invitations/accept/${token}`, data);
    return response.data;
  },
};

export const careerCategoriesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<CareerCategoriesResponse> => {
    const response = await api.get<CareerCategoriesResponse>(
      '/career-categories',
      { params },
    );
    return response.data;
  },
  getById: async (id: string): Promise<CareerCategory> => {
    const response = await api.get<CareerCategory>(
      `/career-categories/${id}`,
    );
    return response.data;
  },
  create: async (
    data: CreateCareerCategoryDto,
  ): Promise<CareerCategory> => {
    const response = await api.post<CareerCategory>(
      '/career-categories',
      data,
    );
    return response.data;
  },
  update: async (
    id: string,
    data: UpdateCareerCategoryDto,
  ): Promise<CareerCategory> => {
    const response = await api.patch<CareerCategory>(
      `/career-categories/${id}`,
      data,
    );
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/career-categories/${id}`,
    );
    return response.data;
  },
  toggleStatus: async (id: string): Promise<CareerCategory> => {
    const response = await api.patch<CareerCategory>(
      `/career-categories/${id}/toggle-status`,
    );
    return response.data;
  },
};

export const careersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<CareersResponse> => {
    const response = await api.get<CareersResponse>('/careers', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Career> => {
    const response = await api.get<Career>(`/careers/${id}`);
    return response.data;
  },
  create: async (data: CreateCareerDto): Promise<Career> => {
    const response = await api.post<Career>('/careers', data);
    return response.data;
  },
  update: async (id: string, data: UpdateCareerDto): Promise<Career> => {
    const response = await api.patch<Career>(`/careers/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/careers/${id}`);
    return response.data;
  },
  toggleStatus: async (id: string): Promise<Career> => {
    const response = await api.patch<Career>(`/careers/${id}/toggle-status`);
    return response.data;
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard');
    return response.data;
  },
  getReports: async (): Promise<AdminReports> => {
    const response = await api.get<AdminReports>('/dashboard/reports');
    return response.data;
  },
};

export const opportunitiesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<OpportunitiesResponse> => {
    const response = await api.get<OpportunitiesResponse>('/opportunities', {
      params,
    });
    return response.data;
  },
  getById: async (id: string): Promise<Opportunity> => {
    const response = await api.get<Opportunity>(`/opportunities/${id}`);
    return response.data;
  },
  getByShareToken: async (shareToken: string): Promise<Opportunity> => {
    const response = await api.get<Opportunity>(
      `/opportunities/share/${shareToken}`,
    );
    return response.data;
  },
  create: async (data: CreateOpportunityDto): Promise<Opportunity> => {
    const response = await api.post<Opportunity>('/opportunities', data);
    return response.data;
  },
  update: async (
    id: string,
    data: UpdateOpportunityDto,
  ): Promise<Opportunity> => {
    const response = await api.patch<Opportunity>(`/opportunities/${id}`, data);
    return response.data;
  },
  updateForAdmin: async (
    id: string,
    data: UpdateOpportunityDto,
  ): Promise<Opportunity> => {
    const response = await api.patch<Opportunity>(`/opportunities/admin/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/opportunities/${id}`,
    );
    return response.data;
  },
  toggleActiveStatus: async (id: string): Promise<Opportunity> => {
    const response = await api.patch<Opportunity>(
      `/opportunities/${id}/toggle-active`,
    );
    return response.data;
  },
  toggleActiveStatusForAdmin: async (id: string): Promise<Opportunity> => {
    const response = await api.patch<Opportunity>(
      `/opportunities/admin/${id}/toggle-active`,
    );
    return response.data;
  },
  getApplications: async (opportunityId: string): Promise<Application[]> => {
    const response = await api.get<Application[]>(
      `/opportunities/${opportunityId}/applications`,
    );
    return response.data;
  },
  updateApplicationStatus: async (
    applicationId: string,
    data: UpdateApplicationStatusDto,
  ): Promise<Application> => {
    const response = await api.patch<Application>(
      `/opportunities/applications/${applicationId}/status`,
      data,
    );
    return response.data;
  },
  acceptApplicationByCoordinator: async (
    applicationId: string,
  ): Promise<Application> => {
    const response = await api.patch<Application>(
      `/opportunities/applications/${applicationId}/accept`,
    );
    return response.data;
  },
  evaluateApplication: async (applicationId: string): Promise<Application> => {
    const response = await api.post<Application>(
      `/opportunities/applications/${applicationId}/evaluate`,
    );
    return response.data;
  },
  getStudentsWithApplications: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<StudentsResponse> => {
    const response = await api.get<StudentsResponse>(
      '/opportunities/students/with-applications',
      { params },
    );
    return response.data;
  },
  getAvailableForStudents: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    careerId?: string;
  }): Promise<OpportunitiesResponse> => {
    const response = await api.get<OpportunitiesResponse>(
      '/opportunities/available',
      { params },
    );
    return response.data;
  },
  createApplication: async (data: {
    opportunityId: string;
    coverLetter?: string;
  }): Promise<Application> => {
    const response = await api.post<Application>(
      '/opportunities/applications',
      data,
    );
    return response.data;
  },
  saveOpportunity: async (opportunityId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `/opportunities/saved/${opportunityId}`,
    );
    return response.data;
  },
  unsaveOpportunity: async (opportunityId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      `/opportunities/saved/${opportunityId}`,
    );
    return response.data;
  },
  getSavedOpportunities: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<OpportunitiesResponse> => {
    const response = await api.get<OpportunitiesResponse>(
      '/opportunities/saved',
      { params },
    );
    return response.data;
  },
  getSavedOpportunityIds: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/opportunities/saved/ids');
    return response.data;
  },
  getMyApplications: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApplicationsResponse> => {
    const response = await api.get<ApplicationsResponse>(
      '/opportunities/applications/my-applications',
      { params },
    );
    return response.data;
  },
  getCompanyApplications: async (params?: {
    page?: number;
    limit?: number;
    opportunityId?: string;
    search?: string;
  }): Promise<ApplicationsResponse> => {
    const response = await api.get<ApplicationsResponse>(
      '/opportunities/applications/company',
      { params },
    );
    return response.data;
  },
  getCoordinatorApplications: async (params?: {
    page?: number;
    limit?: number;
    opportunityId?: string;
    search?: string;
  }): Promise<ApplicationsResponse> => {
    const response = await api.get<ApplicationsResponse>(
      '/opportunities/applications/coordinator',
      { params },
    );
    return response.data;
  },
  // Admin methods
  getAllForAdmin: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<OpportunitiesResponse> => {
    const response = await api.get<OpportunitiesResponse>(
      '/opportunities/admin/all',
      { params },
    );
    return response.data;
  },
  getByIdForAdmin: async (id: string): Promise<Opportunity> => {
    const response = await api.get<Opportunity>(`/opportunities/admin/${id}`);
    return response.data;
  },
  getApplicationsForAdmin: async (
    opportunityId: string,
  ): Promise<Application[]> => {
    const response = await api.get<Application[]>(
      `/opportunities/admin/${opportunityId}/applications`,
    );
    return response.data;
  },
};

export const studentsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    careerId?: string;
    status?: string;
    practiceStatus?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<StudentsResponse> => {
    const response = await api.get<StudentsResponse>('/students', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Student> => {
    const response = await api.get<Student>(`/students/${id}`);
    return response.data;
  },
  create: async (data: CreateStudentDto): Promise<CreateStudentResponse> => {
    const response = await api.post<CreateStudentResponse>('/students', data);
    return response.data;
  },
  update: async (id: string, data: UpdateStudentDto): Promise<Student> => {
    const response = await api.patch<Student>(`/students/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/students/${id}`);
    return response.data;
  },
  toggleStatus: async (id: string): Promise<Student> => {
    const response = await api.patch<Student>(`/students/${id}/toggle-status`);
    return response.data;
  },
  getMyProfile: async (): Promise<Student> => {
    const response = await api.get<Student>('/students/my-profile');
    return response.data;
  },
  generateTemporaryPassword: async (
    id: string,
  ): Promise<{ generatedPassword: string }> => {
    const response = await api.post<{ generatedPassword: string }>(
      `/students/${id}/generate-temporary-password`,
    );
    return response.data;
  },
  updateMyProfile: async (data: UpdateStudentDto): Promise<Student> => {
    const response = await api.patch<Student>('/students/my-profile', data);
    return response.data;
  },
  uploadSocialServiceDocument: async (
    formData: FormData,
  ): Promise<Student> => {
    const response = await api.post<Student>(
      '/students/my-profile/social-service-document',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },
  uploadPassedSubjectsDocument: async (
    formData: FormData,
  ): Promise<Student> => {
    const response = await api.post<Student>(
      '/students/my-profile/passed-subjects-document',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },
  deleteSocialServiceDocument: async (): Promise<Student> => {
    const response = await api.delete<Student>(
      '/students/my-profile/social-service-document',
    );
    return response.data;
  },
  deletePassedSubjectsDocument: async (): Promise<Student> => {
    const response = await api.delete<Student>(
      '/students/my-profile/passed-subjects-document',
    );
    return response.data;
  },
  uploadEnrollmentProofDocument: async (
    formData: FormData,
  ): Promise<Student> => {
    const response = await api.post<Student>(
      '/students/my-profile/enrollment-proof-document',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },
  deleteEnrollmentProofDocument: async (): Promise<Student> => {
    const response = await api.delete<Student>(
      '/students/my-profile/enrollment-proof-document',
    );
    return response.data;
  },
};

export const practiceProfessionalApi = {
  getPracticeProfessional: async (): Promise<
    import('@/types/practice-professional.types').PracticeProfessional
  > => {
    const response = await api.get<
      import('@/types/practice-professional.types').PracticeProfessional
    >('/practice-professional');
    return response.data;
  },
  getActivities: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<
    import('@/types/practice-professional.types').ActivitiesResponse
  > => {
    const response = await api.get<
      import('@/types/practice-professional.types').ActivitiesResponse
    >('/practice-professional/activities', { params });
    return response.data;
  },
  createActivity: async (
    data: import('@/types/practice-professional.types').CreateActivityDto,
  ): Promise<import('@/types/practice-professional.types').PracticeActivity> => {
    const response = await api.post<
      import('@/types/practice-professional.types').PracticeActivity
    >('/practice-professional/activities', data);
    return response.data;
  },
  // Company endpoints
  getStudentDetail: async (
    studentId: string,
  ): Promise<{
    student: import('@/types/student.types').Student;
    application: import('@/types/opportunity.types').Application;
    opportunity: import('@/types/opportunity.types').Opportunity;
    practiceProfessional: import('@/types/practice-professional.types').PracticeProfessional;
    approvedHours: number;
  }> => {
    const response = await api.get(
      `/practice-professional/company/students/${studentId}`,
    );
    return response.data;
  },
  getStudentActivities: async (
    studentId: string,
    params?: {
      page?: number;
      limit?: number;
    },
  ): Promise<
    import('@/types/practice-professional.types').ActivitiesResponse
  > => {
    const response = await api.get<
      import('@/types/practice-professional.types').ActivitiesResponse
    >(`/practice-professional/company/students/${studentId}/activities`, {
      params,
    });
    return response.data;
  },
  finishPracticeProfessional: async (
    studentId: string,
    data: {
      earlyTerminationReason?: string;
      evaluation: {
        qualityAndOrganization: number;
        knowledgeAndApplication: number;
        learningCapacity: number;
        attendanceAndPunctuality: number;
        initiativeAndJudgment: number;
      };
    },
  ): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(
      `/practice-professional/company/students/${studentId}/finish`,
      data,
    );
    return response.data;
  },
  updateActivityStatus: async (
    activityId: string,
    data: {
      status: import('@/types/practice-professional.types').ActivityStatus;
      rejectionReason?: string;
    },
  ): Promise<import('@/types/practice-professional.types').PracticeActivity> => {
    const response = await api.put<
      import('@/types/practice-professional.types').PracticeActivity
    >(`/practice-professional/company/activities/${activityId}/status`, data);
    return response.data;
  },
  // Admin endpoints
  getStudentPracticeProfessional: async (
    studentId: string,
  ): Promise<import('@/types/practice-professional.types').PracticeProfessional> => {
    const response = await api.get<
      import('@/types/practice-professional.types').PracticeProfessional
    >(`/practice-professional/admin/students/${studentId}`);
    return response.data;
  },
  // History endpoints
  getPracticeHistory: async (): Promise<
    import('@/types/practice-professional.types').PracticeHistoryResponse
  > => {
    const response = await api.get<
      import('@/types/practice-professional.types').PracticeHistoryResponse
    >('/practice-professional/history');
    return response.data;
  },
  getPracticeProfessionalById: async (
    practiceId: string,
  ): Promise<import('@/types/practice-professional.types').PracticeProfessional> => {
    const response = await api.get<
      import('@/types/practice-professional.types').PracticeProfessional
    >(`/practice-professional/history/${practiceId}`);
    return response.data;
  },
  getHolidays: async (year?: number): Promise<string[]> => {
    const response = await api.get<string[]>('/practice-professional/holidays', {
      params: year ? { year } : undefined,
    });
    return response.data;
  },
};

export const usersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<UsersResponse> => {
    const response = await api.get<UsersResponse>('/users', { params });
    return response.data;
  },
  getById: async (id: string): Promise<UserType> => {
    const response = await api.get<UserType>(`/users/${id}`);
    return response.data;
  },
  create: async (data: CreateUserDto): Promise<CreateUserResponse> => {
    const response = await api.post<CreateUserResponse>('/users', data);
    return response.data;
  },
  update: async (id: string, data: UpdateUserDto): Promise<UserType> => {
    const response = await api.patch<UserType>(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/users/${id}`);
    return response.data;
  },
  toggleStatus: async (id: string): Promise<UserType> => {
    const response = await api.patch<UserType>(`/users/${id}/toggle-status`);
    return response.data;
  },
  generateTemporaryPassword: async (
    id: string,
  ): Promise<{ generatedPassword: string }> => {
    const response = await api.post<{ generatedPassword: string }>(
      `/users/${id}/generate-temporary-password`,
    );
    return response.data;
  },
};

export default api;
