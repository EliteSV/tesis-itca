import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '@/lib/api';
import type { CreateCompanyDto, UpdateCompanyDto } from '@/types/company.types';
import { useToast } from '@/hooks/useToast';

export function useMyCompany(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['my-company'],
    queryFn: () => companiesApi.getMyCompany(),
    enabled: options?.enabled !== false,
    retry: (failureCount, error: { response?: { status?: number } }) => {
      // No reintentar si es 404 (no tiene empresa)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useMyCompanyUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['my-company', 'users'],
    queryFn: () => companiesApi.getMyCompanyUsers(),
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCompanyUsers(companyId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['companies', companyId, 'users'],
    queryFn: () => companiesApi.getUsersByCompany(companyId!),
    enabled: !!companyId && options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateMyCompany() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateCompanyDto) => companiesApi.createMyCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-company'] });
      success(
        'Empresa creada',
        'Tu empresa ha sido creada exitosamente.',
      );
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message =
        error.response?.data?.message ||
        'Error al crear la empresa. Por favor, intenta nuevamente.';
      showError('Error', message);
    },
  });
}

export function useUpdateMyCompany() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (params: { data: UpdateCompanyDto }) =>
      companiesApi.updateMyCompany(params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-company'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
      success(
        'Empresa actualizada',
        'La información de tu empresa ha sido actualizada exitosamente.',
      );
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message =
        error.response?.data?.message ||
        'Error al actualizar la empresa. Por favor, intenta nuevamente.';
      showError('Error', message);
    },
  });
}

