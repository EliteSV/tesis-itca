import { useEffect, useMemo, useCallback } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase } from 'lucide-react';
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
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateOpportunity,
  useUpdateOpportunity,
} from '@/hooks/useOpportunities';
import { useCareers } from '@/hooks/useCareers';
import { useMyCompanyUsers } from '@/hooks/useMyCompany';
import { useToastContext } from '@/contexts/ToastContext';
import {
  OpportunityModalityValues,
  OpportunityWorkTypeValues,
} from '@/types/opportunity.types';
import type { User } from '@/types/auth.types';
import type {
  Opportunity,
  CreateOpportunityDto,
  UpdateOpportunityDto,
} from '@/types/opportunity.types';

const opportunitySchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .refine(
      (val) => {
        // Remove HTML tags and count text characters
        const textLength = val.replace(/<[^>]*>/g, '').trim().length;
        return textLength <= 1000;
      },
      {
        message: 'La descripción no puede exceder 1000 caracteres',
      },
    ),
  activities: z
    .string()
    .min(1, 'Las actividades son requeridas')
    .refine(
      (val) => {
        return val.length <= 2000;
      },
      {
        message: 'Las actividades no pueden exceder 2000 caracteres',
      },
    ),
  careerId: z.string().min(1, 'La carrera es requerida'),
  responsibleUserId: z.string().min(1, 'El responsable es requerido'),
  totalHours: z.number().min(1, 'El número de horas debe ser mayor a 0'),
  availablePositions: z
    .number()
    .min(1, 'El número de vacantes debe ser mayor a 0'),
  modality: z.enum(['presencial', 'remoto'], {
    message: 'La modalidad es requerida',
  }),
  workType: z.enum(['part-time', 'full-time'], {
    message: 'El tipo de trabajo es requerido',
  }),
  expirationDate: z.string().min(1, 'La fecha de expiración es requerida'),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface OpportunityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity?: Opportunity | null;
  onSuccess?: () => void;
}

