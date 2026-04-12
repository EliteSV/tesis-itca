import { useMemo } from 'react';
import { useDashboard } from './useDashboard';
import { useAuth } from './useAuth';
import { UserRole } from '@/types/auth.types';

export function useHasActivePractice() {
  const { user } = useAuth();
  const isStudent = user?.role === UserRole.ESTUDIANTE;
  const { data: stats } = useDashboard();

  const hasActivePractice = useMemo(() => {
    if (!isStudent || !stats) {
      return false;
    }

    const studentStats = stats as {
      practiceProfessional?: {
        isFinalized: boolean;
      } | null;
    };

    return (
      studentStats.practiceProfessional !== null &&
      studentStats.practiceProfessional !== undefined &&
      !studentStats.practiceProfessional.isFinalized
    );
  }, [isStudent, stats]);

  return hasActivePractice;
}
