import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLogin, useRegister } from '@/hooks/useAuthQuery';
import { useCareers } from '@/hooks/useCareers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { siteConfig } from '@/config/site.config';
import { AxiosError } from 'axios';
import type { RegisterRequest } from '@/types/auth.types';
import { authApi } from '@/lib/api';
import {
  normalizePhoneToE164,
  formatPhoneForDisplay,
} from '@/utils/phone.utils';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido').min(1, 'El email es requerido'),
  identificationNumber: z
    .string()
    .min(1, 'El número de identificación es requerido')
    .regex(/^\d{6}$/, 'El carnet debe tener exactamente 6 dígitos (formato: 000000)'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Debes confirmar tu contraseña'),
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
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const careersQueryParams = useMemo(() => ({ limit: 1000, isActive: true }), []);
  const { data: careersData } = useCareers(careersQueryParams);
  const careers = useMemo(() => careersData?.data || [], [careersData?.data]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const careerId = useWatch({
    control: registerForm.control,
    name: 'careerId',
  });

  const gender = useWatch({
    control: registerForm.control,
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
      registerForm.setValue('careerId', value);
    },
    [registerForm],
  );

  const handleEmailBlur = useCallback(
    async (email: string) => {
      if (!email || email.trim() === '') {
        setEmailError(null);
        return;
      }

      // Validar formato primero
      const emailValidation = registerSchema.shape.email.safeParse(email.trim());
      if (!emailValidation.success) {
        setEmailError(null);
        return;
      }

      setIsCheckingEmail(true);
      setEmailError(null);
      try {
        const { available } = await authApi.checkEmail(email.trim());
        if (!available) {
          setEmailError('Este correo electrónico ya está registrado');
          registerForm.setError('email', {
            type: 'manual',
            message: 'Este correo electrónico ya está registrado',
          });
        } else {
          setEmailError(null);
          registerForm.clearErrors('email');
        }
      } catch (error) {
        console.error('Error checking email availability:', error);
        setEmailError(null);
      } finally {
        setIsCheckingEmail(false);
      }
    },
    [registerForm],
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    const normalizedPhone = data.phone ? normalizePhoneToE164(data.phone) : undefined;
    const registerData: RegisterRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      identificationNumber: data.identificationNumber,
      password: data.password,
      phone: normalizedPhone || undefined,
      address: data.address || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      gender: data.gender || undefined,
      careerId: data.careerId,
    };
    registerMutation.mutate(registerData);
  };

  const loginError = loginMutation.error as AxiosError<{ message: string }> | null;
  const registerError = registerMutation.error as AxiosError<{ message: string }> | null;
  const error = isRegisterMode ? registerError : loginError;
  const errorMessage = error?.response?.data?.message || 
    (isRegisterMode ? 'Error al registrarse' : 'Error al iniciar sesión');

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex-1 flex flex-col justify-center relative overflow-hidden lg:overflow-visible">
        <div className="absolute inset-0 lg:hidden bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 lg:hidden bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 lg:hidden bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col justify-center py-8 px-4 sm:py-12 sm:px-6 lg:py-16 lg:px-12 xl:px-20">
          <div className="mx-auto w-full max-w-md">
            <div className="text-center lg:text-left mb-8 lg:mb-10">
              <div className="flex flex-col items-center lg:flex-row lg:items-center gap-3 mb-6 lg:mb-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl lg:hidden" />
                  <img
                    src="/assets/LogoITCA_Web.png"
                    alt="ITCA-FEPADE"
                    className="relative h-10 sm:h-12 lg:h-10 max-w-[180px] sm:max-w-[220px] lg:max-w-[200px] object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-2xl sm:text-3xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  {siteConfig.name}
                </span>
              </div>
            </div>

            <Card className="border-0 shadow-xl lg:shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm lg:bg-white dark:lg:bg-slate-900">
              <CardContent className="pt-8 sm:pt-10 px-6 sm:px-8 pb-8 sm:pb-10">
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {isRegisterMode ? 'Crear cuenta' : 'Bienvenido'}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    {isRegisterMode
                      ? 'Completa tus datos básicos para registrarte como estudiante'
                      : 'Ingresa tus credenciales para acceder al sistema'}
                  </p>
                </div>

                {isRegisterMode ? (
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5 sm:space-y-6">
                  {(registerError || registerMutation.isError) && (
                    <div className="rounded-lg bg-destructive/10 dark:bg-destructive/20 p-3 sm:p-4 flex items-start gap-3 border border-destructive/20 shadow-sm">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive font-medium break-words flex-1">
                        {registerError?.response?.data?.message || 
                         registerError?.message || 
                         'Error al registrarse. Por favor, verifica tus datos e intenta nuevamente.'}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Nombre <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Juan"
                        {...registerForm.register('firstName')}
                        className={`h-12 sm:h-11 text-base sm:text-sm ${
                          registerForm.formState.errors.firstName
                            ? 'border-destructive focus-visible:ring-destructive'
                            : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                        }`}
                        autoComplete="given-name"
                      />
                      {registerForm.formState.errors.firstName && (
                        <p className="text-xs sm:text-sm text-destructive font-medium mt-1">
                          {registerForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Apellido <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Pérez"
                        {...registerForm.register('lastName')}
                        className={`h-12 sm:h-11 text-base sm:text-sm ${
                          registerForm.formState.errors.lastName
                            ? 'border-destructive focus-visible:ring-destructive'
                            : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                        }`}
                        autoComplete="family-name"
                      />
                      {registerForm.formState.errors.lastName && (
                        <p className="text-xs sm:text-sm text-destructive font-medium mt-1">
                          {registerForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="register-email"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Correo electrónico <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="usuario@itca.edu.sv"
                      {...registerForm.register('email', {
                        onChange: () => {
                          if (emailError) {
                            setEmailError(null);
                            registerForm.clearErrors('email');
                          }
                          registerForm.trigger('email');
                        },
                        onBlur: async (e) => {
                          const emailValue = e.target.value.trim();
                          if (!emailValue) {
                            return;
                          }
                          
                          // Validar formato primero
                          const emailValidation = registerSchema.shape.email.safeParse(emailValue);
                          if (emailValidation.success) {
                            // Si el formato es válido, verificar disponibilidad
                            await handleEmailBlur(emailValue);
                          } else {
                            // Si el formato no es válido, trigger mostrará el error de formato
                            await registerForm.trigger('email');
                          }
                        },
                      })}
                      className={`h-12 sm:h-11 text-base sm:text-sm ${
                        registerForm.formState.errors.email || emailError
                          ? 'border-destructive focus-visible:ring-destructive'
                          : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                      }`}
                      autoComplete="email"
                    />
                    {(registerForm.formState.errors.email || emailError) && (
                      <p className="text-xs sm:text-sm text-destructive font-medium mt-1">
                        {emailError || registerForm.formState.errors.email?.message}
                      </p>
                    )}
                    {isCheckingEmail && (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Verificando disponibilidad...
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="identificationNumber"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Número de identificación <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="identificationNumber"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      {...registerForm.register('identificationNumber')}
                      className={`h-12 sm:h-11 text-base sm:text-sm ${
                        registerForm.formState.errors.identificationNumber
                          ? 'border-destructive focus-visible:ring-destructive'
                          : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                      }`}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
                      }}
                    />
                    {registerForm.formState.errors.identificationNumber && (
                      <p className="text-xs sm:text-sm text-destructive font-medium mt-1">
                        {registerForm.formState.errors.identificationNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="register-password"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Contraseña <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...registerForm.register('password')}
                        className={`h-12 sm:h-11 text-base sm:text-sm pr-12 ${
                          registerForm.formState.errors.password
                            ? 'border-destructive focus-visible:ring-destructive'
                            : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                        }`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label={showRegisterPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showRegisterPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-xs sm:text-sm text-destructive font-medium mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Confirmar contraseña <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...registerForm.register('confirmPassword')}
                        className={`h-12 sm:h-11 text-base sm:text-sm pr-12 ${
                          registerForm.formState.errors.confirmPassword
                            ? 'border-destructive focus-visible:ring-destructive'
                            : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                        }`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-xs sm:text-sm text-destructive font-medium mt-1">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="careerId"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Carrera <span className="text-destructive">*</span>
                    </Label>
                    <SearchableSelect
                      options={careerOptions}
                      value={careerId || ''}
                      onValueChange={handleCareerChange}
                      placeholder="Selecciona una carrera"
                      searchPlaceholder="Buscar carrera..."
                      emptyMessage="No se encontraron carreras"
                      className={
                        registerForm.formState.errors.careerId
                          ? 'border-destructive focus-visible:ring-destructive'
                          : ''
                      }
                    />
                    {registerForm.formState.errors.careerId && (
                      <p className="text-xs sm:text-sm text-destructive font-medium mt-1">
                        {registerForm.formState.errors.careerId.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Teléfono
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="2123-4567"
                        {...registerForm.register('phone', {
                          onChange: (e) => {
                            const formatted = formatPhoneForDisplay(e.target.value);
                            if (formatted !== e.target.value) {
                              e.target.value = formatted;
                              registerForm.setValue('phone', formatted, { shouldValidate: false });
                            }
                          },
                          onBlur: (e) => {
                            const value = e.target.value.trim();
                            if (value) {
                              const normalized = normalizePhoneToE164(value);
                              if (normalized) {
                                registerForm.setValue('phone', normalized, { shouldValidate: true });
                              } else {
                                registerForm.setValue('phone', value, { shouldValidate: true });
                              }
                            }
                          },
                        })}
                        className={`h-12 sm:h-11 text-base sm:text-sm ${
                          registerForm.formState.errors.phone
                            ? 'border-destructive focus-visible:ring-destructive'
                            : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                        }`}
                        autoComplete="tel"
                        maxLength={10}
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
                              registerForm.setValue('phone', '', { shouldValidate: true });
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
                      {registerForm.formState.errors.phone && (
                        <p className="text-xs sm:text-sm text-destructive font-medium mt-1">
                          {registerForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="dateOfBirth"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Fecha de nacimiento
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...registerForm.register('dateOfBirth')}
                        className="h-12 sm:h-11 text-base sm:text-sm border-slate-200 dark:border-slate-700 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Dirección
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="San Salvador, El Salvador"
                      {...registerForm.register('address')}
                      className="h-12 sm:h-11 text-base sm:text-sm border-slate-200 dark:border-slate-700 focus:border-primary"
                      autoComplete="street-address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="gender"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Género
                    </Label>
                    <Select
                      value={gender || ''}
                      onValueChange={(value) => {
                        registerForm.setValue('gender', value);
                      }}
                    >
                      <SelectTrigger
                        id="gender"
                        className="h-12 sm:h-11 text-base sm:text-sm border-slate-200 dark:border-slate-700 focus:border-primary"
                      >
                        <SelectValue placeholder="Selecciona un género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 sm:h-11 text-base sm:text-sm font-semibold mt-6 sm:mt-5 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? 'Registrando...' : 'Registrarse'}
                  </Button>
                </form>
                ) : (
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5 sm:space-y-6">
                    {error && (
                      <div className="rounded-lg bg-destructive/10 dark:bg-destructive/20 p-3 sm:p-4 flex items-start gap-3 border border-destructive/20 shadow-sm">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive font-medium break-words flex-1">
                          {errorMessage}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Correo electrónico
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="usuario@itca.edu.sv"
                        {...loginForm.register('email')}
                        className={`h-12 sm:h-11 text-base sm:text-sm ${
                          loginForm.formState.errors.email
                            ? 'border-destructive focus-visible:ring-destructive'
                            : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                        }`}
                        autoComplete="email"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-xs sm:text-sm text-destructive font-medium mt-1">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...loginForm.register('password')}
                          className={`h-12 sm:h-11 text-base sm:text-sm pr-12 ${
                            loginForm.formState.errors.password
                              ? 'border-destructive focus-visible:ring-destructive'
                              : 'border-slate-200 dark:border-slate-700 focus:border-primary'
                          }`}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-xs sm:text-sm text-destructive font-medium mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 sm:h-11 text-base sm:text-sm font-semibold mt-6 sm:mt-5 shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </Button>
                  </form>
                )}

                {!isRegisterMode && (
                  <div className="mt-4 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsRegisterMode(true);
                        loginForm.reset();
                        registerForm.reset();
                      }}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      ¿No tienes cuenta? Regístrate
                    </Button>
                  </div>
                )}

                {isRegisterMode && (
                  <div className="mt-4 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsRegisterMode(false);
                        loginForm.reset();
                        registerForm.reset();
                      }}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      ¿Ya tienes cuenta? Inicia sesión
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 xl:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/LogoITCA_Web.png')] opacity-5 bg-center bg-no-repeat bg-contain" />
        <div className="relative z-10 max-w-lg text-white">
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 p-4 border border-white/20">
              <img
                src="/assets/LogoITCA_Web.png"
                alt="ITCA-FEPADE"
                className="h-12 max-w-[280px] object-contain"
                loading="lazy"
              />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Sistema de Prácticas Profesionales
          </h2>
          <p className="text-lg text-white/90 leading-relaxed">
            Gestiona tus prácticas profesionales de manera eficiente. Accede a oportunidades,
            realiza seguimientos y completa tu proceso formativo con ITCA-FEPADE.
          </p>
        </div>
      </div>
    </div>
  );
}
