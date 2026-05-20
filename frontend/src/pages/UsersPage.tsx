import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, User as UserIcon, Download, Copy, Check, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/date.utils';
import { exportToCSV } from '@/utils/export.utils';
import { AutocompleteSearch } from '@/components/ui/autocomplete-search';
import {
  useUsers,
  useDeleteUser,
  useToggleUserStatus,
  useGenerateTemporaryPassword,
} from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { useToastContext } from '@/contexts/ToastContext';
import { Tooltip } from '@/components/ui/tooltip';
import { getRoleLabel } from '@/utils/role.utils';
import { UserRole } from '@/types/auth.types';
import type { User } from '@/types/user.types';
import type {
  SortConfig,
  SortField,
  Filters,
} from '@/pages/users/Users.types';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { UserFilters } from '@/pages/users/UserFilters';
import { UserTable } from '@/pages/users/UserTable';
import { UserTableSkeleton } from '@/pages/users/UserTableSkeleton';
import { BulkActions } from '@/pages/users/BulkActions';
import { Pagination } from '@/pages/career-categories/Pagination';
import { ConfirmDialog } from '@/pages/users/ConfirmDialog';
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

export function UsersPage() {
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
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');
    return {
      status: statusParam || '',
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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'delete' | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userForPassword, setUserForPassword] = useState<User | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const limit = 10;
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
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
      filters.status,
      filters.dateFrom,
      filters.dateTo,
      sort.field,
      sort.order,
    ],
  );

  const { data, isLoading } = useUsers(queryParams);
  const deleteMutation = useDeleteUser();
  const toggleStatusMutation = useToggleUserStatus();
  const generatePasswordMutation = useGenerateTemporaryPassword();
  const toast = useToastContext();

  const users = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data
    ? {
        total: data.total,
        pages: data.totalPages,
        page: data.page,
      }
    : { total: 0, pages: 1, page: 1 };

  const searchSuggestions = useMemo(
    () => [
      ...users.map((user) => user.name),
      ...users.map((user) => user.email),
    ],
    [users],
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
  }, [
    page,
    debouncedSearch,
    sort.field,
    sort.order,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
    setSearchParams,
    searchParams,
  ]);

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
    setFilters({ status: '', dateFrom: undefined, dateTo: undefined });
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      filters.status !== '' ||
      filters.dateFrom !== undefined ||
      filters.dateTo !== undefined,
    [filters],
  );

  const handleCreate = useCallback(() => {
    setEditingUser(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  }, []);

  const handleDelete = useCallback((user: User) => {
    setUserToDelete(user);
    setConfirmType('delete');
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!userToDelete) return;
    try {
      await deleteMutation.mutateAsync(userToDelete._id);
      toast.success(
        'Usuario eliminado',
        `El usuario "${userToDelete.name}" ha sido eliminado correctamente.`,
      );
      setConfirmType(null);
      setUserToDelete(null);
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Error al eliminar el usuario';
      toast.error('Error al eliminar', errorMessage);
    }
  }, [userToDelete, deleteMutation, toast]);

  const handleToggleStatus = useCallback(
    async (user: User) => {
      try {
        await toggleStatusMutation.mutateAsync(user._id);
        const newStatus = !user.isActive;
        toast.success(
          'Estado actualizado',
          `El usuario "${user.name}" ha sido ${
            newStatus ? 'activado' : 'desactivado'
          } correctamente.`,
        );
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Error al cambiar el estado';
        toast.error('Error al cambiar estado', errorMessage);
      }
    },
    [toggleStatusMutation, toast],
  );

  const handleGeneratePassword = useCallback(
    async (user: User) => {
      try {
        const response = await generatePasswordMutation.mutateAsync(user._id);
        setUserForPassword(user);
        setGeneratedPassword(response.generatedPassword);
        setIsPasswordDialogOpen(true);
        toast.success(
          'Contraseña generada',
          `Se ha generado una nueva contraseña temporal para "${user.name}".`,
        );
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Error al generar la contraseña';
        toast.error('Error al generar contraseña', errorMessage);
      }
    },
    [generatePasswordMutation, toast],
  );

  const handleCopyPassword = useCallback(async () => {
    if (generatedPassword) {
      try {
        await navigator.clipboard.writeText(generatedPassword);
        setCopied(true);
        toast.success('Contraseña copiada', 'La contraseña ha sido copiada al portapapeles.');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Error al copiar', 'No se pudo copiar la contraseña.');
      }
    }
  }, [generatedPassword, toast]);

  const handleClosePasswordDialog = useCallback(() => {
    setIsPasswordDialogOpen(false);
    setGeneratedPassword(null);
    setUserForPassword(null);
    setCopied(false);
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === users.length
        ? new Set()
        : new Set(users.map((u) => u._id)),
    );
  }, [users]);

  const toggleSelectUser = useCallback((userId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const selectionState: 'none' | 'partial' | 'all' = useMemo(() => {
    if (selectedIds.size === 0) return 'none';
    if (selectedIds.size === users.length && users.length > 0) return 'all';
    return 'partial';
  }, [selectedIds.size, users.length]);

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

  const selectedUsersStatus = useMemo(() => {
    const selected = users.filter((u) => selectedIds.has(u._id));
    return {
      hasActive: selected.some((u) => u.isActive),
      hasInactive: selected.some((u) => !u.isActive),
    };
  }, [selectedIds, users]);

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
          ? `¿Estás seguro de que deseas eliminar ${count} usuario${count > 1 ? 's' : ''}? Esta acción no se puede deshacer.`
          : `¿Estás seguro de que deseas ${actionName} ${count} usuario${count > 1 ? 's' : ''}?`;

      if (!window.confirm(confirmMessage)) return;

      let success = 0;
      let fail = 0;
      const promises = Array.from(selectedIds).map(async (id) => {
        try {
          if (action === 'activate') {
            const user = users.find((u) => u._id === id);
            if (user && !user.isActive) {
              await toggleStatusMutation.mutateAsync(id);
            }
          } else if (action === 'deactivate') {
            const user = users.find((u) => u._id === id);
            if (user && user.isActive) {
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
          `${success} usuario${success > 1 ? 's' : ''} ${action === 'delete' ? 'eliminado' : action === 'activate' ? 'activado' : 'desactivado'}${success > 1 ? 's' : ''} correctamente.`,
        );
      }
      if (fail > 0) {
        toast.error(
          'Error en la operación',
          `No se pudieron ${actionName} ${fail} usuario${fail > 1 ? 's' : ''}.`,
        );
      }
    },
    [selectedIds, users, toggleStatusMutation, deleteMutation, toast],
  );

  const isActionLoading =
    deleteMutation.isPending || toggleStatusMutation.isPending;

  const handleExport = useCallback(() => {
    const exportData = users.map((user) => ({
      Nombre: user.name,
      Email: user.email,
      Estado: user.isActive ? 'Activo' : 'Inactivo',
      'Contraseña Temporal': user.isTemporaryPassword ? 'Sí' : 'No',
      'Fecha de Creación': formatDate(user.createdAt),
      'Fecha de Actualización': formatDate(user.updatedAt),
    }));
    exportToCSV(exportData, 'usuarios-administradores', {
      Nombre: 'Nombre',
      Email: 'Email',
      Estado: 'Estado',
      'Contraseña Temporal': 'Contraseña Temporal',
      'Fecha de Creación': 'Fecha de Creación',
      'Fecha de Actualización': 'Fecha de Actualización',
    });
    toast.success('Exportación completada', 'Los datos se han exportado correctamente.');
  }, [users, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreate();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="text"][placeholder*="buscar" i]',
        ) as HTMLInputElement;
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
              Usuarios Administradores
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Gestiona los usuarios administradores del sistema
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
            <Tooltip content="Nuevo usuario (Ctrl+N)">
              <Button
                onClick={handleCreate}
                className="gap-1.5 sm:gap-2 w-full sm:w-auto flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Crear nuevo usuario"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate">
                  Nuevo Usuario
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
              placeholder="Buscar usuarios..."
              suggestions={searchSuggestions}
              isLoading={isLoading}
            />
          </div>
        </div>

        <Card className="relative w-full overflow-hidden">
          <UserFilters
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
            <div className="px-3 sm:px-4 md:px-6">
              <BulkActions
                selectedCount={selectedIds.size}
                hasActive={selectedUsersStatus.hasActive}
                hasInactive={selectedUsersStatus.hasInactive}
                onActivate={() => handleBulkAction('activate')}
                onDeactivate={() => handleBulkAction('deactivate')}
                onDelete={() => handleBulkAction('delete')}
                isLoading={isActionLoading && selectedIds.size > 0}
              />
            </div>

            {isLoading ? (
              <div className="px-3 sm:px-4 md:px-6">
                <UserTableSkeleton />
              </div>
            ) : users.length === 0 ? (
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <UserIcon className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    No se encontraron usuarios
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                    {search
                      ? 'No hay usuarios que coincidan con tu búsqueda'
                      : 'Comienza creando tu primer usuario administrador.'}
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
                      Crear Usuario
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full px-3 sm:px-4 md:px-6">
                <UserTable
                  users={users}
                  selectedIds={selectedIds}
                  sort={sort}
                  onSort={handleSort}
                  onToggleSelectAll={toggleSelectAll}
                  onToggleSelect={toggleSelectUser}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  onStatusChange={handleToggleStatus}
                  onGeneratePassword={handleGeneratePassword}
                  getStatusBadge={getStatusBadge}
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

        <UserFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          user={editingUser}
          onSuccess={() => {
            // El modal se cierra desde el componente hijo cuando el usuario hace clic en "Cerrar"
            // Solo cerramos si no hay contraseña generada (caso de edición)
            setIsFormOpen(false);
          }}
        />

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="break-words">{selectedUser?.name}</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Información detallada del usuario
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Email
                    </p>
                    <p className="text-xs sm:text-sm break-words">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Rol
                    </p>
                    <Badge
                      variant={
                        selectedUser.role === UserRole.ADMIN
                          ? 'default'
                          : selectedUser.role === UserRole.COORDINADOR
                            ? 'secondary'
                            : 'outline'
                      }
                      className="text-xs"
                    >
                      {getRoleLabel(selectedUser.role)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Estado
                    </p>
                    {getStatusBadge(selectedUser.isActive)}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Contraseña Temporal
                    </p>
                    <p className="text-xs sm:text-sm break-words">
                      {selectedUser.isTemporaryPassword ? 'Sí' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Creado
                    </p>
                    <p className="text-xs sm:text-sm break-words">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Actualizado
                    </p>
                    <p className="text-xs sm:text-sm break-words">
                      {formatDate(selectedUser.updatedAt)}
                    </p>
                  </div>
                </div>
                {selectedUser.role === UserRole.COORDINADOR && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                      Carrera asociada
                    </p>
                    {selectedUser.career ? (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                            {selectedUser.career.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {selectedUser.career.code}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 italic">
                        Sin carrera asignada
                      </p>
                    )}
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
            setUserToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Eliminar Usuario"
          message={
            userToDelete
              ? formatMessageWithHighlight(
                  userToDelete.name,
                  '¿Estás seguro de eliminar el usuario ',
                )
              : ''
          }
          confirmText="Eliminar"
          variant="destructive"
          loading={deleteMutation.isPending}
        />

        <Dialog open={isPasswordDialogOpen} onOpenChange={handleClosePasswordDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Key className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="break-words">
                  Contraseña generada para {userForPassword?.name}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Copia esta contraseña para enviarla al usuario por correo
              </DialogDescription>
            </DialogHeader>
            {generatedPassword && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-1">
                        Contraseña temporal generada
                      </p>
                      <p className="text-xs text-primary-700 dark:text-primary-300 mb-2">
                        Esta contraseña debe ser cambiada en el primer inicio de sesión
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-700 rounded text-sm font-mono text-slate-900 dark:text-slate-100">
                          {generatedPassword}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCopyPassword}
                          className="shrink-0"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleClosePasswordDialog}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
