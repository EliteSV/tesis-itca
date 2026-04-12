import type { CompanyStatus } from '@/types/company.types';

export function getStatusLabel(status: CompanyStatus): string {
  const labels: Record<CompanyStatus, string> = {
    activa: 'Activa',
    inactiva: 'Inactiva',
  };
  return labels[status] || status;
}

export function getStatusVariant(
  status: CompanyStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<
    CompanyStatus,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    activa: 'default',
    inactiva: 'secondary',
  };
  return variants[status];
}




