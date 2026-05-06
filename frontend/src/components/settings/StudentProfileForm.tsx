import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Loader2, XCircle, AlertCircle } from "lucide-react";
import { useMyStudent, useUpdateMyStudent } from "@/hooks/useStudents";
import { useCareers } from "@/hooks/useCareers";
import { authApi } from "@/lib/api";
import {
  normalizePhoneToE164,
  formatPhoneForDisplay,
} from "@/utils/phone.utils";
import type { UpdateStudentDto } from "@/types/student.types";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const studentSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
  identificationNumber: z
    .string()
    .min(1, "El número de identificación es requerido")
    .regex(/^\d{6}$/, "El carnet debe tener exactamente 6 dígitos (formato: 000000)"),
  phone: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone || phone.trim() === "") return true;
        const normalized = normalizePhoneToE164(phone);
        return normalized !== null;
      },
      {
        message: "El teléfono debe tener 8 dígitos y comenzar con 2 (fijo), 6 o 7 (móvil)",
      },
    ),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  careerId: z.string().min(1, "La carrera es requerida"),
});

type StudentFormData = z.infer<typeof studentSchema>;

export function StudentProfileForm() {
  const { data: student, isLoading, error: studentError, isError } = useMyStudent();
  const studentErrorResponse = studentError as { response?: { status?: number } } | null;
  const updateStudentMutation = useUpdateMyStudent();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<StudentFormData | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const hasStudent = !!student;
  const isNotFound = isError && studentErrorResponse?.response?.status === 404;

  const careersQueryParams = useMemo(() => ({ limit: 1000, isActive: true }), []);
  const { data: careersData } = useCareers(careersQueryParams);
  const careers = useMemo(() => careersData?.data || [], [careersData?.data]);

  const {
    register,
    formState: { errors },
    reset,
    trigger,
    getValues,
    control,
    setValue,
    setError,
    clearErrors,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    criteriaMode: "all",
    shouldFocusError: true,
  });

  const careerId = useWatch({
    control,
    name: "careerId",
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
      setValue("careerId", value, { shouldValidate: true });
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

      // Si el email no cambió, no verificar
      if (email.trim() === student?.email) {
        setEmailError(null);
        return;
      }

      setIsCheckingEmail(true);
      setEmailError(null);
      try {
        const { available } = await authApi.checkEmail(email.trim());
        if (!available) {
          setEmailError("Este correo electrónico ya está registrado");
          setError("email", {
            type: "manual",
            message: "Este correo electrónico ya está registrado",
          });
        } else {
          setEmailError(null);
          clearErrors("email");
        }
      } catch (error) {
        console.error("Error checking email availability:", error);
        setEmailError(null);
      } finally {
        setIsCheckingEmail(false);
      }
    },
    [student?.email, setError, clearErrors],
  );

  const getCareerIdValue = useCallback((student: {
    career?: { _id: string | { toString(): string } };
    careerId?: string | { _id?: string | { toString(): string }; toString(): string } | null;
  } | null): string => {
    if (!student) return '';
    
    if (student.career?._id) {
      return String(student.career._id);
    }
    
    if (typeof student.careerId === 'object' && student.careerId !== null) {
      const careerIdObj = student.careerId as { _id?: string | { toString(): string }; toString(): string };
      return String(careerIdObj._id || student.careerId);
    }
    
    return String(student.careerId || '');
  }, []);

  useEffect(() => {
    if (student) {
      const careerIdValue = getCareerIdValue(student);
      
      const phoneDisplay = student.phone ? formatPhoneForDisplay(student.phone) : "";
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        identificationNumber: student.identificationNumber,
        phone: phoneDisplay,
        address: student.address || "",
        dateOfBirth: student.dateOfBirth
          ? student.dateOfBirth.split("T")[0]
          : "",
        gender: student.gender || "",
        careerId: careerIdValue,
      });
    } else if (isNotFound) {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        identificationNumber: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        careerId: "",
      });
    }
  }, [student, isNotFound, reset, getCareerIdValue]);

  useEffect(() => {
    if (student && careers.length > 0 && careerOptions.length > 0) {
      const careerIdValue = getCareerIdValue(student);
      
      if (careerIdValue) {
        const careerExists = careerOptions.some(opt => opt.value === careerIdValue);
        
        if (careerExists) {
          setValue("careerId", careerIdValue, { shouldValidate: false });
        }
      }
    }
  }, [student, careers, careerOptions, setValue, getCareerIdValue]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setHasAttemptedSubmit(true);

    let isValid = false;
    try {
      isValid = await trigger();
    } catch {
      isValid = false;
    }

    await new Promise((resolve) => setTimeout(resolve, 50));

    if (!isValid) {
      setTimeout(() => {
        const formElement = e.target as HTMLFormElement;
        const firstErrorField = formElement.querySelector(
          '[aria-invalid="true"]',
        ) as HTMLElement;
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
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
    if (pendingData && hasStudent) {
      const normalizedPhone = pendingData.phone
        ? normalizePhoneToE164(pendingData.phone)
        : undefined;
      const updateData: UpdateStudentDto = {
        firstName: pendingData.firstName,
        lastName: pendingData.lastName,
        email: pendingData.email,
        identificationNumber: pendingData.identificationNumber,
        phone: normalizedPhone || undefined,
        address: pendingData.address || undefined,
        dateOfBirth: pendingData.dateOfBirth || undefined,
        gender: pendingData.gender || undefined,
        careerId: pendingData.careerId,
      };
      updateStudentMutation.mutate(updateData);
      setShowConfirmDialog(false);
      setPendingData(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-slate-200 dark:border-slate-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const isPending = updateStudentMutation.isPending;

  if (isNotFound || !hasStudent) {
    return (
      <Card className="border-2 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Información del Estudiante</CardTitle>
          <CardDescription>
            No se encontró información de estudiante asociada a tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Por favor, contacta al administrador del sistema para resolver este problema.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Información del Estudiante</CardTitle>
            <CardDescription className="mt-1">
              Actualiza tu información personal y académica
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} noValidate className="space-y-6">
          {hasAttemptedSubmit &&
            (errors.firstName ||
              errors.lastName ||
              errors.email ||
              errors.identificationNumber ||
              errors.phone ||
              errors.address ||
              errors.dateOfBirth ||
              errors.gender ||
              errors.careerId) && (
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
                    {errors.firstName && <li>{errors.firstName.message}</li>}
                    {errors.lastName && <li>{errors.lastName.message}</li>}
                    {errors.email && <li>{errors.email.message}</li>}
                    {errors.identificationNumber && (
                      <li>{errors.identificationNumber.message}</li>
                    )}
                    {errors.phone && <li>{errors.phone.message}</li>}
                    {errors.address && <li>{errors.address.message}</li>}
                    {errors.dateOfBirth && <li>{errors.dateOfBirth.message}</li>}
                    {errors.gender && <li>{errors.gender.message}</li>}
                    {errors.careerId && <li>{errors.careerId.message}</li>}
                  </ul>
                </div>
              </div>
            )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Nombre"
                className={cn(
                  errors.firstName &&
                    "border-destructive focus-visible:ring-destructive focus-visible:ring-2",
                )}
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
              />
              {errors.firstName && (
                <p
                  id="firstName-error"
                  className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                  role="alert"
                >
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.firstName.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Apellido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Apellido"
                className={cn(
                  errors.lastName &&
                    "border-destructive focus-visible:ring-destructive focus-visible:ring-2",
                )}
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
              />
              {errors.lastName && (
                <p
                  id="lastName-error"
                  className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                  role="alert"
                >
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.lastName.message}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo Electrónico <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  onChange: () => {
                    if (emailError) {
                      setEmailError(null);
                      clearErrors("email");
                    }
                    trigger("email");
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
                      await trigger("email");
                    }
                  },
                })}
                placeholder="correo@ejemplo.com"
                className={cn(
                  (errors.email || emailError) &&
                    "border-destructive focus-visible:ring-destructive focus-visible:ring-2",
                )}
                aria-invalid={!!errors.email || !!emailError}
                aria-describedby={errors.email || emailError ? "email-error" : undefined}
              />
              {(errors.email || emailError) && (
                <p
                  id="email-error"
                  className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                  role="alert"
                >
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{emailError || errors.email?.message}</span>
                </p>
              )}
              {isCheckingEmail && (
                <p className="text-xs text-slate-500">Verificando disponibilidad...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="identificationNumber" className="text-sm font-medium">
                Número de Identificación <span className="text-destructive">*</span>
              </Label>
              <Input
                id="identificationNumber"
                {...register("identificationNumber")}
                placeholder="000000"
                maxLength={6}
                className={cn(
                  errors.identificationNumber &&
                    "border-destructive focus-visible:ring-destructive focus-visible:ring-2",
                )}
                aria-invalid={!!errors.identificationNumber}
                aria-describedby={
                  errors.identificationNumber ? "identificationNumber-error" : undefined
                }
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
                }}
              />
              {errors.identificationNumber && (
                <p
                  id="identificationNumber-error"
                  className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                  role="alert"
                >
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.identificationNumber.message}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Teléfono
              </Label>
              <Input
                id="phone"
                {...register("phone", {
                  onChange: (e) => {
                    const formatted = formatPhoneForDisplay(e.target.value);
                    if (formatted !== e.target.value) {
                      e.target.value = formatted;
                      setValue("phone", formatted, { shouldValidate: false });
                    }
                  },
                  onBlur: (e) => {
                    const value = e.target.value.trim();
                    if (value) {
                      const normalized = normalizePhoneToE164(value);
                      if (normalized) {
                        setValue("phone", normalized, { shouldValidate: true });
                      } else {
                        setValue("phone", value, { shouldValidate: true });
                      }
                    }
                  },
                })}
                placeholder="2123-4567"
                maxLength={9}
                className={cn(
                  errors.phone &&
                    "border-destructive focus-visible:ring-destructive focus-visible:ring-2",
                )}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                onInput={(e) => {
                  let value = e.currentTarget.value.replace(/\D/g, "");
                  if (value.startsWith("503")) {
                    value = value.slice(3);
                  } else if (value.startsWith("+503")) {
                    value = value.slice(4);
                  }
                  
                  if (value.length > 0) {
                    const firstDigit = value[0];
                    if (!["2", "6", "7"].includes(firstDigit)) {
                      value = "";
                      e.currentTarget.value = "";
                      setValue("phone", "", { shouldValidate: true });
                      return;
                    }
                  }
                  
                  if (value.length > 8) {
                    value = value.slice(0, 8);
                  }
                  if (value.length > 4) {
                    value = value.slice(0, 4) + "-" + value.slice(4, 8);
                  }
                  e.currentTarget.value = value;
                }}
              />
              {errors.phone && (
                <p
                  id="phone-error"
                  className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                  role="alert"
                >
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.phone.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                Fecha de Nacimiento
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                className={cn(
                  errors.dateOfBirth &&
                    "border-destructive focus-visible:ring-destructive focus-visible:ring-2",
                )}
                aria-invalid={!!errors.dateOfBirth}
                aria-describedby={errors.dateOfBirth ? "dateOfBirth-error" : undefined}
              />
              {errors.dateOfBirth && (
                <p
                  id="dateOfBirth-error"
                  className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                  role="alert"
                >
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.dateOfBirth.message}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Dirección
            </Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Dirección"
              className={cn(
                errors.address &&
                  "border-destructive focus-visible:ring-destructive focus-visible:ring-2",
              )}
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? "address-error" : undefined}
            />
            {errors.address && (
              <p
                id="address-error"
                className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.address.message}</span>
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium">
                Género
              </Label>
              <Input
                id="gender"
                {...register("gender")}
                placeholder="Género"
                className={cn(
                  errors.gender &&
                    "border-destructive focus-visible:ring-destructive focus-visible:ring-2",
                )}
                aria-invalid={!!errors.gender}
                aria-describedby={errors.gender ? "gender-error" : undefined}
              />
              {errors.gender && (
                <p
                  id="gender-error"
                  className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                  role="alert"
                >
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.gender.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="careerId" className="text-sm font-medium">
                Carrera <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                options={careerOptions}
                value={careerId || ""}
                onValueChange={handleCareerChange}
                placeholder="Selecciona una carrera"
                className={cn(
                  errors.careerId &&
                    "border-destructive focus-visible:ring-destructive focus-visible:ring-2",
                )}
              />
              {errors.careerId && (
                <p
                  id="careerId-error"
                  className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                  role="alert"
                >
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.careerId.message}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1 sm:flex-initial">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cambios</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas guardar los cambios en tu información de estudiante?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setPendingData(null);
              }}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
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

