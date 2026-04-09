import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { practiceProfessionalApi } from '@/lib/api';
import type {
  PracticeProfessional,
  CreateActivityDto,
  ActivityStatus,
  PracticeHistoryResponse,
} from '@/types/practice-professional.types';
import { useToast } from './useToast';

export function usePracticeProfessional() {
  return useQuery({
    queryKey: ['practice-professional'],
    queryFn: () => practiceProfessionalApi.getPracticeProfessional(),
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error: unknown) => {
      // Don't retry if no practice professional found
      if ((error as { response?: { status?: number } })?.response?.status === 404) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

export function usePracticeActivities(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [
      'practice-professional',
      'activities',
      params?.page,
      params?.limit,
    ],
    queryFn: () => practiceProfessionalApi.getActivities(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateActivityDto) =>
      practiceProfessionalApi.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['practice-professional'],
      });
      queryClient.invalidateQueries({
        queryKey: ['practice-professional', 'activities'],
      });
      success(
        'Actividad creada',
        'La actividad ha sido registrada y está pendiente de aprobación.',
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'No se pudo crear la actividad. Intenta nuevamente.';
      showError('Error', errorMessage);
    },
  });
}

// Company hooks
export function useStudentDetailForCompany(studentId: string | null) {
  return useQuery({
    queryKey: ['practice-professional', 'company', 'student', studentId],
    queryFn: () => practiceProfessionalApi.getStudentDetail(studentId!),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useStudentActivitiesForCompany(
  studentId: string | null,
  params?: {
    page?: number;
    limit?: number;
  },
) {
  return useQuery({
    queryKey: [
      'practice-professional',
      'company',
      'student',
      studentId,
      'activities',
      params?.page,
      params?.limit,
    ],
    queryFn: () => practiceProfessionalApi.getStudentActivities(studentId!, params),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateActivityStatus() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({
      activityId,
      status,
      rejectionReason,
    }: {
      activityId: string;
      status: ActivityStatus;
      rejectionReason?: string;
    }) =>
      practiceProfessionalApi.updateActivityStatus(activityId, {
        status,
        rejectionReason,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['practice-professional', 'company', 'student'],
      });
      queryClient.invalidateQueries({
        queryKey: ['practice-professional', 'activities'],
      });
      success(
        'Estado actualizado',
        `La actividad ha sido ${variables.status === 'aprobada' ? 'aprobada' : 'rechazada'} correctamente.`,
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'No se pudo actualizar el estado de la actividad. Intenta nuevamente.';
      showError('Error', errorMessage);
    },
  });
}

export function useFinishPracticeProfessional() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: ({
      studentId,
      earlyTerminationReason,
      evaluation,
    }: {
      studentId: string;
      earlyTerminationReason?: string;
      evaluation: {
        qualityAndOrganization: number;
        knowledgeAndApplication: number;
        learningCapacity: number;
        attendanceAndPunctuality: number;
        initiativeAndJudgment: number;
      };
    }) =>
      practiceProfessionalApi.finishPracticeProfessional(studentId, {
        earlyTerminationReason,
        evaluation,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['practice-professional', 'company', 'student'],
      });
      success(
        'Práctica finalizada',
        'La práctica profesional ha sido finalizada exitosamente.',
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'No se pudo finalizar la práctica profesional. Intenta nuevamente.';
      showError('Error', errorMessage);
    },
  });
}

// Admin hooks
export function useStudentPracticeProfessionalForAdmin(
  studentId: string | null,
) {
  return useQuery<PracticeProfessional>({
    queryKey: ['practice-professional', 'admin', 'student', studentId],
    queryFn: () => practiceProfessionalApi.getStudentPracticeProfessional(studentId!),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error: unknown) => {
      // Don't retry if student doesn't have practice professional
      if ((error as { response?: { status?: number } })?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// History hooks
export function usePracticeHistory() {
  return useQuery<PracticeHistoryResponse>({
    queryKey: ['practice-professional', 'history'],
    queryFn: () => practiceProfessionalApi.getPracticeHistory(),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function usePracticeProfessionalByApplicationId(
  applicationId: string | null,
) {
  return useQuery<PracticeProfessional>({
    queryKey: ['practice-professional', 'history', applicationId],
    queryFn: () => practiceProfessionalApi.getPracticeProfessionalByApplicationId(applicationId!),
    enabled: !!applicationId,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error: unknown) => {
      if ((error as { response?: { status?: number } })?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
