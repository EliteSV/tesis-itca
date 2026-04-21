import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from 'lucide-react';
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
  useCreateCompanyUser,
  useUpdateCompanyUser,
} from '@/hooks/useCompanies';
import { useToast } from '@/hooks/useToast';
import type { User as UserType } from '@/types/auth.types';

const userSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z.string().email('Email inválido').min(1, 'El email es requerido'),
    password: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.password || data.password.length === 0) {
        return true;
      }
      return data.password.length >= 6;
    },
    {
      message: 'La contraseña debe tener al menos 6 caracteres',
      path: ['password'],
    },
  );

type UserFormData = z.infer<typeof userSchema>;

interface CompanyUserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  user?: (UserType & { _id?: string; isActive?: boolean }) | null;
  onSuccess?: () => void;
}

export function CompanyUserFormDialog({
  open,
  onOpenChange,
  companyId,
  user,
  onSuccess,
}: CompanyUserFormDialogProps) {
  const isEditing = !!user;
  const createMutation = useCreateCompanyUser();
  const updateMutation = useUpdateCompanyUser();
  const { success, error: showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          password: '',
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
        });
      }
    } else {
      reset({
        name: '',
        email: '',
        password: '',
      });
    }
  }, [open, user, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditing && user) {
        const userId = (user as { _id?: string })._id || user.id;
        const updateData: {
          name?: string;
          email?: string;
          password?: string;
        } = {
          name: data.name,
          email: data.email,
        };

        if (data.password && data.password.length > 0) {
          updateData.password = data.password;
        }

        await updateMutation.mutateAsync({
          companyId,
          userId,
          data: updateData,
        });

        success('Usuario actualizado', 'El usuario ha sido actualizado exitosamente');
      } else {
        if (!data.password || data.password.length < 6) {
          showError(
            'Error',
            'La contraseña es requerida y debe tener al menos 6 caracteres',
          );
          return;
        }

        await createMutation.mutateAsync({
          companyId,
          data: {
            name: data.name,
            email: data.email,
            password: data.password,
          },
        });

        success('Usuario creado', 'El usuario ha sido creado exitosamente');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al guardar el usuario';
      showError('Error', errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? 'Editar Usuario' : 'Agregar Usuario'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Actualiza la información del usuario asociado a la empresa'
              : 'Agrega un nuevo usuario asociado a la empresa'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nombre completo"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="usuario@empresa.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Contraseña {isEditing ? '(opcional)' : '*'}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder={isEditing ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
            {isEditing && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deja este campo vacío si no deseas cambiar la contraseña
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={
                createMutation.isPending || updateMutation.isPending
              }
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Guardando...'
                : isEditing
                  ? 'Actualizar'
                  : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

