import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useChangePassword } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
      ),
    confirmPassword: z.string().min(1, 'Por favor confirma tu nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<ChangePasswordFormData | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const changePasswordMutation = useChangePassword();

  const {
    register,
    formState: { errors },
    control,
    reset,
    trigger,
    getValues,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    shouldFocusError: true,
  });

  const newPassword = useWatch({ control, name: 'newPassword' });
  const confirmPassword = useWatch({ control, name: 'confirmPassword' });

  const hasMinLength = newPassword ? newPassword.length >= 8 : false;
  const hasUpperCase = newPassword ? /[A-Z]/.test(newPassword) : false;
  const hasLowerCase = newPassword ? /[a-z]/.test(newPassword) : false;
  const hasNumber = newPassword ? /\d/.test(newPassword) : false;
  const passwordsMatch =
    confirmPassword && newPassword ? confirmPassword === newPassword : false;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar que se intentó submit
    setHasAttemptedSubmit(true);
    
    // Forzar validación de todos los campos
    let isValid = false;
    try {
      isValid = await trigger();
    } catch {
      // ZodError es esperado cuando hay errores de validación
      // Los errores se actualizan automáticamente en el estado del formulario
      isValid = false;
    }
    
    // Esperar a que React actualice el estado con los errores
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (!isValid) {
      // Enfocar el primer campo con error
      setTimeout(() => {
        const formElement = e.target as HTMLFormElement;
        const firstErrorField = formElement.querySelector('[aria-invalid="true"]') as HTMLElement;
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorField.focus();
        }
      }, 150);
      return;
    }

    const values = getValues();
    setPendingData(values);
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = () => {
    if (pendingData) {
      changePasswordMutation.mutate({
        currentPassword: pendingData.currentPassword,
        newPassword: pendingData.newPassword,
      });
      setShowConfirmDialog(false);
      setPendingData(null);
    }
  };

  const handleReset = () => {
    reset();
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <Card className="border-2 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Cambiar Contraseña</CardTitle>
            <CardDescription className="mt-1">
              Actualiza tu contraseña para mantener tu cuenta segura
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleFormSubmit}
          noValidate
          className="space-y-6"
        >
          {hasAttemptedSubmit && (errors.currentPassword || errors.newPassword || errors.confirmPassword) && (
            <div
              className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 animate-in fade-in slide-in-from-top-1"
              role="alert"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  Por favor, corrige los siguientes errores:
                </p>
                <ul className="mt-2 text-xs list-disc list-inside space-y-1">
                  {errors.currentPassword && (
                    <li>{errors.currentPassword.message}</li>
                  )}
                  {errors.newPassword && (
                    <li>{errors.newPassword.message}</li>
                  )}
                  {errors.confirmPassword && (
                    <li>{errors.confirmPassword.message}</li>
                  )}
                </ul>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Contraseña Actual
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                {...register('currentPassword')}
                placeholder="Ingresa tu contraseña actual"
                className={cn(
                  'pr-10',
                  errors.currentPassword &&
                    'border-destructive focus-visible:ring-destructive focus-visible:ring-2'
                )}
                aria-invalid={!!errors.currentPassword}
                aria-describedby={errors.currentPassword ? 'currentPassword-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                aria-label={
                  showCurrentPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p
                id="currentPassword-error"
                className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.currentPassword.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              Nueva Contraseña
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword')}
                placeholder="Ingresa tu nueva contraseña"
                className={cn(
                  'pr-10',
                  errors.newPassword &&
                    'border-destructive focus-visible:ring-destructive focus-visible:ring-2'
                )}
                aria-invalid={!!errors.newPassword}
                aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                aria-label={
                  showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p
                id="newPassword-error"
                className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.newPassword.message}</span>
              </p>
            )}

            {newPassword && (
              <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Requisitos de la contraseña:
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    {hasMinLength ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span
                      className={
                        hasMinLength
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      Mínimo 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {hasUpperCase ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span
                      className={
                        hasUpperCase
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      Al menos una letra mayúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {hasLowerCase ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span
                      className={
                        hasLowerCase
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      Al menos una letra minúscula
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {hasNumber ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    <span
                      className={
                        hasNumber
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      Al menos un número
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar Nueva Contraseña
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="Confirma tu nueva contraseña"
                className={cn(
                  'pr-10',
                  errors.confirmPassword &&
                    'border-destructive focus-visible:ring-destructive focus-visible:ring-2',
                  !errors.confirmPassword &&
                    passwordsMatch &&
                    confirmPassword &&
                    'border-green-500 focus-visible:ring-green-500'
                )}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                aria-label={
                  showConfirmPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.confirmPassword.message}</span>
              </p>
            )}
            {passwordsMatch && confirmPassword && !errors.confirmPassword && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Las contraseñas coinciden
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="flex-1 sm:flex-initial"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando contraseña...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Cambiar Contraseña
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={changePasswordMutation.isPending}
              className="flex-1 sm:flex-initial"
            >
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cambio de contraseña</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cambiar tu contraseña? Serás redirigido al inicio de sesión después de guardar los cambios.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setPendingData(null);
              }}
              disabled={changePasswordMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSave}
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

