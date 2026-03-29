import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/lib/api';
import type {
  User,
  UpdateUserProfileDto,
  ChangePasswordDto,
} from '@/types/auth.types';
import { useToast } from '@/hooks/useToast';

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => authApi.getProfile(),
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (data: UpdateUserProfileDto) => authApi.updateProfile(data),
    onSuccess: (data: User) => {
      queryClient.setQueryData(['user'], data);
      queryClient.setQueryData(['user-profile'], data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      success(
        'Perfil actualizado',
        'Tu información de perfil ha sido actualizada exitosamente.',
      );
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        'Error al actualizar el perfil. Por favor, intenta nuevamente.';
      showError('Error', message);
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: showError } = useToast();

  return useMutation({
    mutationFn: (data: ChangePasswordDto) => authApi.changePassword(data),
    onSuccess: () => {
      const isTemporaryPasswordChange = searchParams.get('changePassword') === 'true';
      
      if (isTemporaryPasswordChange) {
        const currentUser = queryClient.getQueryData<User>(['user']);
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            isTemporaryPassword: false,
          };
          queryClient.setQueryData(['user'], updatedUser);
          queryClient.setQueryData(['user-profile'], updatedUser);
        }
        setSearchParams({}, { replace: true });
        success(
          'Contraseña actualizada',
          'Tu contraseña ha sido cambiada exitosamente.',
        );
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } else {
        success(
          'Contraseña actualizada',
          'Tu contraseña ha sido cambiada exitosamente. Por favor, inicia sesión nuevamente.',
        );
        setTimeout(() => {
          queryClient.clear();
          window.location.href = '/login';
        }, 2000);
      }
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        'Error al cambiar la contraseña. Por favor, verifica que la contraseña actual sea correcta.';
      showError('Error', message);
    },
  });
}

