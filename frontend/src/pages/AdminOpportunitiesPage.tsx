import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Search, GraduationCap, Users, Building2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import {
  TableActionsCell,
  TableActionsDropdownMobile,
} from '@/components/ui/table-components';
import { useOpportunitiesForAdmin } from '@/hooks/useOpportunities';
import { useDebounce } from '@/hooks/useDebounce';
import { useToastContext } from '@/contexts/ToastContext';
import { formatDate } from '@/utils/date.utils';
import { exportToCSV } from '@/utils/export.utils';
import { OpportunityFilters, type OpportunityFilters as OpportunityFiltersType } from '@/pages/opportunities/OpportunityFilters';
import { Pagination } from '@/pages/career-categories/Pagination';
import type { Opportunity } from '@/types/opportunity.types';

export function AdminOpportunitiesPage() {
  const navigate = useNavigate();
  const toast = useToastContext();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OpportunityFiltersType>({});
  const debouncedSearch = useDebounce(search, 300);

  const limit = 10;
  const { data, isLoading } = useOpportunitiesForAdmin({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: filters.status || undefined,
  });

  const allOpportunities = useMemo(() => {
    return data?.data ?? [];
  }, [data?.data]);

  // Filtrar en el frontend para filtros no soportados por el backend
  const opportunities = useMemo(() => {
    let result: Opportunity[] = [...allOpportunities];
    
    if (filters.careerId) {
      result = result.filter((opp: Opportunity) => opp.careerId === filters.careerId || opp.career?._id === filters.careerId);
    }
    
    if (filters.companyId) {
      result = result.filter((opp: Opportunity) => opp.companyId === filters.companyId || opp.company?._id === filters.companyId);
    }
    
    if (filters.dateFrom) {
      result = result.filter((opp: Opportunity) => {
        const oppDate = new Date(opp.createdAt);
        const fromDate = new Date(filters.dateFrom!);
        return oppDate >= fromDate;
      });
    }
    
    if (filters.dateTo) {
      result = result.filter((opp: Opportunity) => {
        const oppDate = new Date(opp.createdAt);
        const toDate = new Date(filters.dateTo!);
        toDate.setHours(23, 59, 59, 999);
        return oppDate <= toDate;
      });
    }
    
    return result;
  }, [allOpportunities, filters]);

  // Calcular meta para paginación (similar a StudentsPage)
  const meta = useMemo(() => {
    return data
      ? {
          total: data.total,
          pages: data.totalPages,
          page: data.page,
        }
      : {
          total: 0,
          pages: 1,
          page: 1,
        };
  }, [data]);

  const handleViewDetails = useCallback((opportunity: Opportunity) => {
    navigate(`/admin/opportunities/${opportunity._id}`);
  }, [navigate]);

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    if (!status) return 'outline';
    const normalizedStatus = status.toLowerCase().trim();
    switch (normalizedStatus) {
      case 'activa':
        return 'default';
      case 'cerrada':
        return 'destructive';
      case 'borrador':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.careerId ||
      filters.companyId ||
      filters.status ||
      filters.dateFrom ||
      filters.dateTo
    );
  }, [filters]);

  const handleFilterChange = useCallback(
    (key: keyof OpportunityFiltersType, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const handleExport = useCallback(() => {
    const exportData = opportunities.map((opportunity: Opportunity) => ({
      Título: opportunity.title,
      Empresa: opportunity.company?.name || '',
      Carrera: opportunity.career?.name || '',
      Horas: opportunity.totalHours,
      Vacantes: opportunity.availablePositions,
      Solicitudes: opportunity.applicationsCount || 0,
      Estado: opportunity.status,
      'Estado Activo': opportunity.isActive ? 'Sí' : 'No',
      Modalidad: opportunity.modality || '',
      'Tipo de Trabajo': opportunity.workType || '',
      'Fecha de Expiración': opportunity.expirationDate
        ? formatDate(opportunity.expirationDate)
        : '',
      'Fecha de Creación': formatDate(opportunity.createdAt),
      'Fecha de Actualización': formatDate(opportunity.updatedAt),
    }));
    exportToCSV(exportData, 'oportunidades', {
      Título: 'Título',
      Empresa: 'Empresa',
      Carrera: 'Carrera',
      Horas: 'Horas',
      Vacantes: 'Vacantes',
      Solicitudes: 'Solicitudes',
      Estado: 'Estado',
      'Estado Activo': 'Estado Activo',
      Modalidad: 'Modalidad',
      'Tipo de Trabajo': 'Tipo de Trabajo',
      'Fecha de Expiración': 'Fecha de Expiración',
      'Fecha de Creación': 'Fecha de Creación',
      'Fecha de Actualización': 'Fecha de Actualización',
    });
    toast.success(
      'Exportación completada',
      'Los datos se han exportado correctamente.',
    );
  }, [opportunities, toast]);

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Oportunidades
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Visualiza todas las oportunidades de prácticas profesionales de todas las empresas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Exportar a CSV">
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="gap-1.5 sm:gap-2 transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Exportar datos a CSV"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar oportunidades..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-10"
            />
          </div>
        </div>
      </div>

      <Card className="relative w-full overflow-hidden">
        <OpportunityFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((p) => !p)}
          hasActiveFilters={hasActiveFilters}
        />

        <Pagination
          page={meta.page}
          totalPages={meta.pages}
          total={meta.total}
          limit={limit}
          onPageChange={setPage}
        />

        <div>
          {/* Desktop Table View */}
          <div className="hidden md:block w-full overflow-x-auto">
            <div className="min-w-full px-3 sm:px-4 md:px-6">
              <table className="w-full min-w-[500px] lg:min-w-[600px] table-auto border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[250px]">
                      Título
                    </th>
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[180px]">
                      Empresa
                    </th>
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[150px]">
                      Carrera
                    </th>
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[80px]">
                      Horas
                    </th>
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                      Vacantes
                    </th>
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                      Solicitudes
                    </th>
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                      Estado
                    </th>
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell min-w-[120px]">
                      Creada
                    </th>
                    <th className="text-right py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky right-0 bg-white dark:bg-slate-900 z-30 w-16 sm:w-20 md:w-24 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td
                          colSpan={9}
                          className="h-12 animate-pulse bg-slate-100 dark:bg-slate-800"
                        />
                      </tr>
                    ))
                  ) : opportunities.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-8 text-slate-500 dark:text-slate-400"
                      >
                        {debouncedSearch
                          ? 'No se encontraron oportunidades con ese criterio de búsqueda.'
                          : 'Aún no hay oportunidades registradas en el sistema.'}
                      </td>
                    </tr>
                  ) : (
                    opportunities.map((opportunity, index) => (
                      <tr
                        key={opportunity._id}
                        className="group transition-all duration-200 animate-in fade-in slide-in-from-left-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 font-medium min-w-[250px]">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <span className="break-words text-xs sm:text-sm">{opportunity.title}</span>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[180px]">
                          {opportunity.company ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                              <span className="break-words text-xs sm:text-sm">{opportunity.company.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs sm:text-sm">-</span>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[150px]">
                          {opportunity.career ? (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-slate-400 flex-shrink-0" />
                              <span className="break-words text-xs sm:text-sm">{opportunity.career.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs sm:text-sm">-</span>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[80px]">
                          <span className="text-xs sm:text-sm">{opportunity.totalHours}</span>
                        </td>
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[100px]">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">{opportunity.availablePositions}</span>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[100px]">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">{opportunity.applicationsCount || 0}</span>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[100px]">
                          <Badge variant={getStatusBadgeVariant(opportunity?.status)} className="text-xs">
                            {opportunity?.status
                              ? capitalizeFirst(String(opportunity.status))
                              : 'Sin estado'}
                          </Badge>
                        </td>
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 hidden lg:table-cell whitespace-nowrap text-xs sm:text-sm text-slate-600 dark:text-slate-400 min-w-[120px]">
                          {formatDate(opportunity.createdAt)}
                        </td>
                        <TableActionsCell
                          itemId={opportunity._id}
                          actions={{
                            onView: () => handleViewDetails(opportunity),
                          }}
                          itemName={opportunity.title}
                        />
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="hidden md:block px-3 sm:px-4 md:px-6">
            <Pagination
              page={meta.page}
              totalPages={meta.pages}
              total={meta.total}
              limit={limit}
              onPageChange={setPage}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg"
              />
            ))
          ) : opportunities.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {debouncedSearch
                ? 'No se encontraron oportunidades con ese criterio de búsqueda.'
                : 'Aún no hay oportunidades registradas en el sistema.'}
            </div>
          ) : (
            opportunities.map((opportunity, index) => (
              <div
                key={opportunity._id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-200 animate-in fade-in slide-in-from-left-4"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-12 w-12 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 shrink-0">
                      <Briefcase className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mb-1">
                        {opportunity.title}
                      </h3>
                      {opportunity.company && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{opportunity.company.name}</span>
                        </div>
                      )}
                      {opportunity.career && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{opportunity.career.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={getStatusBadgeVariant(opportunity?.status)}
                      className="text-xs"
                    >
                      {opportunity?.status
                        ? capitalizeFirst(String(opportunity.status))
                        : 'Sin estado'}
                    </Badge>
                    <TableActionsDropdownMobile
                      itemId={opportunity._id}
                      actions={{
                        onView: () => handleViewDetails(opportunity),
                      }}
                      itemName={opportunity.title}
                    />
                  </div>
                </div>
                <div className="space-y-2 pl-16">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{opportunity.totalHours} horas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{opportunity.availablePositions} vacante(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{opportunity.applicationsCount || 0} solicitud(es)</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    Creada: {formatDate(opportunity.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
          </div>

          <div className="md:hidden px-4">
            <Pagination
              page={meta.page}
              totalPages={meta.pages}
              total={meta.total}
              limit={limit}
              onPageChange={setPage}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

