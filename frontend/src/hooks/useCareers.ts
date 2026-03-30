import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careersApi } from '@/lib/api';
import type { CreateCareerDto, UpdateCareerDto } from '@/types/career.types';

export function useCareers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: [
      'careers',
      params?.page,
      params?.limit,
      params?.search,
      params?.categoryId,
      params?.isActive,
      params?.sortBy,
      params?.sortOrder,
      params?.dateFrom,
      params?.dateTo,
    ],
    queryFn: () => careersApi.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCareer(id: string) {
  return useQuery({
    queryKey: ['careers', id],
    queryFn: () => careersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCareer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCareerDto) => careersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careers'] });
    },
  });
}

export function useUpdateCareer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCareerDto }) =>
      careersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careers'] });
    },
  });
}

export function useDeleteCareer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => careersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careers'] });
    },
  });
}

export function useToggleCareerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => careersApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careers'] });
    },
  });
}

