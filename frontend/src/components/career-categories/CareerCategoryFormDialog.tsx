import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderTree } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateCareerCategory,
  useUpdateCareerCategory,
} from '@/hooks/useCareerCategories';
import { useToastContext } from '@/contexts/ToastContext';
import type {
  CareerCategory,
  CreateCareerCategoryDto,
} from '@/types/career-category.types';

const careerCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  requiredProfessionalHours: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return isNaN(num) || num < 0 ? 0 : Math.floor(num);
    })
    .pipe(z.number().min(0, 'Las horas profesionales no pueden ser negativas')),
});

type CareerCategoryFormData = z.infer<typeof careerCategorySchema>;

interface CareerCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  careerCategory?: CareerCategory | null;
  onSuccess?: () => void;
}

export function CareerCategoryFormDialog({
  open,
  onOpenChange,
  careerCategory,
  onSuccess,
}: CareerCategoryFormDialogProps) {
  const isEditing = !!careerCategory;
  const createMutation = useCreateCareerCategory();
  const updateMutation = useUpdateCareerCategory();
  const toast = useToastContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<CareerCategoryFormData>({
    resolver: zodResolver(careerCategorySchema),
  });

  const nameValue = useWatch({ control, name: 'name' });
  const descriptionValue = useWatch({ control, name: 'description' });

  useEffect(() => {
    if (open) {
      if (careerCategory) {
        reset({
          name: careerCategory.name,
          description: careerCategory.description || '',
          requiredProfessionalHours: careerCategory.requiredProfessionalHours || 0,
        });
      } else {
        reset({
          name: '',
          description: '',
          requiredProfessionalHours: 0,
        });
      }
    }
  }, [open, careerCategory, reset]);

  const onSubmit = async (data: CareerCategoryFormData) => {
    try {
      const categoryData: CreateCareerCategoryDto = {
        name: data.name,
        description: data.description || undefined,
        requiredProfessionalHours:
          typeof data.requiredProfessionalHours === 'number' &&
          !isNaN(data.requiredProfessionalHours)
            ? data.requiredProfessionalHours
            : 0,
      };

      if (isEditing && careerCategory) {
        await updateMutation.mutateAsync({
          id: careerCategory._id,
          data: categoryData,
        });
        toast.success(
          'Categoría actualizada',
          `La categoría "${data.name}" ha sido actualizada correctamente.`,
        );
      } else {
        await createMutation.mutateAsync(categoryData);
        toast.success(
          'Categoría creada',
          `La categoría "${data.name}" ha sido creada correctamente.`,
        );
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al guardar la categoría';
      toast.error('Error al guardar', errorMessage);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la información de la categoría'
              : 'Completa los datos para registrar una nueva categoría'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              {nameValue && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {nameValue.length}/100
                </span>
              )}
            </div>
            <Input
              id="name"
              {...register('name', {
                maxLength: {
                  value: 100,
                  message: 'El nombre no puede exceder 100 caracteres',
                },
              })}
              placeholder="Ingeniería"
              maxLength={100}
              className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Nombre de la categoría"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Descripción</Label>
              {descriptionValue && typeof descriptionValue === 'string' ? (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {descriptionValue.length}/500
                </span>
              ) : null}
            </div>
            <Textarea
              id="description"
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: 'La descripción no puede exceder 500 caracteres',
                },
              })}
              placeholder="Carreras relacionadas con ingeniería y tecnología"
              rows={3}
              maxLength={500}
              className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 resize-none"
              aria-label="Descripción de la categoría"
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredProfessionalHours">
              Horas profesionales requeridas
            </Label>
            <Input
              id="requiredProfessionalHours"
              type="number"
              min="0"
              step="1"
              {...register('requiredProfessionalHours', {
                valueAsNumber: true,
                validate: (value) => {
                  if (isNaN(value)) return true;
                  return value >= 0 || 'Las horas profesionales no pueden ser negativas';
                },
              })}
              placeholder="160"
              className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Horas profesionales requeridas"
            />
            {errors.requiredProfessionalHours && (
              <p className="text-sm text-destructive">
                {errors.requiredProfessionalHours.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  );
}