export function OpportunityFormDialog({
  open,
  onOpenChange,
  opportunity,
  onSuccess,
}: OpportunityFormDialogProps) {
  const isEditing = !!opportunity;
  const createMutation = useCreateOpportunity();
  const updateMutation = useUpdateOpportunity();
  const toast = useToastContext();

  const careersQueryParams = useMemo(() => ({ limit: 100, isActive: true }), []);
  const { data: careersData } = useCareers(careersQueryParams);
  const { data: myCompanyUsers = [] } = useMyCompanyUsers();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    mode: 'onChange',
    defaultValues: {
      description: '',
    },
  });

  const titleValue = useWatch({ control, name: 'title' });
  const descriptionValue = useWatch({ control, name: 'description' });
  const activitiesValue = useWatch({ control, name: 'activities' });
  const careerId = useWatch({ control, name: 'careerId' });

  useEffect(() => {
    if (open) {
      if (opportunity) {
        const careerIdValue =
          typeof opportunity.careerId === 'string'
            ? opportunity.careerId
            : opportunity.career?._id || '';
        const responsibleUserIdValue =
          typeof opportunity.responsibleUserId === 'string'
            ? opportunity.responsibleUserId
            : opportunity.responsibleUser?._id || '';
        reset({
          title: opportunity.title,
          description: opportunity.description || '',
          activities: opportunity.activities || '',
          careerId: careerIdValue,
          responsibleUserId: responsibleUserIdValue,
          totalHours: opportunity.totalHours,
          availablePositions: opportunity.availablePositions,
          modality: opportunity.modality,
          workType: opportunity.workType,
          expirationDate: opportunity.expirationDate
            ? new Date(opportunity.expirationDate).toISOString().split('T')[0]
            : '',
        });
      } else {
        reset({
          title: '',
          description: '',
          activities: '',
          careerId: '',
          responsibleUserId: '',
          totalHours: undefined,
          availablePositions: 1,
          modality: undefined,
          workType: undefined,
          expirationDate: '',
        });
      }
    }
  }, [open, opportunity, reset]);

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const careers = useMemo(() => careersData?.data || [], [careersData?.data]);

  const careerOptions = useMemo(
    () =>
      careers.map((career) => ({
        value: career._id,
        label: career.name,
      })),
    [careers],
  );

  const responsibleUserOptions = useMemo(() => {
    return myCompanyUsers.map((user) => {
      const userId = (user as User & { _id?: string })._id || user.id || '';
      return {
        value: userId,
        label: user.name,
      };
    });
  }, [myCompanyUsers]);

  const handleCareerChange = useCallback(
    (value: string) => {
      setValue('careerId', value);
    },
    [setValue],
  );

  const handleResponsibleUserChange = useCallback(
    (value: string) => {
      setValue('responsibleUserId', value);
    },
    [setValue],
  );

  const onSubmit = useCallback(
    async (data: OpportunityFormData) => {
      try {
        if (isEditing && opportunity) {
          const updateData: UpdateOpportunityDto = {
            title: data.title,
            description: data.description,
            activities: data.activities,
            careerId: data.careerId,
            responsibleUserId: data.responsibleUserId,
            totalHours: data.totalHours,
            availablePositions: data.availablePositions,
            modality: data.modality,
            workType: data.workType,
            expirationDate: data.expirationDate,
          };
          await updateMutation.mutateAsync({
            id: opportunity._id,
            data: updateData,
          });
          toast.success(
            'Oportunidad actualizada',
            `La oportunidad "${data.title}" ha sido actualizada correctamente.`,
          );
        } else {
          const createData: CreateOpportunityDto = {
            title: data.title,
            description: data.description,
            activities: data.activities,
            careerId: data.careerId,
            responsibleUserId: data.responsibleUserId,
            totalHours: data.totalHours,
            availablePositions: data.availablePositions,
            modality: data.modality,
            workType: data.workType,
            expirationDate: data.expirationDate,
          };
          await createMutation.mutateAsync(createData);
          toast.success(
            'Oportunidad creada',
            `La oportunidad "${data.title}" ha sido creada correctamente.`,
          );
        }

        onOpenChange(false);
        onSuccess?.();
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Error al guardar la oportunidad';
        toast.error('Error al guardar', errorMessage);
      }
    },
    [
      isEditing,
      opportunity,
      createMutation,
      updateMutation,
      onOpenChange,
      onSuccess,
      toast,
    ],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {isEditing ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la información de la oportunidad'
              : 'Completa los datos para registrar una nueva oportunidad laboral'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              {titleValue && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {titleValue.length}/150
                </span>
              )}
            </div>
            <Input
              id="title"
              {...register('title', {
                maxLength: {
                  value: 150,
                  message: 'El título no puede exceder 150 caracteres',
                },
              })}
              placeholder="Desarrollador Full Stack"
              maxLength={150}
              className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Título de la oportunidad"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="careerId">
              Carrera <span className="text-destructive">*</span>
            </Label>
            <SearchableSelect
              options={careerOptions}
              value={careerId || ''}
              onValueChange={handleCareerChange}
              placeholder="Selecciona una carrera"
              searchPlaceholder="Buscar carrera..."
              emptyMessage="No se encontraron carreras"
            />
            {errors.careerId && (
              <p className="text-sm text-destructive">
                {errors.careerId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalHours">
                Horas Totales <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalHours"
                type="number"
                {...register('totalHours', { valueAsNumber: true })}
                placeholder="480"
                min={1}
              />
              {errors.totalHours && (
                <p className="text-sm text-destructive">
                  {errors.totalHours.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="availablePositions">
                Vacantes Disponibles <span className="text-destructive">*</span>
              </Label>
              <Input
                id="availablePositions"
                type="number"
                {...register('availablePositions', { valueAsNumber: true })}
                placeholder="1"
                min={1}
                defaultValue={1}
              />
              {errors.availablePositions && (
                <p className="text-sm text-destructive">
                  {errors.availablePositions.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">
                Descripción <span className="text-destructive">*</span>
              </Label>
              {descriptionValue && typeof descriptionValue === 'string' ? (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {descriptionValue.replace(/<[^>]*>/g, '').length}/1000
                </span>
              ) : null}
            </div>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Buscamos un desarrollador con experiencia en React y Node.js..."
                  maxLength={1000}
                  error={errors.description?.message}
                  disabled={isLoading}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="activities">
                Actividades a Realizar <span className="text-destructive">*</span>
              </Label>
              {activitiesValue && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activitiesValue.length}/2000
                </span>
              )}
            </div>
            <Textarea
              id="activities"
              {...register('activities', {
                maxLength: {
                  value: 2000,
                  message: 'Las actividades no pueden exceder 2000 caracteres',
                },
              })}
              placeholder="• Desarrollo de aplicaciones web
• Mantenimiento de sistemas
• Colaboración con el equipo"
              rows={6}
              maxLength={2000}
              className="resize-none"
            />
            {errors.activities && (
              <p className="text-sm text-destructive">
                {errors.activities.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modality">
                Modalidad <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="modality"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OpportunityModalityValues.PRESENCIAL}>
                        Presencial
                      </SelectItem>
                      <SelectItem value={OpportunityModalityValues.REMOTO}>
                        Remoto
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.modality && (
                <p className="text-sm text-destructive">
                  {errors.modality.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workType">
                Tipo de Trabajo <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="workType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OpportunityWorkTypeValues.PART_TIME}>
                        Tiempo Parcial
                      </SelectItem>
                      <SelectItem value={OpportunityWorkTypeValues.FULL_TIME}>
                        Tiempo Completo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.workType && (
                <p className="text-sm text-destructive">
                  {errors.workType.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsibleUserId">
                Responsable <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                options={responsibleUserOptions}
                value={useWatch({ control, name: 'responsibleUserId' }) || ''}
                onValueChange={handleResponsibleUserChange}
                placeholder="Selecciona un responsable"
                searchPlaceholder="Buscar responsable..."
                emptyMessage="No se encontraron usuarios"
              />
              {errors.responsibleUserId && (
                <p className="text-sm text-destructive">
                  {errors.responsibleUserId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">
                Fecha de Expiración <span className="text-destructive">*</span>
              </Label>
              <Input
                id="expirationDate"
                type="date"
                {...register('expirationDate')}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.expirationDate && (
                <p className="text-sm text-destructive">
                  {errors.expirationDate.message}
                </p>
              )}
            </div>
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

