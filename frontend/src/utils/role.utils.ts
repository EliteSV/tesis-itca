import { UserRole } from '@/types/auth.types';

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.COMPANY]: 'Empresa',
  [UserRole.ESTUDIANTE]: 'Estudiante',
  [UserRole.COORDINADOR]: 'Coordinador',
};

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] || role;
}
