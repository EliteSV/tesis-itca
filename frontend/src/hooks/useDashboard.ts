import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useReports() {
  return useQuery({
    queryKey: ['dashboard', 'reports'],
    queryFn: () => dashboardApi.getReports(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
