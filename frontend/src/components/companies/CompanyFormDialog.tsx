import { useEffect, useCallback, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Upload, X } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCompany, useUpdateCompany } from '@/hooks/useCompanies';
import type { Company, CreateCompanyDto } from '@/types/company.types';
import { CompanyStatusValues } from '@/types/company.types';

const companySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  nit: z.string().min(1, 'El NIT es requerido'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  sector: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['activa', 'inactiva']).optional(),
  createUser: z.boolean(),
  userName: z.string().optional(),
  userEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  userPassword: z.string().optional(),
}).refine(
  (data) => {
    if (data.createUser) {
      return !!data.userName && !!data.userEmail && !!data.userPassword;
    }
    return true;
  },
  {
    message: 'Los datos del usuario son requeridos cuando se crea un usuario',
    path: ['userName'],
  },
);

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onSuccess?: () => void;
}

export function CompanyFormDialog({
  open,
  onOpenChange,
  company,
  onSuccess,
}: CompanyFormDialogProps) {
  const isEditing = !!company;
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      createUser: false,
      status: CompanyStatusValues.ACTIVE,
    },
  });

  const createUser = useWatch({
    control,
    name: 'createUser',
    defaultValue: false,
  });

  const status = useWatch({
    control,
    name: 'status',
    defaultValue: CompanyStatusValues.ACTIVE,
  });

  const handleStatusChange = useCallback(
    (value: string) => {
      setValue(
        'status',
        value as 'activa' | 'inactiva',
      );
    },
    [setValue],
  );

  const handleCreateUserChange = useCallback(
    (checked: boolean) => {
      setValue('createUser', checked === true);
    },
    [setValue],
  );

  useEffect(() => {
    if (open) {
      if (company) {
        reset({
          name: company.name,
          nit: company.nit,
          address: company.address || '',
          phone: company.phone || '',
          email: company.email || '',
          sector: company.sector || '',
          description: company.description || '',
          status: company.status,
          createUser: false,
          userName: '',
          userEmail: '',
          userPassword: '',
        });
        // Use setTimeout to avoid calling setState synchronously in effect
        setTimeout(() => {
          setLogoPreview(company.logo || null);
        }, 0);
      } else {
        reset({
          name: '',
          nit: '',
          address: '',
          phone: '',
          email: '',
          sector: '',
          description: '',
          status: CompanyStatusValues.ACTIVE,
          createUser: false,
          userName: '',
          userEmail: '',
          userPassword: '',
        });
        // Use setTimeout to avoid calling setState synchronously in effect
        setTimeout(() => {
          setLogoPreview(null);
        }, 0);
      }
    }
  }, [open, company, reset]);

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

  const onSubmit = useCallback(
    async (data: CompanyFormData) => {
      try {
        const companyData: CreateCompanyDto = {
          name: data.name,
          nit: data.nit,
          address: data.address || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          sector: data.sector || undefined,
          description: data.description || undefined,
          status: data.status,
          logo: logoPreview || undefined,
        };

        if (data.createUser && !isEditing) {
          companyData.initialUser = {
            name: data.userName || '',
            email: data.userEmail || '',
            password: data.userPassword || '',
          };
        }

        if (isEditing && company) {
          await updateMutation.mutateAsync({
            id: company._id,
            data: companyData,
          });
        } else {
          await createMutation.mutateAsync(companyData);
        }

        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        console.error('Error al guardar empresa:', error);
      }
    },
    [
      isEditing,
      company,
      createMutation,
      updateMutation,
      onOpenChange,
      onSuccess,
      logoPreview,
    ],
  );

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEditing ? 'Editar Empresa' : 'Nueva Empresa'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la información de la empresa'
              : 'Completa los datos para registrar una nueva empresa'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Empresa Ejemplo S.A. de C.V."
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nit">
                NIT <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nit"
                {...register('nit')}
                placeholder="0614-123456-101-5"
              />
              {errors.nit && (
                <p className="text-sm text-destructive">{errors.nit.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="contacto@empresa.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+503 2234-5678"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Input
                id="sector"
                {...register('sector')}
                placeholder="Tecnología"
              />
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={status || CompanyStatusValues.ACTIVE}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CompanyStatusValues.ACTIVE}>
                      Activa
                    </SelectItem>
                    <SelectItem value={CompanyStatusValues.INACTIVE}>
                      Inactiva
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Av. Las Palmas, San Salvador"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Empresa dedicada al desarrollo de software"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo de la Empresa</Label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-20 w-20 object-contain border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  {logoPreview !== (company?.logo || null) && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex-1">
                <label
                  htmlFor="logo"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">Click para subir</span> o
                      arrastra y suelta
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      PNG o JPG (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    id="logo"
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {!isEditing && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createUser"
                  checked={createUser}
                  onCheckedChange={handleCreateUserChange}
                />
                <Label
                  htmlFor="createUser"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Crear usuario inicial
                </Label>
              </div>

              {createUser && (
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h3 className="text-sm font-semibold">Datos del Usuario</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">
                        Nombre <span className="text-destructive">*</span>
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

                  <div className="space-y-2">
                    <Label htmlFor="userPassword">
                      Contraseña <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="userPassword"
                      type="password"
                      {...register('userPassword')}
                      placeholder="Password123!"
                    />
                    {errors.userPassword && (
                      <p className="text-sm text-destructive">
                        {errors.userPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

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

