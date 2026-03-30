import { useAuth } from '@/hooks/useAuth';
import { useMyCompany } from '@/hooks/useMyCompany';
import { UserRole } from '@/types/auth.types';
import { Loader2 } from 'lucide-react';
import { NoCompanyMessage } from '@/components/companies/NoCompanyMessage';

interface RequireCompanyProps {
  children: React.ReactNode;
}

export function RequireCompany({ children }: RequireCompanyProps) {
  const { user } = useAuth();
  const { data: company, isLoading, isError, error } = useMyCompany({
    enabled: user?.role === UserRole.COMPANY,
  });

  // Solo aplicar esta verificación a usuarios COMPANY
  if (user?.role !== UserRole.COMPANY) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-slate-600 dark:text-slate-400">Cargando información de la empresa...</p>
        </div>
      </div>
    );
  }

  const errorResponse = error as { response?: { status?: number } } | null;
  const isNotFound = isError && errorResponse?.response?.status === 404;

  if (isNotFound || !company) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <NoCompanyMessage
          showActionButton
          message="Para poder gestionar oportunidades y estudiantes, primero debes crear y configurar tu empresa. Ve a la sección de Configuración y completa la información de tu empresa."
        />
      </div>
    );
  }

  return <>{children}</>;
}

