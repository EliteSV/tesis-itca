import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '@/lib/api';
import type {
  CreateCompanyDto,
  UpdateCompanyDto,
  CreateInvitationDto,
  SendInvitationEmailDto,
} from '@/types/company.types';

export function useCompanies(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['companies', params?.page, params?.limit, params?.search, params?.status],
    queryFn: () => companiesApi.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => companiesApi.getById(id),
    enabled: !!id,
  });
}

export function useCompanyUsers(
  companyId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['companies', companyId, 'users'],
    queryFn: () => companiesApi.getUsersByCompany(companyId),
    enabled: options?.enabled !== false && !!companyId,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      logoFile,
    }: {
      data: CreateCompanyDto;
      logoFile?: File;
    }) => companiesApi.create(data, logoFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      logoFile,
    }: {
      id: string;
      data: UpdateCompanyDto;
      logoFile?: File;
    }) => companiesApi.update(id, data, logoFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useToggleCompanyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companiesApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useCreateCompanyInvitation() {
  return useMutation({
    mutationFn: (data?: CreateInvitationDto) =>
      companiesApi.createInvitation(data),
  });
}

export function useSendCompanyInvitationEmail() {
  return useMutation({
    mutationFn: (data: SendInvitationEmailDto) =>
      companiesApi.sendInvitationEmail(data),
  });
}

export function useCreateCompanyUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: string;
      data: { name: string; email: string; password: string };
    }) => companiesApi.createCompanyUser(companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['companies', variables.companyId, 'users'],
      });
    },
  });
}

export function useUpdateCompanyUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      userId,
      data,
    }: {
      companyId: string;
      userId: string;
      data: { name?: string; email?: string; password?: string };
    }) => companiesApi.updateCompanyUser(companyId, userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['companies', variables.companyId, 'users'],
      });
    },
  });
}

export function useDeleteCompanyUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      userId,
    }: {
      companyId: string;
      userId: string;
    }) => companiesApi.deleteCompanyUser(companyId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['companies', variables.companyId, 'users'],
      });
    },
  });
}


