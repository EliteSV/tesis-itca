import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, GraduationCap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AutocompleteSearch } from '@/components/ui/autocomplete-search';
import { formatDate } from '@/utils/date.utils';
import { exportToCSV } from '@/utils/export.utils';
import { Tooltip } from '@/components/ui/tooltip';
import {
  useCareers,
  useDeleteCareer,
  useToggleCareerStatus,
} from '@/hooks/useCareers';
import { useCareerCategories } from '@/hooks/useCareerCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { useToastContext } from '@/contexts/ToastContext';
import type { Career } from '@/types/career.types';
import type {
  SortConfig,
  SortField,
  Filters,
} from '@/pages/careers/Careers.types';
import { CareerFormDialog } from '@/components/careers/CareerFormDialog';
import { CareerFilters } from '@/pages/careers/CareerFilters';
import { CareerTable } from '@/pages/careers/CareerTable';
import { CareerTableSkeleton } from '@/pages/careers/CareerTableSkeleton';
import { BulkActions } from '@/pages/careers/BulkActions';
import { Pagination } from '@/pages/career-categories/Pagination';
import { ConfirmDialog } from '@/pages/careers/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function formatMessageWithHighlight(
  name: string,
  message: string,
): React.ReactNode {
  return (
    <p>
      {message.replace('{name}', '')}
      <span className="font-bold text-slate-900 dark:text-slate-100">
        {name}
      </span>
      ?
    </p>
  );
}

