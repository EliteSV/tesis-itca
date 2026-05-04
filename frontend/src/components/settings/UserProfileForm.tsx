import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Loader2, XCircle, AlertCircle } from "lucide-react";
import { useUserProfile, useUpdateUserProfile } from "@/hooks/useUserProfile";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const userProfileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

export function UserProfileForm() {
  const { data: userProfile, isLoading } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<UserProfileFormData | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const {
    register,
    formState: { errors },
    reset,
    trigger,
    getValues,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    criteriaMode: "all",
    shouldFocusError: true,
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        name: userProfile.name,
        email: userProfile.email,
      });
    }
  }, [userProfile, reset]);

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
      updateProfileMutation.mutate({
        name: pendingData.name,
        email: pendingData.email,
      });
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

  return (
    <Card className="border-2 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Información Personal</CardTitle>
            <CardDescription className="mt-1">
              Actualiza tu información de perfil personal
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
          {hasAttemptedSubmit && (errors.name || errors.email) && (
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
                  {errors.name && (
                    <li>{errors.name.message}</li>
                  )}
                  {errors.email && (
                    <li>{errors.email.message}</li>
                  )}
                </ul>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name", {
                required: "El nombre es requerido",
              })}
              placeholder="Tu nombre completo"
              className={cn(
                errors.name &&
                  "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
              )}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p
                id="name-error"
                className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Correo Electrónico <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "El correo electrónico es requerido",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "El formato del correo electrónico no es válido",
                },
              })}
              placeholder="tu@email.com"
              className={cn(
                errors.email &&
                  "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
              )}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p
                id="email-error"
                className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex-1 sm:flex-initial"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
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
              ¿Estás seguro de que deseas guardar los cambios en tu perfil?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setPendingData(null);
              }}
              disabled={updateProfileMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSave}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
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
