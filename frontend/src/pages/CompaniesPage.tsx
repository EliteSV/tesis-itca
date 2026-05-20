import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Building2,
  Search,
  Eye,
  Pencil,
  Trash2,
  Power,
  Mail,
  User as UserIcon,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import {
  useCompanies,
  useDeleteCompany,
  useToggleCompanyStatus,
  useCompanyUsers,
  useDeleteCompanyUser,
} from '@/hooks/useCompanies';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth.types';
import { useDebounce } from '@/hooks/useDebounce';
import { useToastContext } from '@/contexts/ToastContext';
import { getStatusLabel, getStatusVariant } from '@/utils/company.utils';
import { formatDate } from '@/utils/date.utils';
import { exportToCSV } from '@/utils/export.utils';
import type { Company } from '@/types/company.types';
import { CompanyStatusValues } from '@/types/company.types';
import type { User } from '@/types/auth.types';
import { CompanyFormDialog } from '@/components/companies/CompanyFormDialog';
import { InvitationDialog } from '@/components/companies/InvitationDialog';
import { CompanyUserFormDialog } from '@/components/companies/CompanyUserFormDialog';
import { ConfirmDialog } from '@/pages/companies/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TableActionsCell,
  TableActionsDropdownMobile,
} from '@/components/ui/table-components';
import { Pagination } from '@/pages/career-categories/Pagination';

