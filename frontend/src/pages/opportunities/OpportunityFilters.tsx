import { X, Filter, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { OpportunityStatusValues } from '@/types/opportunity.types';
import { useCareers } from '@/hooks/useCareers';
import { useCompanies } from '@/hooks/useCompanies';

export interface OpportunityFilters {
  careerId?: string;
  companyId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OpportunityFiltersProps {
  filters: OpportunityFilters;
  onFilterChange: (key: keyof OpportunityFilters, value: string) => void;
  onClearFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
}

export function OpportunityFilters({
  filters,
  onFilterChange,
  onClearFilters,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
}: OpportunityFiltersProps) {
  const { data: careersData } = useCareers({ limit: 1000, isActive: true });
  const careers = careersData?.data || [];
  
  const { data: companiesData } = useCompanies({ limit: 1000 }, { enabled: showFilters });
  const companies = companiesData?.data || [];

  const activeFiltersCount =
    (filters.careerId ? 1 : 0) +
    (filters.companyId ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800">
      <div className="flex flex-col gap-3">
        <button
          onClick={onToggleFilters}
          type="button"
          className={`relative flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full sm:w-auto touch-manipulation cursor-pointer ${
            showFilters || hasActiveFilters
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Filter className="h-4 w-4 flex-shrink-0" />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 z-10"
              style={{ backgroundColor: '#B1291D' }}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="w-full sm:w-48">
                <SearchableSelect
                  options={[
                    { value: 'all', label: 'Todas las carreras' },
                    ...careers.map((career) => ({
                      value: career._id,
                      label: career.name,
                    })),
                  ]}
                  value={filters.careerId || 'all'}
                  onValueChange={(value) =>
                    onFilterChange('careerId', value === 'all' ? '' : value)
                  }
                  placeholder="Carrera"
                  searchPlaceholder="Buscar carrera..."
                  emptyMessage="No se encontraron carreras"
                />
              </div>

              <Select
                value={filters.companyId || 'all'}
                onValueChange={(value) =>
                  onFilterChange('companyId', value === 'all' ? '' : value)
                }
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las empresas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company._id} value={company._id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  onFilterChange('status', value === 'all' ? '' : value)
                }
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value={OpportunityStatusValues.ACTIVE}>
                    Activa
                  </SelectItem>
                  <SelectItem value={OpportunityStatusValues.CLOSED}>
                    Cerrada
                  </SelectItem>
                  <SelectItem value={OpportunityStatusValues.DRAFT}>
                    Borrador
                  </SelectItem>
                  <SelectItem value={OpportunityStatusValues.DISABLED}>
                    Deshabilitada
                  </SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <button
                  onClick={onClearFilters}
                  type="button"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors duration-200 px-3 sm:px-4 py-2.5 sm:py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 touch-manipulation w-full sm:w-auto sm:ml-auto"
                >
                  <X className="h-4 w-4 flex-shrink-0" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 sm:py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 touch-manipulation"
                  placeholder="Fecha desde"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => onFilterChange('dateTo', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 sm:py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 touch-manipulation"
                  placeholder="Fecha hasta"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
