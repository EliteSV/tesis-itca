import { Button } from '@/components/ui/button';

interface ApplicationFiltersProps {
  filterStatus: string;
  onFilterChange: (status: string) => void;
  totalCount: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

export function ApplicationFilters({
  filterStatus,
  onFilterChange,
  totalCount,
  pendingCount,
  acceptedCount,
  rejectedCount,
}: ApplicationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={filterStatus === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('all')}
        className="text-xs sm:text-sm"
      >
        Todas ({totalCount})
      </Button>
      <Button
        variant={filterStatus === 'pendiente' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('pendiente')}
        className="text-xs sm:text-sm"
      >
        Pendientes ({pendingCount})
      </Button>
      <Button
        variant={filterStatus === 'aceptada' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('aceptada')}
        className="text-xs sm:text-sm"
      >
        Aceptadas ({acceptedCount})
      </Button>
      <Button
        variant={filterStatus === 'rechazada' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange('rechazada')}
        className="text-xs sm:text-sm"
      >
        Rechazadas ({rejectedCount})
      </Button>
    </div>
  );
}