export function CareersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialPage = () => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  };

  const getInitialSearch = () => {
    return searchParams.get('search') || '';
  };

  const getInitialSort = (): SortConfig => {
    const sortBy = searchParams.get('sortBy') as SortField | null;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;
    return {
      field: sortBy || 'name',
      order: sortOrder || 'asc',
    };
  };

  const getInitialFilters = (): Filters => {
    const statusParam = searchParams.get('status');
    const categoryIdParam = searchParams.get('categoryId');
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');
    return {
      status: statusParam || '',
      categoryId: categoryIdParam || '',
      dateFrom: dateFromParam || undefined,
      dateTo: dateToParam || undefined,
    };
  };

  const [page, setPage] = useState(getInitialPage);
  const [search, setSearch] = useState(getInitialSearch);
  const debouncedSearch = useDebounce(search, 300);
  const [sort, setSort] = useState<SortConfig>(getInitialSort);
  const [filters, setFilters] = useState<Filters>(getInitialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'delete' | null>(null);
  const [careerToDelete, setCareerToDelete] = useState<Career | null>(null);

  const limit = 10;
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      categoryId:
        filters.categoryId && filters.categoryId !== 'all'
          ? filters.categoryId
          : undefined,
      isActive:
        filters.status === 'active'
          ? true
          : filters.status === 'inactive'
            ? false
            : undefined,
      sortBy: sort.field,
      sortOrder: sort.order,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    }),
    [
      page,
      limit,
      debouncedSearch,
      filters.categoryId,
      filters.status,
      filters.dateFrom,
      filters.dateTo,
      sort.field,
      sort.order,
    ],
  );

  const { data, isLoading } = useCareers(queryParams);
  const deleteMutation = useDeleteCareer();
  const toggleStatusMutation = useToggleCareerStatus();
  const toast = useToastContext();

  const categoriesQueryParams = useMemo(() => ({ limit: 100 }), []);
  const { data: categoriesData } = useCareerCategories(categoriesQueryParams);

  const careers = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data
    ? {
        total: data.total,
        pages: data.totalPages,
        page: data.page,
      }
    : { total: 0, pages: 1, page: 1 };

  const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);

  const searchSuggestions = useMemo(
    () => [
      ...careers.map((career) => career.name),
      ...careers.map((career) => career.code).filter(Boolean),
    ],
    [careers],
  );

  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: 'Todas las categorías' },
      ...categories.map((category) => ({
        value: category._id,
        label: category.name,
      })),
    ],
    [categories],
  );

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    }
    
    if (sort.field !== 'name' || sort.order !== 'asc') {
      params.set('sortBy', sort.field);
      params.set('sortOrder', sort.order);
    }
    
    if (filters.status) {
      params.set('status', filters.status);
    }
    
    if (filters.categoryId && filters.categoryId !== 'all') {
      params.set('categoryId', filters.categoryId);
    }
    
    if (filters.dateFrom) {
      params.set('dateFrom', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      params.set('dateTo', filters.dateTo);
    }
    
    const currentParams = searchParams.toString();
    const newParams = params.toString();
    
    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [page, debouncedSearch, sort.field, sort.order, filters.status, filters.categoryId, filters.dateFrom, filters.dateTo, setSearchParams, searchParams]);

  const handleSort = useCallback((field: SortField) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
      setSelectedIds(new Set());
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters({ status: '', categoryId: '', dateFrom: undefined, dateTo: undefined });
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const hasActiveFilters = useMemo(
    () => filters.status !== '' || (filters.categoryId !== '' && filters.categoryId !== 'all') || filters.dateFrom !== undefined || filters.dateTo !== undefined,
    [filters],
  );

  const handleCreate = useCallback(() => {
    setEditingCareer(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((career: Career) => {
    setEditingCareer(career);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((career: Career) => {
    setSelectedCareer(career);
    setIsViewDialogOpen(true);
  }, []);

  const handleDelete = useCallback((career: Career) => {
    setCareerToDelete(career);
    setConfirmType('delete');
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!careerToDelete) return;
    try {
      await deleteMutation.mutateAsync(careerToDelete._id);
      toast.success(
        'Carrera eliminada',
        `La carrera "${careerToDelete.name}" ha sido eliminada correctamente.`,
      );
      setConfirmType(null);
      setCareerToDelete(null);
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al eliminar la carrera';
        toast.error('Error al eliminar', errorMessage);
      }
  }, [careerToDelete, deleteMutation, toast]);

  const handleToggleStatus = useCallback(
    async (career: Career) => {
      try {
        await toggleStatusMutation.mutateAsync(career._id);
        const newStatus = !career.isActive;
        toast.success(
          'Estado actualizado',
          `La carrera "${career.name}" ha sido ${
            newStatus ? 'activada' : 'desactivada'
          } correctamente.`,
        );
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Error al cambiar el estado';
        toast.error('Error al cambiar estado', errorMessage);
      }
    },
    [toggleStatusMutation, toast],
  );

  const handleDuplicate = useCallback((career: Career) => {
    setEditingCareer({
      ...career,
      _id: '',
      name: `${career.name} (Copia)`,
      code: `${career.code}-COPY`,
    });
    setIsFormOpen(true);
    toast.info('Duplicando carrera', 'Completa los datos para crear la copia.');
  }, [toast]);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === careers.length
        ? new Set()
        : new Set(careers.map((c) => c._id)),
    );
  }, [careers]);

  const toggleSelectCareer = useCallback((careerId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(careerId)) {
        newSet.delete(careerId);
      } else {
        newSet.add(careerId);
      }
      return newSet;
    });
  }, []);

  const selectionState: 'none' | 'partial' | 'all' = useMemo(() => {
    if (selectedIds.size === 0) return 'none';
    if (selectedIds.size === careers.length && careers.length > 0) return 'all';
    return 'partial';
  }, [selectedIds.size, careers.length]);

  const getStatusBadge = useCallback(
    (isActive: boolean) =>
      isActive ? (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all duration-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">Activo</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-all duration-200">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          <span className="hidden sm:inline">Inactivo</span>
        </span>
      ),
    [],
  );

  const getCategoryName = useCallback(
    (categoryId: Career['categoryId']): string => {
      if (typeof categoryId === 'string') {
        const category = categories.find((c) => c._id === categoryId);
        return category?.name || '-';
      }
      if (categoryId && typeof categoryId === 'object' && 'name' in categoryId) {
        return categoryId.name || '-';
      }
      return '-';
    },
    [categories],
  );

  const selectedCareersStatus = useMemo(() => {
    const selected = careers.filter((c) => selectedIds.has(c._id));
    return {
      hasActive: selected.some((c) => c.isActive),
      hasInactive: selected.some((c) => !c.isActive),
    };
  }, [selectedIds, careers]);

  const handleBulkAction = useCallback(
    async (action: 'activate' | 'deactivate' | 'delete') => {
      if (selectedIds.size === 0) return;

      const actionNames = {
        activate: 'activar',
        deactivate: 'desactivar',
        delete: 'eliminar',
      };

      const actionName = actionNames[action];
      const count = selectedIds.size;
      const confirmMessage =
        action === 'delete'
          ? `¿Estás seguro de que deseas eliminar ${count} carrera${count > 1 ? 's' : ''}? Esta acción no se puede deshacer.`
          : `¿Estás seguro de que deseas ${actionName} ${count} carrera${count > 1 ? 's' : ''}?`;

      if (!window.confirm(confirmMessage)) return;

      let success = 0;
      let fail = 0;
      const promises = Array.from(selectedIds).map(async (id) => {
        try {
          if (action === 'activate') {
            const career = careers.find((c) => c._id === id);
            if (career && !career.isActive) {
              await toggleStatusMutation.mutateAsync(id);
            }
          } else if (action === 'deactivate') {
            const career = careers.find((c) => c._id === id);
            if (career && career.isActive) {
              await toggleStatusMutation.mutateAsync(id);
            }
          } else {
            await deleteMutation.mutateAsync(id);
          }
          success++;
        } catch {
          fail++;
        }
      });
      await Promise.all(promises);
      setSelectedIds(new Set());

      if (success > 0) {
        toast.success(
          'Acción completada',
          `${success} carrera${success > 1 ? 's' : ''} ${action === 'delete' ? 'eliminada' : action === 'activate' ? 'activada' : 'desactivada'}${success > 1 ? 's' : ''} correctamente.`,
        );
      }
      if (fail > 0) {
        toast.error(
          'Error en la operación',
          `No se pudieron ${actionName} ${fail} carrera${fail > 1 ? 's' : ''}.`,
        );
      }
    },
    [selectedIds, careers, toggleStatusMutation, deleteMutation, toast],
  );

  const isActionLoading =
    deleteMutation.isPending || toggleStatusMutation.isPending;

  const handleExport = useCallback(() => {
    const exportData = careers.map((career) => ({
      Código: career.code,
      Nombre: career.name,
      Categoría: getCategoryName(career.categoryId),
      Descripción: career.description || '',
      Duración: career.duration ? `${career.duration} años` : '',
      Estado: career.isActive ? 'Activo' : 'Inactivo',
      'Fecha de Creación': formatDate(career.createdAt),
      'Fecha de Actualización': formatDate(career.updatedAt),
    }));
    exportToCSV(exportData, 'carreras', {
      Código: 'Código',
      Nombre: 'Nombre',
      Categoría: 'Categoría',
      Descripción: 'Descripción',
      Duración: 'Duración',
      Estado: 'Estado',
      'Fecha de Creación': 'Fecha de Creación',
      'Fecha de Actualización': 'Fecha de Actualización',
    });
    toast.success('Exportación completada', 'Los datos se han exportado correctamente.');
  }, [careers, getCategoryName, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreate();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"][placeholder*="buscar" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreate]);

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 md:py-8">
      <div className="space-y-3 sm:space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
              Carreras
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Gestiona las carreras registradas en el sistema
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
            <Tooltip content="Nueva carrera (Ctrl+N)">
              <Button
                onClick={handleCreate}
                className="gap-1.5 sm:gap-2 w-full sm:w-auto flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Crear nueva carrera"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">
                  Nueva Carrera
                </span>
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="mb-4">
          <div className="max-w-md">
            <AutocompleteSearch
              value={search}
              onChange={setSearch}
              placeholder="Buscar carreras..."
              suggestions={searchSuggestions}
              isLoading={isLoading}
            />
          </div>
        </div>

        <Card className="relative w-full overflow-hidden">
          <CareerFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters((p) => !p)}
            hasActiveFilters={hasActiveFilters}
            categoryOptions={categoryOptions}
          />

          <Pagination
            page={meta.page}
            totalPages={meta.pages}
            total={meta.total}
            limit={limit}
            onPageChange={setPage}
          />

          <div>
            <div className="px-3 sm:px-4 md:px-6">
              <BulkActions
                selectedCount={selectedIds.size}
                hasActive={selectedCareersStatus.hasActive}
                hasInactive={selectedCareersStatus.hasInactive}
                onActivate={() => handleBulkAction('activate')}
                onDeactivate={() => handleBulkAction('deactivate')}
                onDelete={() => handleBulkAction('delete')}
                isLoading={isActionLoading && selectedIds.size > 0}
              />
            </div>

            {isLoading ? (
              <div className="px-3 sm:px-4 md:px-6">
                <CareerTableSkeleton />
              </div>
            ) : careers.length === 0 ? (
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  No se encontraron carreras
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                  {search
                    ? 'No hay carreras que coincidan con tu búsqueda'
                    : 'Comienza creando tu primera carrera.'}
                </p>
                {search ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearch('')}
                    className="transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Limpiar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    className="transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Carrera
                  </Button>
                )}
                </div>
              </div>
            ) : (
              <div className="w-full px-3 sm:px-4 md:px-6">
                <CareerTable
                careers={careers}
                selectedIds={selectedIds}
                sort={sort}
                onSort={handleSort}
                onToggleSelectAll={toggleSelectAll}
                onToggleSelect={toggleSelectCareer}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onDuplicate={handleDuplicate}
                onStatusChange={handleToggleStatus}
                getStatusBadge={getStatusBadge}
                getCategoryName={getCategoryName}
                selectionState={selectionState}
                />
              </div>
            )}

            <div className="px-3 sm:px-4 md:px-6">
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

        <CareerFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          career={editingCareer}
          onSuccess={() => setIsFormOpen(false)}
        />

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="break-words">{selectedCareer?.name}</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Información detallada de la carrera
              </DialogDescription>
            </DialogHeader>
            {selectedCareer && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Código
                    </p>
                    <p className="text-xs sm:text-sm break-words font-mono">{selectedCareer.code}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Estado
                    </p>
                    {getStatusBadge(selectedCareer.isActive)}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Categoría
                    </p>
                    <p className="text-xs sm:text-sm break-words">
                      {getCategoryName(selectedCareer.categoryId)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Duración
                    </p>
                    <p className="text-xs sm:text-sm break-words">
                      {selectedCareer.duration
                        ? `${selectedCareer.duration} años`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Creado
                    </p>
                    <p className="text-xs sm:text-sm break-words">
                      {formatDate(selectedCareer.createdAt)}
                    </p>
                  </div>
                </div>
                {selectedCareer.description && (
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Descripción
                    </p>
                    <p className="text-xs sm:text-sm break-words whitespace-pre-wrap">{selectedCareer.description}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          isOpen={confirmType === 'delete'}
          onClose={() => {
            setConfirmType(null);
            setCareerToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Eliminar Carrera"
          message={
            careerToDelete
              ? formatMessageWithHighlight(
                  careerToDelete.name,
                  '¿Estás seguro de eliminar la carrera ',
                )
              : ''
          }
          confirmText="Eliminar"
          variant="destructive"
          loading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
