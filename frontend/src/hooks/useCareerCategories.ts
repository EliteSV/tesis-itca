import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careerCategoriesApi } from '@/lib/api';
import type {
  CreateCareerCategoryDto,
  UpdateCareerCategoryDto,
} from '@/types/career-category.types';

export function useCareerCategories(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: [
      'career-categories',
      params?.page,
      params?.limit,
      params?.search,
      params?.isActive,
      params?.sortBy,
      params?.sortOrder,
      params?.dateFrom,
      params?.dateTo,
    ],
    queryFn: () => careerCategoriesApi.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCareerCategory(id: string) {
  return useQuery({
    queryKey: ['career-categories', id],
    queryFn: () => careerCategoriesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCareerCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCareerCategoryDto) =>
      careerCategoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-categories'] });
    },
  });
}

export function useUpdateCareerCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCareerCategoryDto;
    }) => careerCategoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-categories'] });
    },
  });
}

export function useDeleteCareerCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => careerCategoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-categories'] });
    },
  });
}

export function useToggleCareerCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => careerCategoriesApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-categories'] });
    },
  });
}

