import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { opportunitiesApi } from '@/lib/api';
import type {
  CreateOpportunityDto,
  UpdateOpportunityDto,
  UpdateApplicationStatusDto,
} from '@/types/opportunity.types';
import { ApplicationStatusValues } from '@/types/opportunity.types';
import type { StudentsResponse } from '@/types/student.types';

export function useOpportunities(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: [
      'opportunities',
      params?.page,
      params?.limit,
      params?.search,
      params?.status,
    ],
    queryFn: () => opportunitiesApi.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunities', id],
    queryFn: () => opportunitiesApi.getById(id),
    enabled: !!id,
  });
}

export function useOpportunityByShareToken(shareToken: string) {
  return useQuery({
    queryKey: ['opportunities', 'share', shareToken],
    queryFn: () => opportunitiesApi.getByShareToken(shareToken),
    enabled: !!shareToken,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpportunityDto) =>
      opportunitiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOpportunityDto }) =>
      opportunitiesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({
        queryKey: ['opportunities', variables.id],
      });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useToggleOpportunityActiveStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.toggleActiveStatus(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({
        queryKey: ['opportunities', variables],
      });
    },
  });
}

export function useOpportunityApplications(opportunityId: string) {
  return useQuery({
    queryKey: ['opportunities', opportunityId, 'applications'],
    queryFn: () => opportunitiesApi.getApplications(opportunityId),
    enabled: !!opportunityId,
    refetchInterval: (query) => {
      const data = query.state.data || [];
      const hasUnratedApplications = data.some(
        (app: { matchScore?: number }) =>
          app.matchScore === undefined || app.matchScore === null,
      );
      // Si hay aplicaciones sin calificar, refrescar cada 5 segundos
      return hasUnratedApplications ? 5000 : false;
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: UpdateApplicationStatusDto;
      opportunityId?: string;
    }) => opportunitiesApi.updateApplicationStatus(applicationId, data),
    onSuccess: (data, variables) => {
      // Get the opportunity ID from variables (always passed from frontend) or response
      const oppId = variables.opportunityId || data.opportunityId;
      
      // Always invalidate all opportunity queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      
      // Invalidate specific opportunity and its applications
      if (oppId) {
        // Invalidate applications for this opportunity
        queryClient.invalidateQueries({
          queryKey: ['opportunities', oppId, 'applications'],
        });
        // Invalidate the specific opportunity to refresh its status
        queryClient.invalidateQueries({
          queryKey: ['opportunities', oppId],
        });
      }
      
      // If an application was accepted, the opportunity status might have changed to "cerrada"
      // Force a complete refetch to ensure the status chip updates correctly
      if (variables.data.status === ApplicationStatusValues.ACCEPTED) {
        // Refetch all opportunities to update status chips in the list
        queryClient.refetchQueries({ queryKey: ['opportunities'] });
        // Refetch the specific opportunity to update its status chip in detail view
        if (oppId) {
          queryClient.refetchQueries({
            queryKey: ['opportunities', oppId],
          });
        }
      }
    },
  });
}

export function useEvaluateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) =>
      opportunitiesApi.evaluateApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({
        queryKey: ['opportunities', 'applications', 'company'],
      });
    },
  });
}

export function useAcceptApplicationByCoordinator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: string) =>
      opportunitiesApi.acceptApplicationByCoordinator(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({
        queryKey: ['opportunities', 'applications', 'coordinator'],
      });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useStudentsWithApplications(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery<StudentsResponse>({
    queryKey: [
      'opportunities',
      'students',
      'with-applications',
      params?.page,
      params?.limit,
      params?.search,
    ],
    queryFn: () => opportunitiesApi.getStudentsWithApplications(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAvailableOpportunities(params?: {
  page?: number;
  limit?: number;
  search?: string;
  careerId?: string;
}) {
  return useQuery({
    queryKey: [
      'opportunities',
      'available',
      params?.page,
      params?.limit,
      params?.search,
      params?.careerId,
    ],
    queryFn: () => opportunitiesApi.getAvailableForStudents(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAvailableOpportunitiesInfinite(params?: {
  limit?: number;
  search?: string;
  careerId?: string;
}) {
  return useInfiniteQuery({
    queryKey: [
      'opportunities',
      'available',
      'infinite',
      params?.limit,
      params?.search,
      params?.careerId,
    ],
    queryFn: ({ pageParam = 1 }) =>
      opportunitiesApi.getAvailableForStudents({
        ...params,
        page: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length === 0) return undefined;
      if (allPages.length >= lastPage.totalPages) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { opportunityId: string; coverLetter?: string }) =>
      opportunitiesApi.createApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSaveOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opportunityId: string) =>
      opportunitiesApi.saveOpportunity(opportunityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'saved', 'ids'] });
    },
  });
}

export function useUnsaveOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opportunityId: string) =>
      opportunitiesApi.unsaveOpportunity(opportunityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'saved', 'ids'] });
    },
  });
}

export function useSavedOpportunities(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [
      'opportunities',
      'saved',
      params?.page,
      params?.limit,
      params?.search,
    ],
    queryFn: () => opportunitiesApi.getSavedOpportunities(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useMyApplications(
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [
      'opportunities',
      'applications',
      'my-applications',
      params?.page,
      params?.limit,
      params?.search,
      params?.status,
    ],
    queryFn: () => opportunitiesApi.getMyApplications(params),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

export function useCompanyApplications(params?: {
  page?: number;
  limit?: number;
  opportunityId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [
      'opportunities',
      'applications',
      'company',
      params?.page,
      params?.limit,
      params?.opportunityId,
      params?.search,
    ],
    queryFn: () => opportunitiesApi.getCompanyApplications(params),
    staleTime: 2 * 60 * 1000,
    refetchInterval: (query) => {
      const data = query.state.data?.data || [];
      const hasUnratedApplications = data.some(
        (app: { matchScore?: number }) =>
          app.matchScore === undefined || app.matchScore === null,
      );
      // Si hay aplicaciones sin calificar, refrescar cada 5 segundos
      return hasUnratedApplications ? 5000 : false;
    },
  });
}

export function useCoordinatorApplications(params?: {
  page?: number;
  limit?: number;
  opportunityId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [
      'opportunities',
      'applications',
      'coordinator',
      params?.page,
      params?.limit,
      params?.opportunityId,
      params?.search,
    ],
    queryFn: () => opportunitiesApi.getCoordinatorApplications(params),
    staleTime: 2 * 60 * 1000,
  });
}

// Admin hooks
export function useOpportunitiesForAdmin(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: [
      'opportunities',
      'admin',
      'all',
      params?.page,
      params?.limit,
      params?.search,
      params?.status,
    ],
    queryFn: () => opportunitiesApi.getAllForAdmin(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useOpportunityForAdmin(id: string) {
  return useQuery({
    queryKey: ['opportunities', 'admin', id],
    queryFn: () => opportunitiesApi.getByIdForAdmin(id),
    enabled: !!id,
  });
}

export function useOpportunityApplicationsForAdmin(opportunityId: string) {
  return useQuery({
    queryKey: ['opportunities', 'admin', opportunityId, 'applications'],
    queryFn: () => opportunitiesApi.getApplicationsForAdmin(opportunityId),
    enabled: !!opportunityId,
  });
}
