import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Loader2, XCircle, AlertCircle, Upload, X } from "lucide-react";
import { useMyCompany, useCreateMyCompany, useUpdateMyCompany } from "@/hooks/useMyCompany";
import type { CreateCompanyDto, UpdateCompanyDto } from "@/types/company.types";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoCompanyMessage } from "@/components/companies/NoCompanyMessage";

const companySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  nit: z.string().min(1, "El NIT es requerido"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  sector: z.string().optional(),
  description: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export function CompanyProfileForm() {
  const { data: company, isLoading, error: companyError, isError } = useMyCompany();
  const companyErrorResponse = companyError as { response?: { status?: number } } | null;
  const createCompanyMutation = useCreateMyCompany();
  const updateCompanyMutation = useUpdateMyCompany();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<CompanyFormData | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const hasCompany = !!company;
  const isNotFound = isError && companyErrorResponse?.response?.status === 404;

  const {
    register,
    formState: { errors },
    reset,
    trigger,
    getValues,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    criteriaMode: "all",
    shouldFocusError: true,
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        nit: company.nit,
        address: company.address || "",
        phone: company.phone || "",
        email: company.email || "",
        sector: company.sector || "",
        description: company.description || "",
      });
      
      // Cargar preview del logo si existe
      setLogoPreview(company.logo || null);
    } else if (isNotFound) {
      // Resetear formulario a valores vacíos si no hay empresa
      reset({
        name: "",
        nit: "",
        address: "",
        phone: "",
        email: "",
        sector: "",
        description: "",
      });
      setLogoPreview(null);
    }
  }, [company, isNotFound, reset]);
  
  const handleLogoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
          alert('Solo se permiten archivos PNG o JPG');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('El archivo no debe exceder 5MB');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const handleRemoveLogo = useCallback(() => {
    setLogoPreview(company?.logo || null);
  }, [company]);

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
      if (hasCompany) {
        // Actualizar empresa existente
        const updateData: UpdateCompanyDto = {
          name: pendingData.name,
          nit: pendingData.nit,
          address: pendingData.address || undefined,
          phone: pendingData.phone || undefined,
          email: pendingData.email || undefined,
          sector: pendingData.sector || undefined,
          description: pendingData.description || undefined,
          logo: logoPreview || undefined,
        };
        updateCompanyMutation.mutate({ data: updateData });
      } else {
        // Crear nueva empresa
        const createData: CreateCompanyDto = {
          name: pendingData.name,
          nit: pendingData.nit,
          address: pendingData.address || undefined,
          phone: pendingData.phone || undefined,
          email: pendingData.email || undefined,
          sector: pendingData.sector || undefined,
          description: pendingData.description || undefined,
          logo: logoPreview || undefined,
        };
        createCompanyMutation.mutate(createData);
      }
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

  const isCreating = !hasCompany;
  const isPending = createCompanyMutation.isPending || updateCompanyMutation.isPending;

  // Mostrar mensaje informativo si no hay empresa
  if (isNotFound || !hasCompany) {
    return (
      <div className="space-y-6">
        <NoCompanyMessage
          title="No tienes una empresa asociada"
          description="Necesitas crear tu empresa para continuar"
          message="Actualmente no tienes una empresa asociada a tu cuenta. Para poder gestionar oportunidades y estudiantes, primero debes crear y configurar tu empresa. Completa el formulario a continuación para crear tu empresa."
        />
        
        <Card className="border-2 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Crear Empresa</CardTitle>
                <CardDescription className="mt-1">
                  Completa la información de tu empresa para comenzar
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
              {/* Logo Upload Section */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Logo de la Empresa</Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-24 w-24 object-contain border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                      />
                      {logoPreview !== (company?.logo || null) && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                          aria-label="Eliminar logo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="h-24 w-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                      <Building2 className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label
                      htmlFor="logo-upload-create"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      {logoPreview ? "Cambiar Logo" : "Subir Logo"}
                    </Label>
                    <input
                      id="logo-upload-create"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      PNG o JPG, máximo 5MB
                    </p>
                  </div>
                </div>
              </div>

              {hasAttemptedSubmit && (errors.name || errors.nit || errors.email || errors.address || errors.phone || errors.sector || errors.description) && (
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
                      {errors.name && <li>{errors.name.message}</li>}
                      {errors.nit && <li>{errors.nit.message}</li>}
                      {errors.email && <li>{errors.email.message}</li>}
                      {errors.address && <li>{errors.address.message}</li>}
                      {errors.phone && <li>{errors.phone.message}</li>}
                      {errors.sector && <li>{errors.sector.message}</li>}
                      {errors.description && <li>{errors.description.message}</li>}
                    </ul>
                  </div>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name" className="text-sm font-medium">
                    Nombre de la Empresa <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="company-name"
                    {...register("name", {
                      required: "El nombre de la empresa es requerido",
                    })}
                    placeholder="Nombre de la empresa"
                    className={cn(
                      errors.name &&
                        "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
                    )}
                    aria-invalid={!!errors.name}
                    aria-describedby={
                      errors.name ? "company-name-error" : undefined
                    }
                  />
                  {errors.name && (
                    <p
                      id="company-name-error"
                      className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                      role="alert"
                    >
                      <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{errors.name.message}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nit" className="text-sm font-medium">
                    NIT <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nit"
                    {...register("nit", {
                      required: "El NIT es requerido",
                    })}
                    placeholder="Número de Identificación Tributaria"
                    className={cn(
                      errors.nit &&
                        "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
                    )}
                    aria-invalid={!!errors.nit}
                    aria-describedby={errors.nit ? "nit-error" : undefined}
                  />
                  {errors.nit && (
                    <p
                      id="nit-error"
                      className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                      role="alert"
                    >
                      <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{errors.nit.message}</span>
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
                  placeholder="Dirección de la empresa"
                  className={cn(
                    errors.address &&
                      "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
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
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="Teléfono de contacto"
                    className={cn(
                      errors.phone &&
                        "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
                    )}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
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
                  <Label htmlFor="company-email" className="text-sm font-medium">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="company-email"
                    type="email"
                    {...register("email", {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "El formato del correo electrónico no es válido",
                      },
                    })}
                    placeholder="empresa@email.com"
                    className={cn(
                      errors.email &&
                        "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
                    )}
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? "company-email-error" : undefined
                    }
                  />
                  {errors.email && (
                    <p
                      id="company-email-error"
                      className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                      role="alert"
                    >
                      <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{errors.email.message}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector" className="text-sm font-medium">
                  Sector
                </Label>
                <Input
                  id="sector"
                  {...register("sector")}
                  placeholder="Sector de la empresa"
                  className={cn(
                    errors.sector &&
                      "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
                  )}
                  aria-invalid={!!errors.sector}
                  aria-describedby={errors.sector ? "sector-error" : undefined}
                />
                {errors.sector && (
                  <p
                    id="sector-error"
                    className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                    role="alert"
                  >
                    <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{errors.sector.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Descripción de la empresa"
                  rows={4}
                  className={cn(
                    errors.description &&
                      "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
                  )}
                  aria-invalid={!!errors.description}
                  aria-describedby={
                    errors.description ? "description-error" : undefined
                  }
                />
                {errors.description && (
                  <p
                    id="description-error"
                    className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                    role="alert"
                  >
                    <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{errors.description.message}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 sm:flex-initial"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isCreating ? "Creando..." : "Guardando..."}
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      {isCreating ? "Crear Empresa" : "Guardar Cambios"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isCreating ? "Confirmar creación" : "Confirmar cambios"}
                </DialogTitle>
                <DialogDescription>
                  {isCreating
                    ? "¿Estás seguro de que deseas crear tu empresa con esta información?"
                    : "¿Estás seguro de que deseas guardar los cambios en la información de tu empresa?"}
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
                <Button
                  onClick={handleConfirmSave}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isCreating ? "Creando..." : "Guardando..."}
                    </>
                  ) : (
                    "Confirmar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    );
  }

  return (
    <Card className="border-2 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {isCreating ? "Crear Empresa" : "Información de la Empresa"}
            </CardTitle>
            <CardDescription className="mt-1">
              {isCreating
                ? "Completa la información de tu empresa para comenzar"
                : "Actualiza la información de tu empresa"}
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
          {/* Logo Upload Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Logo de la Empresa</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-24 w-24 object-contain border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                  />
                  {logoPreview !== (company?.logo || null) && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                      aria-label="Eliminar logo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-24 w-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                  <Building2 className="h-8 w-8 text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <Label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {logoPreview ? "Cambiar Logo" : "Subir Logo"}
                </Label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  PNG o JPG, máximo 5MB
                </p>
              </div>
            </div>
          </div>

          {hasAttemptedSubmit && (errors.name || errors.nit || errors.email || errors.address || errors.phone || errors.sector || errors.description) && (
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
                  {errors.name && <li>{errors.name.message}</li>}
                  {errors.nit && <li>{errors.nit.message}</li>}
                  {errors.email && <li>{errors.email.message}</li>}
                  {errors.address && <li>{errors.address.message}</li>}
                  {errors.phone && <li>{errors.phone.message}</li>}
                  {errors.sector && <li>{errors.sector.message}</li>}
                  {errors.description && <li>{errors.description.message}</li>}
                </ul>
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name" className="text-sm font-medium">
                Nombre de la Empresa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company-name"
                {...register("name", {
                  required: "El nombre de la empresa es requerido",
                })}
                placeholder="Nombre de la empresa"
                className={cn(
                  errors.name &&
                    "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
                )}
                aria-invalid={!!errors.name}
                aria-describedby={
                  errors.name ? "company-name-error" : undefined
                }
              />
              {errors.name && (
                <p
                  id="company-name-error"
                  className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                  role="alert"
                >
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nit" className="text-sm font-medium">
                NIT <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nit"
                {...register("nit", {
                  required: "El NIT es requerido",
                })}
                placeholder="Número de Identificación Tributaria"
                className={cn(
                  errors.nit &&
                    "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
                )}
                aria-invalid={!!errors.nit}
                aria-describedby={errors.nit ? "nit-error" : undefined}
              />
              {errors.nit && (
                <p
                  id="nit-error"
                  className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                  role="alert"
                >
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.nit.message}</span>
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
              placeholder="Dirección de la empresa"
              className={cn(
                errors.address &&
                  "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
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
              <Label htmlFor="phone" className="text-sm font-medium">
                Teléfono
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Teléfono de contacto"
                className={cn(
                  errors.phone &&
                    "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
                )}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
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
              <Label htmlFor="company-email" className="text-sm font-medium">
                Correo Electrónico
              </Label>
              <Input
                id="company-email"
                type="email"
                {...register("email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "El formato del correo electrónico no es válido",
                  },
                })}
                placeholder="empresa@email.com"
                className={cn(
                  errors.email &&
                    "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
                )}
                aria-invalid={!!errors.email}
                aria-describedby={
                  errors.email ? "company-email-error" : undefined
                }
              />
              {errors.email && (
                <p
                  id="company-email-error"
                  className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                  role="alert"
                >
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector" className="text-sm font-medium">
              Sector
            </Label>
            <Input
              id="sector"
              {...register("sector")}
              placeholder="Sector de la empresa"
              className={cn(
                errors.sector &&
                  "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
              )}
              aria-invalid={!!errors.sector}
              aria-describedby={errors.sector ? "sector-error" : undefined}
            />
            {errors.sector && (
              <p
                id="sector-error"
                className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.sector.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descripción de la empresa"
              rows={4}
              className={cn(
                errors.description &&
                  "border-destructive focus-visible:ring-destructive focus-visible:ring-2"
              )}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
            />
            {errors.description && (
              <p
                id="description-error"
                className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                role="alert"
              >
                <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{errors.description.message}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-initial"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreating ? "Creando..." : "Guardando..."}
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  {isCreating ? "Crear Empresa" : "Guardar Cambios"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Confirmar creación" : "Confirmar cambios"}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? "¿Estás seguro de que deseas crear tu empresa con esta información?"
                : "¿Estás seguro de que deseas guardar los cambios en la información de tu empresa?"}
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
            <Button
              onClick={handleConfirmSave}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreating ? "Creando..." : "Guardando..."}
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
