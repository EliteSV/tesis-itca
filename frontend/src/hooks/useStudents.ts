import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '@/lib/api';
import type {
  CreateStudentDto,
  UpdateStudentDto,
} from '@/types/student.types';
import { useToast } from '@/hooks/useToast';

export function useStudents(params?: {
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
}) {
  return useQuery({
    queryKey: [
      'students',
      params?.page,
      params?.limit,
      params?.search,
      params?.careerId,
      params?.status,
      params?.practiceStatus,
      params?.isActive,
      params?.sortBy,
      params?.sortOrder,
      params?.dateFrom,
      params?.dateTo,
    ],
    queryFn: () => studentsApi.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => studentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentDto) => studentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStudentDto;
    }) => studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useToggleStudentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentsApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useGenerateTemporaryPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentsApi.generateTemporaryPassword(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useMyStudentProfile() {
  return useQuery({
    queryKey: ['students', 'my-profile'],
    queryFn: () => studentsApi.getMyProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyStudent(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['my-student'],
    queryFn: () => studentsApi.getMyProfile(),
    enabled: options?.enabled !== false,
    retry: (failureCount, error: { response?: { status?: number } }) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useUpdateMyStudent() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (data: UpdateStudentDto) => studentsApi.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-student'] });
      success(
        'Perfil actualizado',
        'Tu información de estudiante ha sido actualizada exitosamente.',
      );
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message =
        error.response?.data?.message ||
        'Error al actualizar tu información. Por favor, intenta nuevamente.';
      showError('Error', message);
    },
  });
}
