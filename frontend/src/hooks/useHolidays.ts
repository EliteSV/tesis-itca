import { useQuery } from '@tanstack/react-query';
import { practiceProfessionalApi } from '@/lib/api';

export function useHolidays(year?: number) {
  return useQuery({
    queryKey: ['holidays', year || new Date().getFullYear()],
    queryFn: () => practiceProfessionalApi.getHolidays(year),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}
