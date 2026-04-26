import { useEffect, useState, useMemo, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Copy, Check } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  useCreateStudent,
  useUpdateStudent,
} from '@/hooks/useStudents';
import { useCareers } from '@/hooks/useCareers';
import { useToastContext } from '@/contexts/ToastContext';
import { authApi } from '@/lib/api';
import {
  normalizePhoneToE164,
  formatPhoneForDisplay,
} from '@/utils/phone.utils';
import type {
  Student,
  CreateStudentDto,
} from '@/types/student.types';

const studentSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('El email debe ser válido').min(1, 'El email es requerido'),
  identificationNumber: z
    .string()
    .min(1, 'El número de identificación es requerido')
    .regex(/^\d{6}$/, 'El carnet debe tener exactamente 6 dígitos (formato: 000000)'),
  phone: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone || phone.trim() === '') return true;
        const normalized = normalizePhoneToE164(phone);
        return normalized !== null;
      },
      {
        message: 'El teléfono debe tener 8 dígitos y comenzar con 2 (fijo), 6 o 7 (móvil)',
      },
    ),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  careerId: z.string().min(1, 'La carrera es requerida'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  onSuccess?: (generatedPassword?: string) => void;
}

export function StudentFormDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: StudentFormDialogProps) {
  const isEditing = !!student;
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const toast = useToastContext();
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

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
    trigger,
    setError,
    clearErrors,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const careerId = useWatch({
    control,
    name: 'careerId',
  });

  const gender = useWatch({
    control,
    name: 'gender',
  });

  const careerOptions = useMemo(
    () =>
      careers.map((career) => ({
        value: career._id,
        label: `${career.name} (${career.code})`,
      })),
    [careers],
  );

  const handleCareerChange = useCallback(
    (value: string) => {
      setValue('careerId', value);
    },
    [setValue],
  );

  const handleEmailBlur = useCallback(
    async (email: string) => {
      if (!email || email.trim() === '') {
        setEmailError(null);
        return;
      }

      // Validar formato primero
      const emailValidation = studentSchema.shape.email.safeParse(email.trim());
      if (!emailValidation.success) {
        setEmailError(null);
        return;
      }

      // Si estamos editando y el email no cambió, no verificar
      if (isEditing && email.trim() === student?.email) {
        setEmailError(null);
        return;
      }

      setIsCheckingEmail(true);
      setEmailError(null);
      try {
        const { available } = await authApi.checkEmail(email.trim());
        if (!available) {
          setEmailError('Este correo electrónico ya está registrado');
          setError('email', {
            type: 'manual',
            message: 'Este correo electrónico ya está registrado',
          });
        } else {
          setEmailError(null);
          clearErrors('email');
        }
      } catch (error) {
        console.error('Error checking email availability:', error);
        setEmailError(null);
      } finally {
        setIsCheckingEmail(false);
      }
    },
    [isEditing, student?.email, setError, clearErrors],
  );

  useEffect(() => {
    if (open) {
      if (student) {
        const phoneDisplay = student.phone ? formatPhoneForDisplay(student.phone) : '';
        reset({
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          identificationNumber: student.identificationNumber,
          phone: phoneDisplay,
          address: student.address || '',
          dateOfBirth: student.dateOfBirth
            ? student.dateOfBirth.split('T')[0]
            : '',
          gender: student.gender || '',
          careerId: typeof student.careerId === 'string' ? student.careerId : student.careerId._id,
        });
      } else {
        reset({
          firstName: '',
          lastName: '',
          email: '',
          identificationNumber: '',
          phone: '',
          address: '',
          dateOfBirth: '',
          gender: '',
          careerId: '',
        });
      }
    }
  }, [open, student, reset]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setGeneratedPassword(null);
        setCopied(false);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange],
  );

  const onSubmit = async (data: StudentFormData) => {
    try {
      const normalizedPhone = data.phone ? normalizePhoneToE164(data.phone) : undefined;
      const studentData: CreateStudentDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        identificationNumber: data.identificationNumber,
        phone: normalizedPhone || undefined,
        address: data.address || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender || undefined,
        careerId: data.careerId,
      };

      if (isEditing && student) {
        await updateMutation.mutateAsync({
          id: student._id,
          data: studentData,
        });
        toast.success(
          'Estudiante actualizado',
          `El estudiante "${data.firstName} ${data.lastName}" ha sido actualizado correctamente.`,
        );
        onOpenChange(false);
        onSuccess?.();
      } else {
        const response = await createMutation.mutateAsync(studentData);
        setGeneratedPassword(response.generatedPassword);
        toast.success(
          'Estudiante creado',
          `El estudiante "${data.firstName} ${data.lastName}" ha sido creado correctamente.`,
        );
        onSuccess?.(response.generatedPassword);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al guardar el estudiante';
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
            <GraduationCap className="h-5 w-5" />
            {isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la información del estudiante'
              : 'Completa los datos para registrar un nuevo estudiante'}
          </DialogDescription>
        </DialogHeader>

        {generatedPassword && !isEditing && (
          <div className="p-4 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-1">
                  Contraseña generada
                </p>
                <p className="text-xs text-primary-700 dark:text-primary-300 mb-2">
                  Copia esta contraseña para enviarla al estudiante por correo
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
                    className="flex-shrink-0"
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
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Juan"
                className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Apellido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Pérez"
                className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  onChange: () => {
                    if (emailError) {
                      setEmailError(null);
                      clearErrors('email');
                    }
                    trigger('email');
                  },
                  onBlur: async (e) => {
                    const emailValue = e.target.value.trim();
                    if (!emailValue) {
                      return;
                    }
                    
                    // Validar formato primero
                    const emailValidation = studentSchema.shape.email.safeParse(emailValue);
                    if (emailValidation.success) {
                      // Si el formato es válido, verificar disponibilidad
                      await handleEmailBlur(emailValue);
                    } else {
                      // Si el formato no es válido, trigger mostrará el error de formato
                      await trigger('email');
                    }
                  },
                })}
                placeholder="juan.perez@itca.edu.sv"
                className={`focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  errors.email || emailError ? 'border-destructive' : ''
                }`}
              />
              {(errors.email || emailError) && (
                <p className="text-sm text-destructive">
                  {emailError || errors.email?.message}
                </p>
              )}
              {isCheckingEmail && (
                <p className="text-xs text-slate-500">Verificando disponibilidad...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="identificationNumber">
                Número de Identificación <span className="text-destructive">*</span>
              </Label>
              <Input
                id="identificationNumber"
                {...register('identificationNumber')}
                placeholder="000000"
                maxLength={6}
                className={`focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  errors.identificationNumber ? 'border-destructive' : ''
                }`}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
                }}
              />
              {errors.identificationNumber && (
                <p className="text-sm text-destructive">
                  {errors.identificationNumber.message}
                </p>
              )}
            </div>
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
              <p className="text-sm text-destructive">{errors.careerId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register('phone', {
                  onChange: (e) => {
                    const formatted = formatPhoneForDisplay(e.target.value);
                    if (formatted !== e.target.value) {
                      e.target.value = formatted;
                      setValue('phone', formatted, { shouldValidate: false });
                    }
                  },
                  onBlur: (e) => {
                    const value = e.target.value.trim();
                    if (value) {
                      const normalized = normalizePhoneToE164(value);
                      if (normalized) {
                        setValue('phone', normalized, { shouldValidate: true });
                      } else {
                        setValue('phone', value, { shouldValidate: true });
                      }
                    }
                  },
                })}
                placeholder="2123-4567"
                className={`focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  errors.phone ? 'border-destructive' : ''
                }`}
                maxLength={9}
                onInput={(e) => {
                  let value = e.currentTarget.value.replace(/\D/g, '');
                  if (value.startsWith('503')) {
                    value = value.slice(3);
                  } else if (value.startsWith('+503')) {
                    value = value.slice(4);
                  }
                  
                  if (value.length > 0) {
                    const firstDigit = value[0];
                    if (!['2', '6', '7'].includes(firstDigit)) {
                      value = '';
                      e.currentTarget.value = '';
                      setValue('phone', '', { shouldValidate: true });
                      return;
                    }
                  }
                  
                  if (value.length > 8) {
                    value = value.slice(0, 8);
                  }
                  if (value.length > 4) {
                    value = value.slice(0, 4) + '-' + value.slice(4, 8);
                  }
                  e.currentTarget.value = value;
                }}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
                className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select
              value={gender || ''}
              onValueChange={(value) => setValue('gender', value)}
            >
              <SelectTrigger className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <SelectValue placeholder="Selecciona un género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="San Salvador, El Salvador"
              rows={2}
              className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 resize-none"
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setGeneratedPassword(null);
              }}
            >
              {generatedPassword ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!generatedPassword && (
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Guardando...'
                  : isEditing
                    ? 'Actualizar'
                    : 'Crear'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

