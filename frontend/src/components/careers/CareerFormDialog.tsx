import { useEffect, useMemo, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap } from 'lucide-react';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  useCreateCareer,
  useUpdateCareer,
} from '@/hooks/useCareers';
import { useCareerCategories } from '@/hooks/useCareerCategories';
import { useToastContext } from '@/contexts/ToastContext';
import type { Career, CreateCareerDto } from '@/types/career.types';

const careerSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  description: z.string().optional(),
  duration: z.number().min(1, 'La duración debe ser mayor a 0').optional(),
});

type CareerFormData = z.infer<typeof careerSchema>;

interface CareerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  career?: Career | null;
  onSuccess?: () => void;
}

export function CareerFormDialog({
  open,
  onOpenChange,
  career,
  onSuccess,
}: CareerFormDialogProps) {
  const isEditing = !!career;
  const createMutation = useCreateCareer();
  const updateMutation = useUpdateCareer();
  const toast = useToastContext();

  const categoriesQueryParams = useMemo(() => ({ limit: 100 }), []);
  const { data: categoriesData } = useCareerCategories(categoriesQueryParams);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<CareerFormData>({
    resolver: zodResolver(careerSchema),
    mode: 'onChange',
  });

  const codeValue = useWatch({ control, name: 'code' });
  const nameValue = useWatch({ control, name: 'name' });
  const descriptionValue = useWatch({ control, name: 'description' });

  const categoryId = useWatch({
    control,
    name: 'categoryId',
  });

  useEffect(() => {
    if (open) {
      if (career) {
        const categoryIdValue =
          typeof career.categoryId === 'string'
            ? career.categoryId
            : career.categoryId._id;
        reset({
          code: career.code,
          name: career.name,
          categoryId: categoryIdValue,
          description: career.description || '',
          duration: career.duration,
        });
      } else {
        reset({
          code: '',
          name: '',
          categoryId: '',
          description: '',
          duration: undefined,
        });
      }
    }
  }, [open, career, reset]);


  const isLoading = createMutation.isPending || updateMutation.isPending;
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category._id,
        label: category.name,
      })),
    [categories],
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      setValue('categoryId', value);
    },
    [setValue],
  );

  const onSubmit = useCallback(
    async (data: CareerFormData) => {
      try {
        const careerData: CreateCareerDto = {
          code: data.code,
          name: data.name,
          categoryId: data.categoryId,
          description: data.description || undefined,
          duration: data.duration,
        };

        if (isEditing && career) {
          await updateMutation.mutateAsync({
            id: career._id,
            data: careerData,
          });
          toast.success(
            'Carrera actualizada',
            `La carrera "${data.name}" ha sido actualizada correctamente.`,
          );
        } else {
          await createMutation.mutateAsync(careerData);
          toast.success(
            'Carrera creada',
            `La carrera "${data.name}" ha sido creada correctamente.`,
          );
        }

        onOpenChange(false);
        onSuccess?.();
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Error al guardar la carrera';
        toast.error('Error al guardar', errorMessage);
      }
    },
    [isEditing, career, createMutation, updateMutation, onOpenChange, onSuccess, toast],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            {isEditing ? 'Editar Carrera' : 'Nueva Carrera'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la información de la carrera'
              : 'Completa los datos para registrar una nueva carrera'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="code">
                  Código <span className="text-destructive">*</span>
                </Label>
                {codeValue && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {codeValue.length}/20
                  </span>
                )}
              </div>
              <Input
                id="code"
                {...register('code', {
                  maxLength: {
                    value: 20,
                    message: 'El código no puede exceder 20 caracteres',
                  },
                })}
                placeholder="ING-SIS"
                maxLength={20}
                className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Código de la carrera"
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">
                Categoría <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                options={categoryOptions}
                value={categoryId || ''}
                onValueChange={handleCategoryChange}
                placeholder="Selecciona una categoría"
                searchPlaceholder="Buscar categoría..."
                emptyMessage="No se encontraron categorías"
              />
              {errors.categoryId && (
                <p className="text-sm text-destructive">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              {nameValue && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {nameValue.length}/150
                </span>
              )}
            </div>
            <Input
              id="name"
              {...register('name', {
                maxLength: {
                  value: 150,
                  message: 'El nombre no puede exceder 150 caracteres',
                },
              })}
              placeholder="Ingeniería en Sistemas Informáticos"
              maxLength={150}
              className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Nombre de la carrera"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duración (años)</Label>
              <Input
                id="duration"
                type="number"
                {...register('duration', { valueAsNumber: true })}
                placeholder="5"
                min={1}
              />
              {errors.duration && (
                <p className="text-sm text-destructive">
                  {errors.duration.message}
                </p>
              )}
            </div>
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
              placeholder="Carrera enfocada en el desarrollo de sistemas informáticos"
              rows={3}
              maxLength={500}
              className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 resize-none"
              aria-label="Descripción de la carrera"
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
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

