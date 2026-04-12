import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, setAuthToken } from '@/lib/api';
import { encryptedStorage } from '@/lib/storage.utils';
import type { LoginRequest, RegisterRequest, LoginResponse } from '@/types/auth.types';

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (data: LoginResponse) => {
      try {
        console.log('onSuccess llamado con:', data);
        
        // Validar que la respuesta tenga el formato esperado
        if (!data || !data.access_token || !data.user) {
          console.error('Respuesta de login inválida:', data);
          throw new Error('La respuesta del servidor no tiene el formato esperado');
        }

        console.log('Guardando token y usuario...');
        // Guardar token y usuario
        await Promise.all([
          encryptedStorage.setItem('token', data.access_token),
          encryptedStorage.setItem('user', JSON.stringify(data.user)),
        ]);
        
        console.log('Token y usuario guardados, configurando query cache...');
        await setAuthToken(data.access_token);
        queryClient.setQueryData(['user'], data.user);
        queryClient.setQueryData(['auth'], data);
        
        console.log('Navegando...');
        // Navegar según el estado del usuario
        if (data.user.isTemporaryPassword && data.user.role === 'estudiante') {
          navigate('/settings?changePassword=true', { replace: true });
        } else if (data.user.isProfileIncomplete && data.user.role === 'estudiante') {
          navigate('/settings', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
        console.log('Navegación completada');
      } catch (error) {
        console.error('Error al procesar respuesta de login:', error);
        // Re-lanzar el error para que React Query lo maneje
        throw error;
      }
    },
    onError: (error) => {
      console.error('Error en login mutation:', error);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: async (data: LoginResponse) => {
      await Promise.all([
        encryptedStorage.setItem('token', data.access_token),
        encryptedStorage.setItem('user', JSON.stringify(data.user)),
      ]);
      await setAuthToken(data.access_token);
      queryClient.setQueryData(['user'], data.user);
      queryClient.setQueryData(['auth'], data);
      
      if (data.user.isProfileIncomplete && data.user.role === 'estudiante') {
        navigate('/settings', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    },
  });
}





