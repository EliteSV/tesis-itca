import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useValidateInvitation, useAcceptInvitation } from '@/hooks/useInvitations';
import type { AcceptInvitationDto } from '@/types/company.types';

const acceptInvitationSchema = z
  .object({
    companyName: z.string().min(1, 'El nombre de la empresa es requerido'),
    companyNit: z.string().min(1, 'El NIT es requerido'),
    companyAddress: z.string().optional(),
    companyPhone: z.string().optional(),
    companyEmail: z.string().email('Email inválido').optional().or(z.literal('')),
    companySector: z.string().optional(),
    companyDescription: z.string().optional(),
    userName: z.string().min(1, 'El nombre del usuario es requerido'),
    userEmail: z.string().email('Email inválido').min(1, 'El email es requerido'),
    userPassword: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    userPasswordConfirm: z.string(),
  })
  .refine((data) => data.userPassword === data.userPasswordConfirm, {
    message: 'Las contraseñas no coinciden',
    path: ['userPasswordConfirm'],
  });

type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;

export function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: validationData,
    isLoading: isValidating,
  } = useValidateInvitation(token || '');

  const acceptMutation = useAcceptInvitation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(acceptInvitationSchema),
  });

  useEffect(() => {
    if (validationData && !validationData.isValid) {
      // Use setTimeout to avoid calling setState synchronously in effect
      setTimeout(() => {
        setError(validationData.message);
      }, 0);
    }
  }, [validationData]);

  const onSubmit = async (data: AcceptInvitationFormData) => {
    if (!token) return;

    try {
      const acceptData: AcceptInvitationDto = {
        company: {
          name: data.companyName,
          nit: data.companyNit,
          address: data.companyAddress || undefined,
          phone: data.companyPhone || undefined,
          email: data.companyEmail || undefined,
          sector: data.companySector || undefined,
          description: data.companyDescription || undefined,
        },
        user: {
          name: data.userName,
          email: data.userEmail,
          password: data.userPassword,
        },
      };

      await acceptMutation.mutateAsync({ token, data: acceptData });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        'No se pudo completar el registro. Por favor, intenta nuevamente.';
      setError(errorMessage);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Validando invitación...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || (validationData && !validationData.isValid)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Invitación Inválida
            </CardTitle>
            <CardDescription>
              No se pudo validar la invitación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error ||
                  validationData?.message ||
                  'La invitación no es válida o ha expirado'}
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Ir al Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ¡Registro Exitoso!
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Tu empresa y usuario han sido creados exitosamente. Serás
                  redirigido al login en unos segundos...
                </p>
              </div>
              <Button onClick={() => navigate('/login')} className="w-full">
                Ir al Login Ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Aceptar Invitación
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Completa la información de tu empresa y usuario para registrarte en el sistema
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información de la Empresa
              </CardTitle>
              <CardDescription>
                Completa los datos de tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Nombre de la Empresa <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    {...register('companyName')}
                    placeholder="Empresa Ejemplo S.A. de C.V."
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyNit">
                    NIT <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyNit"
                    {...register('companyNit')}
                    placeholder="0614-123456-101-5"
                  />
                  {errors.companyNit && (
                    <p className="text-sm text-destructive">
                      {errors.companyNit.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    {...register('companyEmail')}
                    placeholder="contacto@empresa.com"
                  />
                  {errors.companyEmail && (
                    <p className="text-sm text-destructive">
                      {errors.companyEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Teléfono</Label>
                  <Input
                    id="companyPhone"
                    {...register('companyPhone')}
                    placeholder="+503 2234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companySector">Sector</Label>
                  <Input
                    id="companySector"
                    {...register('companySector')}
                    placeholder="Tecnología"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Dirección</Label>
                  <Input
                    id="companyAddress"
                    {...register('companyAddress')}
                    placeholder="Av. Las Palmas, San Salvador"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyDescription">Descripción</Label>
                <Textarea
                  id="companyDescription"
                  {...register('companyDescription')}
                  placeholder="Empresa dedicada al desarrollo de software"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Usuario
              </CardTitle>
              <CardDescription>
                Crea tu cuenta de usuario para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">
                    Nombre Completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="userName"
                    {...register('userName')}
                    placeholder="Juan Pérez"
                  />
                  {errors.userName && (
                    <p className="text-sm text-destructive">
                      {errors.userName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userEmail">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="userEmail"
                    type="email"
                    {...register('userEmail')}
                    placeholder="juan.perez@empresa.com"
                  />
                  {errors.userEmail && (
                    <p className="text-sm text-destructive">
                      {errors.userEmail.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userPassword">
                    Contraseña <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="userPassword"
                    type="password"
                    {...register('userPassword')}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.userPassword && (
                    <p className="text-sm text-destructive">
                      {errors.userPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userPasswordConfirm">
                    Confirmar Contraseña <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="userPasswordConfirm"
                    type="password"
                    {...register('userPasswordConfirm')}
                    placeholder="Repite la contraseña"
                  />
                  {errors.userPasswordConfirm && (
                    <p className="text-sm text-destructive">
                      {errors.userPasswordConfirm.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/login')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={acceptMutation.isPending}
              className="min-w-[120px]"
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Completar Registro'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

