import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateUser,
  useUpdateUser,
} from '@/hooks/useUsers';
import { useCareers } from '@/hooks/useCareers';
import { useToastContext } from '@/contexts/ToastContext';
import { UserRole } from '@/types/auth.types';
import type { User as UserType, CreateUserDto } from '@/types/user.types';

const userSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('El email debe ser válido').min(1, 'El email es requerido'),
  role: z.nativeEnum(UserRole, { message: 'El rol es requerido' }),
  careerId: z.string().optional(),
}).refine((data) => {
  if (data.role === UserRole.COORDINADOR) {
    return !!data.careerId && data.careerId.length > 0;
  }
  return true;
}, {
  message: 'La carrera es requerida para coordinadores',
  path: ['careerId'],
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserType | null;
  onSuccess?: (generatedPassword?: string) => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: UserFormDialogProps) {
  const isEditing = !!user;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const toast = useToastContext();
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const careersQueryParams = useMemo(() => ({ limit: 1000, isActive: true }), []);
  const { data: careersData } = useCareers(careersQueryParams);
  const careers = useMemo(() => careersData?.data || [], [careersData?.data]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const role = useWatch({
    control,
    name: 'role',
  });

  const careerId = useWatch({
    control,
    name: 'careerId',
  });

  const careerOptions = useMemo(
    () =>
      careers.map((career) => ({
        value: career._id,
        label: `${career.name} (${career.code})`,
      })),
    [careers],
  );

  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          role: user.role,
          careerId: user.careerId || '',
        });
      } else {
        reset({
          name: '',
          email: '',
          role: UserRole.ADMIN,
          careerId: '',
        });
      }
    }
  }, [open, user, reset]);

  useEffect(() => {
    if (role !== UserRole.COORDINADOR) {
      setValue('careerId', '');
    }
  }, [role, setValue]);

  const handleClose = useCallback(() => {
    const password = generatedPassword;
    setGeneratedPassword(null);
    setCopied(false);
    onOpenChange(false);
    // Si había una contraseña generada, notificamos al padre que se cerró
    if (password) {
      onSuccess?.(password);
    }
  }, [onOpenChange, generatedPassword, onSuccess]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        handleClose();
      } else {
        onOpenChange(newOpen);
      }
    },
    [onOpenChange, handleClose],
  );

  const onSubmit = async (data: UserFormData) => {
    try {
      const userData: CreateUserDto = {
        name: data.name,
        email: data.email,
        role: data.role,
        careerId: data.role === UserRole.COORDINADOR ? data.careerId : undefined,
      };

      if (isEditing && user) {
        await updateMutation.mutateAsync({
          id: user._id,
          data: userData,
        });
        toast.success(
          'Usuario actualizado',
          `El usuario "${data.name}" ha sido actualizado correctamente.`,
        );
        onOpenChange(false);
        onSuccess?.();
      } else {
        const response = await createMutation.mutateAsync(userData);
        setGeneratedPassword(response.generatedPassword);
        toast.success(
          'Usuario creado',
          `El usuario "${data.name}" ha sido creado correctamente.`,
        );
        // No cerramos el modal aquí, dejamos que el usuario vea la contraseña
        // El modal se cerrará cuando el usuario haga clic en "Cerrar"
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al guardar el usuario';
      toast.error('Error al guardar', errorMessage);
    }
  };

  const handleCopyPassword = async () => {
    if (generatedPassword) {
      try {
        await navigator.clipboard.writeText(generatedPassword);
        setCopied(true);
        toast.success('Contraseña copiada', 'La contraseña ha sido copiada al portapapeles.');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Error al copiar', 'No se pudo copiar la contraseña.');
      }
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la información del usuario'
              : 'Completa los datos para registrar un nuevo usuario'}
          </DialogDescription>
        </DialogHeader>

        {generatedPassword && !isEditing ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-1">
                    Contraseña generada
                  </p>
                  <p className="text-xs text-primary-700 dark:text-primary-300 mb-2">
                    Copia esta contraseña para enviarla al usuario por correo
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-700 rounded text-sm font-mono text-slate-900 dark:text-slate-100">
                      {generatedPassword}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPassword}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={handleClose}
              >
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Juan Pérez"
              className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="juan.perez@itca.edu.sv"
              className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Rol <span className="text-destructive">*</span>
            </Label>
            <Select
              value={role || UserRole.ADMIN}
              onValueChange={(value) => setValue('role', value as UserRole)}
            >
              <SelectTrigger className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                <SelectItem value={UserRole.COORDINADOR}>Coordinador</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {role === UserRole.COORDINADOR && (
            <div className="space-y-2">
              <Label htmlFor="careerId">
                Carrera <span className="text-destructive">*</span>
              </Label>
              <Select
                value={careerId || ''}
                onValueChange={(value) => setValue('careerId', value)}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <SelectValue placeholder="Seleccionar carrera" />
                </SelectTrigger>
                <SelectContent>
                  {careerOptions.map((career) => (
                    <SelectItem key={career.value} value={career.value}>
                      {career.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.careerId && (
                <p className="text-sm text-destructive">{errors.careerId.message}</p>
              )}
            </div>
          )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Guardando...'
                  : isEditing
                    ? 'Actualizar'
                    : 'Crear'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

