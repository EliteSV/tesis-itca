import { useMemo } from 'react';
import { useMyApplications } from './useOpportunities';
import { ApplicationStatusValues } from '@/types/opportunity.types';
import { useAuth } from './useAuth';
import { UserRole } from '@/types/auth.types';

export function useHasAcceptedApplication() {
  const { user } = useAuth();
  const isStudent = user?.role === UserRole.ESTUDIANTE;
  
  const { data: applicationsData } = useMyApplications({
    page: 1,
    limit: 100,
  }, {
    enabled: isStudent,
  });

  const hasAcceptedApplication = useMemo(() => {
    if (!isStudent) {
      return false;
    }
    const applications = applicationsData?.data || [];
    return applications.some(
      (app) => app.status === ApplicationStatusValues.ACCEPTED,
    );
  }, [applicationsData?.data, isStudent]);

  return hasAcceptedApplication;
}