function CompanyDetailsContent({
  company,
  onUserAdded,
  onUserEdit,
  onUserDelete,
}: {
  company: Company;
  onUserAdded?: () => void;
  onUserEdit?: (user: User & { _id?: string; isActive?: boolean }) => void;
  onUserDelete?: (user: User & { _id?: string; isActive?: boolean }) => void;
}) {
  const { data: users, isLoading: isLoadingUsers } = useCompanyUsers(
    company._id,
  );

  return (
    <div className="grid gap-4 py-4">
      {company.logo && (
        <div className="flex justify-center">
          <img
            src={company.logo}
            alt={`Logo de ${company.name}`}
            className="h-32 w-32 object-contain border border-slate-200 dark:border-slate-700 rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            NIT
          </p>
          <p className="text-sm">{company.nit}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Estado
          </p>
          <Badge variant={getStatusVariant(company.status)}>
            {getStatusLabel(company.status)}
          </Badge>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Email
          </p>
          <p className="text-sm wrap-break-word">{company.email || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Teléfono
          </p>
          <p className="text-sm">{company.phone || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Sector
          </p>
          <p className="text-sm">{company.sector || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Activo
          </p>
          <Badge variant={company.isActive ? 'default' : 'secondary'}>
            {company.isActive ? 'Sí' : 'No'}
          </Badge>
        </div>
      </div>
      {company.address && (
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Dirección
          </p>
          <p className="text-sm">{company.address}</p>
        </div>
      )}
      {company.description && (
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Descripción
          </p>
          <p className="text-sm">{company.description}</p>
        </div>
      )}

      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Usuarios Asociados
            </p>
          </div>
          <Button
            size="sm"
            onClick={onUserAdded}
            className="gap-1.5 h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </Button>
        </div>
        {isLoadingUsers ? (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Cargando usuarios...
          </div>
        ) : users && users.length > 0 ? (
          <div className="space-y-3">
            {users.map((user) => {
              const userWithId = user as User & { _id?: string; isActive?: boolean };
              const userId = userWithId._id || user.id;
              const isActive = userWithId.isActive ?? true;
              return (
                <div
                  key={userId}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={isActive ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUserEdit?.(userWithId)}
                      className="h-8 w-8 p-0"
                      title="Editar usuario"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUserDelete?.(userWithId)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            No hay usuarios asociados a esta empresa
          </div>
        )}
      </div>
    </div>
  );
}

export function CompaniesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const toast = useToastContext();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const debouncedSearch = useDebounce(search, 300);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isInvitationDialogOpen, setIsInvitationDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<
    (User & { _id?: string; isActive?: boolean }) | null
  >(null);
  const [userToDelete, setUserToDelete] = useState<
    (User & { _id?: string; isActive?: boolean }) | null
  >(null);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);

  const limit = 10;
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: status !== 'all' ? status : undefined,
    }),
    [page, limit, debouncedSearch, status],
  );

  const { data, isLoading } = useCompanies(queryParams);

  const deleteMutation = useDeleteCompany();
  const toggleStatusMutation = useToggleCompanyStatus();
  const deleteUserMutation = useDeleteCompanyUser();

  const handleCreate = useCallback(() => {
    setEditingCompany(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((company: Company) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((company: Company) => {
    setSelectedCompany(company);
    setIsViewDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (companyToDelete) {
      try {
        await deleteMutation.mutateAsync(companyToDelete._id);
        setIsDeleteDialogOpen(false);
        setCompanyToDelete(null);
      } catch (error) {
        console.error('Error al eliminar empresa:', error);
      }
    }
  }, [companyToDelete, deleteMutation]);

  const handleToggleStatus = useCallback(
    async (company: Company) => {
      try {
        await toggleStatusMutation.mutateAsync(company._id);
      } catch (error) {
        console.error('Error al cambiar estado:', error);
      }
    },
    [toggleStatusMutation],
  );


  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

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

  const handleExport = useCallback(() => {
    if (!data?.data) return;
    const exportData = data.data.map((company: Company) => ({
      Nombre: company.name,
      NIT: company.nit,
      Email: company.email || '',
      Teléfono: company.phone || '',
      Sector: company.sector || '',
      Dirección: company.address || '',
      Estado: getStatusLabel(company.status),
      'Estado Activo': company.isActive ? 'Sí' : 'No',
      'Fecha de Creación': formatDate(company.createdAt),
      'Fecha de Actualización': formatDate(company.updatedAt),
    }));
    exportToCSV(exportData, 'empresas', {
      Nombre: 'Nombre',
      NIT: 'NIT',
      Email: 'Email',
      Teléfono: 'Teléfono',
      Sector: 'Sector',
      Dirección: 'Dirección',
      Estado: 'Estado',
      'Estado Activo': 'Estado Activo',
      'Fecha de Creación': 'Fecha de Creación',
      'Fecha de Actualización': 'Fecha de Actualización',
    });
    toast.success(
      'Exportación completada',
      'Los datos se han exportado correctamente.',
    );
  }, [data, toast]);

  const handleAddUser = useCallback(() => {
    setEditingUser(null);
    setIsUserFormOpen(true);
  }, []);

  const handleEditUser = useCallback(
    (user: User & { _id?: string; isActive?: boolean }) => {
      setEditingUser(user);
      setIsUserFormOpen(true);
    },
    [],
  );

  const handleDeleteUserClick = useCallback(
    (user: User & { _id?: string; isActive?: boolean }) => {
      setUserToDelete(user);
      setIsDeleteUserDialogOpen(true);
    },
    [],
  );

  const handleDeleteUserConfirm = useCallback(async () => {
    if (userToDelete && selectedCompany) {
      try {
        const userId =
          (userToDelete as { _id?: string })._id || userToDelete.id;
        await deleteUserMutation.mutateAsync({
          companyId: selectedCompany._id,
          userId,
        });
        setIsDeleteUserDialogOpen(false);
        setUserToDelete(null);
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  }, [userToDelete, selectedCompany, deleteUserMutation]);

  const handleUserFormSuccess = useCallback(() => {
    setEditingUser(null);
  }, []);

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Empresas
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Gestiona las empresas registradas en el sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
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
            )}
            <Button
              variant="outline"
              onClick={() => setIsInvitationDialogOpen(true)}
              className="gap-1.5 sm:gap-2 text-xs sm:text-sm"
              size="sm"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Generar Invitación</span>
              <span className="sm:hidden">Invitación</span>
            </Button>
            <Button onClick={handleCreate} className="gap-1.5 sm:gap-2 text-xs sm:text-sm" size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Empresa</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, NIT o email..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10 h-10"
            />
          </div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-10">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value={CompanyStatusValues.ACTIVE}>
                Activa
              </SelectItem>
              <SelectItem value={CompanyStatusValues.INACTIVE}>
                Inactiva
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isAdmin ? (
        <Card className="relative w-full overflow-hidden">
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
                      <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[80px]">
                        Logo
                      </th>
                      <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[200px]">
                        Nombre
                      </th>
                      <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[120px]">
                        NIT
                      </th>
                      <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[180px]">
                        Email
                      </th>
                      <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[120px]">
                        Teléfono
                      </th>
                      <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                        Estado
                      </th>
                      <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                        Activo
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
                            colSpan={8}
                            className="h-12 animate-pulse bg-slate-100 dark:bg-slate-800"
                          />
                        </tr>
                      ))
                    ) : data?.data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-8 text-slate-500 dark:text-slate-400"
                        >
                          No se encontraron empresas
                        </td>
                      </tr>
                    ) : (
                      data?.data.map((company, index) => {
                        return (
                          <tr
                            key={company._id}
                            className="group transition-all duration-200 animate-in fade-in slide-in-from-left-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                            style={{ animationDelay: `${index * 30}ms` }}
                          >
                            <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[80px]">
                              {company.logo ? (
                                <div className="relative h-10 w-10">
                                  <img
                                    src={company.logo}
                                    alt={`Logo de ${company.name}`}
                                    className="h-10 w-10 object-contain border border-slate-200 dark:border-slate-700 rounded"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const fallback = target.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                  <div className="h-10 w-10 absolute inset-0 items-center justify-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800" style={{ display: 'none' }}>
                                    <Building2 className="h-5 w-5 text-slate-400" />
                                  </div>
                                </div>
                              ) : (
                                <div className="h-10 w-10 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800">
                                  <Building2 className="h-5 w-5 text-slate-400" />
                                </div>
                              )}
                            </td>
                            <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 font-medium min-w-[200px]">
                              <span className="break-words text-xs sm:text-sm">{company.name}</span>
                            </td>
                            <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[120px]">
                              <span className="text-xs sm:text-sm font-mono">{company.nit}</span>
                            </td>
                            <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[180px]">
                              <span className="text-xs sm:text-sm break-words">{company.email || '-'}</span>
                            </td>
                            <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[120px]">
                              <span className="text-xs sm:text-sm">{company.phone || '-'}</span>
                            </td>
                            <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[100px]">
                              <Badge variant={getStatusVariant(company.status)} className="text-xs">
                                {getStatusLabel(company.status)}
                              </Badge>
                            </td>
                            <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[100px]">
                              <Badge variant={company.isActive ? 'default' : 'secondary'} className="text-xs">
                                {company.isActive ? 'Sí' : 'No'}
                              </Badge>
                            </td>
                            <TableActionsCell
                              itemId={company._id}
                              actions={{
                                onView: () => handleView(company),
                                onEdit: () => handleEdit(company),
                                onToggleStatus: () => handleToggleStatus(company),
                                onDelete: () => handleDeleteClick(company),
                              }}
                              statusConfig={{
                                isActive: company.isActive,
                              }}
                              itemName={company.name}
                            />
                          </tr>
                        );
                      })
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
              ) : data?.data.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No se encontraron empresas
                </div>
              ) : (
                data?.data.map((company, index) => {
                  return (
                    <div
                      key={company._id}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-200 animate-in fade-in slide-in-from-left-4"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {company.logo ? (
                            <div className="relative h-12 w-12 shrink-0">
                              <img
                                src={company.logo}
                                alt={`Logo de ${company.name}`}
                                className="h-12 w-12 object-contain border border-slate-200 dark:border-slate-700 rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="h-12 w-12 absolute inset-0 items-center justify-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800" style={{ display: 'none' }}>
                                <Building2 className="h-6 w-6 text-slate-400" />
                              </div>
                            </div>
                          ) : (
                            <div className="h-12 w-12 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 shrink-0">
                              <Building2 className="h-6 w-6 text-slate-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mb-1">
                              {company.name}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                              NIT: {company.nit}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={getStatusVariant(company.status)} className="text-xs">
                            {getStatusLabel(company.status)}
                          </Badge>
                          <TableActionsDropdownMobile
                            itemId={company._id}
                            actions={{
                              onView: () => handleView(company),
                              onEdit: () => handleEdit(company),
                              onToggleStatus: () => handleToggleStatus(company),
                              onDelete: () => handleDeleteClick(company),
                            }}
                            statusConfig={{
                              isActive: company.isActive,
                            }}
                            itemName={company.name}
                          />
                        </div>
                      </div>
                      <div className="space-y-2 pl-16">
                        {company.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{company.email}</span>
                          </div>
                        )}
                        {company.phone && (
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Tel: {company.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={company.isActive ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {company.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })
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
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>NIT</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell
                        colSpan={8}
                        className="h-12 animate-pulse bg-slate-100 dark:bg-slate-800"
                      />
                    </TableRow>
                  ))
                ) : data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-slate-500 dark:text-slate-400"
                    >
                      No se encontraron empresas
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((company) => {
                    return (
                      <TableRow key={company._id}>
                        <TableCell>
                          {company.logo ? (
                            <div className="relative h-10 w-10">
                            <img
                              src={company.logo}
                              alt={`Logo de ${company.name}`}
                              className="h-10 w-10 object-contain border border-slate-200 dark:border-slate-700 rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="h-10 w-10 absolute inset-0 items-center justify-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800" style={{ display: 'none' }}>
                              <Building2 className="h-5 w-5 text-slate-400" />
                            </div>
                            </div>
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800">
                              <Building2 className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.nit}</TableCell>
                        <TableCell>{company.email || '-'}</TableCell>
                        <TableCell>{company.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(company.status)}>
                            {getStatusLabel(company.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={company.isActive ? 'default' : 'secondary'}>
                            {company.isActive ? 'Sí' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(company)}
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(company)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(company)}
                              title={company.isActive ? 'Desactivar' : 'Activar'}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(company)}
                              className="text-destructive hover:text-destructive"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
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
            ) : data?.data.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No se encontraron empresas
              </div>
            ) : (
              data?.data.map((company, index) => {
                return (
                  <div
                    key={company._id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all duration-200 animate-in fade-in slide-in-from-left-4"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {company.logo ? (
                          <div className="relative h-12 w-12 shrink-0">
                            <img
                              src={company.logo}
                              alt={`Logo de ${company.name}`}
                              className="h-12 w-12 object-contain border border-slate-200 dark:border-slate-700 rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="h-12 w-12 absolute inset-0 items-center justify-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800" style={{ display: 'none' }}>
                              <Building2 className="h-6 w-6 text-slate-400" />
                            </div>
                          </div>
                        ) : (
                          <div className="h-12 w-12 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 shrink-0">
                            <Building2 className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mb-1">
                            {company.name}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                            NIT: {company.nit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={getStatusVariant(company.status)} className="text-xs">
                          {getStatusLabel(company.status)}
                        </Badge>
                        <TableActionsDropdownMobile
                          itemId={company._id}
                          actions={{
                            onView: () => handleView(company),
                            onEdit: () => handleEdit(company),
                            onToggleStatus: () => handleToggleStatus(company),
                            onDelete: () => handleDeleteClick(company),
                          }}
                          statusConfig={{
                            isActive: company.isActive,
                          }}
                          itemName={company.name}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 pl-16">
                      {company.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{company.email}</span>
                        </div>
                      )}
                      {company.phone && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Tel: {company.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={company.isActive ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {company.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {data && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 sm:px-6 py-3 sm:py-4">
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left">
                {(() => {
                  const paginationInfo = {
                    showingFrom: ((page - 1) * limit) + 1,
                    showingTo: Math.min(page * limit, data.total),
                    total: data.total,
                  };
                  return (
                    <>
                      Mostrando <span className="font-medium text-slate-900 dark:text-slate-100">{paginationInfo.showingFrom}</span> a{' '}
                      <span className="font-medium text-slate-900 dark:text-slate-100">{paginationInfo.showingTo}</span> de{' '}
                      <span className="font-medium text-slate-900 dark:text-slate-100">{paginationInfo.total}</span> empresas
                      {data.totalPages > 1 && (
                        <> (Página {page} de {data.totalPages})</>
                      )}
                    </>
                  );
                })()}
              </div>
              {data.totalPages > 1 && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || isLoading}
                    className="flex-1 sm:flex-initial min-w-0 sm:min-w-[100px]"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= data.totalPages || isLoading}
                    className="flex-1 sm:flex-initial min-w-0 sm:min-w-[100px]"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <CompanyFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        company={editingCompany}
        onSuccess={() => setIsFormOpen(false)}
      />

      <InvitationDialog
        open={isInvitationDialogOpen}
        onOpenChange={setIsInvitationDialogOpen}
      />

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Building2 className="h-5 w-5" />
              <span className="truncate">{selectedCompany?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-sm">
              Información detallada de la empresa
            </DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <CompanyDetailsContent
              company={selectedCompany}
              onUserAdded={handleAddUser}
              onUserEdit={handleEditUser}
              onUserDelete={handleDeleteUserClick}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCompanyToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Empresa"
        message={
          companyToDelete ? (
            <>
              ¿Estás seguro de eliminar la empresa{' '}
              <span className="font-semibold">"{companyToDelete.name}"</span>?
              <br />
              <span className="text-sm text-slate-500 dark:text-slate-400 mt-2 block">
                Esta acción no se puede deshacer.
              </span>
            </>
          ) : (
            ''
          )
        }
        confirmText="Eliminar"
        variant="destructive"
        loading={deleteMutation.isPending}
      />

      {selectedCompany && (
        <>
          <CompanyUserFormDialog
            open={isUserFormOpen}
            onOpenChange={setIsUserFormOpen}
            companyId={selectedCompany._id}
            user={editingUser}
            onSuccess={handleUserFormSuccess}
          />

          <ConfirmDialog
            isOpen={isDeleteUserDialogOpen}
            onClose={() => {
              setIsDeleteUserDialogOpen(false);
              setUserToDelete(null);
            }}
            onConfirm={handleDeleteUserConfirm}
            title="Eliminar Usuario"
            message={
              userToDelete ? (
                <>
                  ¿Estás seguro de eliminar el usuario{' '}
                  <span className="font-semibold">"{userToDelete.name}"</span>?
                  <br />
                  <span className="text-sm text-slate-500 dark:text-slate-400 mt-2 block">
                    Esta acción no se puede deshacer.
                  </span>
                </>
              ) : (
                ''
              )
            }
            confirmText="Eliminar"
            variant="destructive"
            loading={deleteUserMutation.isPending}
          />
        </>
      )}
    </div>
  );
}


