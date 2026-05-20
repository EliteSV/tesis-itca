import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, GraduationCap, Download, FileText, Copy, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/utils/date.utils';
import { exportToCSV } from '@/utils/export.utils';
import { AutocompleteSearch } from '@/components/ui/autocomplete-search';
import {
  useStudents,
  useDeleteStudent,
  useToggleStudentStatus,
  useGenerateTemporaryPassword,
} from '@/hooks/useStudents';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth.types';
import { useDebounce } from '@/hooks/useDebounce';
import { useToastContext } from '@/contexts/ToastContext';
import { Tooltip } from '@/components/ui/tooltip';
import type { Student } from '@/types/student.types';
import { StudentStatus } from '@/types/student.types';
import type {
  SortConfig,
  SortField,
  Filters,
} from '@/pages/students/Students.types';
import { StudentFormDialog } from '@/components/students/StudentFormDialog';
import { StudentFilters } from '@/pages/students/StudentFilters';
import { StudentTable } from '@/pages/students/StudentTable';
import { StudentTableSkeleton } from '@/pages/students/StudentTableSkeleton';
import { BulkActions } from '@/pages/career-categories/BulkActions';
import { Pagination } from '@/pages/career-categories/Pagination';
import { ConfirmDialog } from '@/pages/career-categories/ConfirmDialog';
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

export function StudentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCompanyUser = user?.role === UserRole.COMPANY;
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
      field: sortBy || 'createdAt',
      order: sortOrder || 'desc',
    };
  };

  const getInitialFilters = (): Filters => {
    const careerIdParam = searchParams.get('careerId');
    const statusParam = searchParams.get('status');
    const practiceStatusParam = searchParams.get('practiceStatus');
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');
    return {
      careerId: careerIdParam || '',
      status: statusParam || '',
      practiceStatus: practiceStatusParam || '',
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
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudent] = useState<Student | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'delete' | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const limit = 10;
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      careerId: filters.careerId || undefined,
      status: filters.status || undefined,
      practiceStatus: filters.practiceStatus || undefined,
      sortBy: sort.field,
      sortOrder: sort.order,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    }),
    [
      page,
      limit,
      debouncedSearch,
      filters.careerId,
      filters.status,
      filters.practiceStatus,
      filters.dateFrom,
      filters.dateTo,
      sort.field,
      sort.order,
    ],
  );

  const studentsQueryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
    }),
    [page, limit, debouncedSearch],
  );

  const { data, isLoading } = useStudents(
    isCompanyUser ? studentsQueryParams : queryParams,
  );

  const deleteMutation = useDeleteStudent();
  const toggleStatusMutation = useToggleStudentStatus();
  const generatePasswordMutation = useGenerateTemporaryPassword();
  const toast = useToastContext();
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [passwordStudent, setPasswordStudent] = useState<Student | null>(null);
  const [copied, setCopied] = useState(false);

  const students = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data
    ? {
        total: data.total,
        pages: data.totalPages,
        page: data.page,
      }
    : { total: 0, pages: 1, page: 1 };

  const searchSuggestions = useMemo(
    () =>
      students.map(
        (student) => `${student.firstName} ${student.lastName} ${student.email}`,
      ),
    [students],
  );

  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 1) {
      params.set('page', page.toString());
    }

    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    }

    if (sort.field !== 'createdAt' || sort.order !== 'desc') {
      params.set('sortBy', sort.field);
      params.set('sortOrder', sort.order);
    }

    if (filters.careerId) {
      params.set('careerId', filters.careerId);
    }

    if (filters.status) {
      params.set('status', filters.status);
    }

    if (filters.practiceStatus) {
      params.set('practiceStatus', filters.practiceStatus);
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
    filters.careerId,
    filters.status,
    filters.practiceStatus,
    filters.dateFrom,
    filters.dateTo,
    setSearchParams,
    searchParams,
  ]);

  useEffect(() => {
    const initialSearch = searchParams.get('search') || '';
    if (debouncedSearch !== initialSearch) {
      setPage(1);
    }
  }, [debouncedSearch, searchParams]);

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
    setFilters({
      careerId: '',
      status: '',
      practiceStatus: '',
      dateFrom: undefined,
      dateTo: undefined,
    });
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      filters.careerId !== '' ||
      filters.status !== '' ||
      filters.practiceStatus !== '' ||
      filters.dateFrom !== undefined ||
      filters.dateTo !== undefined,
    [filters],
  );

  const handleCreate = useCallback(() => {
    setEditingStudent(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((student: Student) => {
    if (isCompanyUser) {
      // For companies, navigate to detail page using userId
      const studentId = student.userId || student._id;
      navigate(`/estudiantes/${studentId}`);
    } else {
      // For admins, navigate to admin detail page
      navigate(`/estudiantes/${student._id}/admin`);
    }
  }, [isCompanyUser, navigate]);

  const handleDelete = useCallback((student: Student) => {
    setStudentToDelete(student);
    setConfirmType('delete');
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!studentToDelete) return;
    try {
      await deleteMutation.mutateAsync(studentToDelete._id);
      toast.success(
        'Estudiante eliminado',
        `El estudiante "${studentToDelete.firstName} ${studentToDelete.lastName}" ha sido eliminado correctamente.`,
      );
      setConfirmType(null);
      setStudentToDelete(null);
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al eliminar el estudiante';
      toast.error('Error al eliminar', errorMessage);
    }
  }, [studentToDelete, deleteMutation, toast]);

  const handleToggleStatus = useCallback(
    async (student: Student) => {
      try {
        await toggleStatusMutation.mutateAsync(student._id);
        const newStatus = !student.isActive;
        toast.success(
          'Estado actualizado',
          `El estudiante "${student.firstName} ${student.lastName}" ha sido ${
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
    async (student: Student) => {
      try {
        const response = (await generatePasswordMutation.mutateAsync(
          student._id,
        )) as { generatedPassword: string };
        setGeneratedPassword(response.generatedPassword);
        setPasswordStudent(student);
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

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === students.length
        ? new Set()
        : new Set(students.map((s) => s._id)),
    );
  }, [students]);

  const toggleSelectStudent = useCallback((studentId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  }, []);

  const selectionState: 'none' | 'partial' | 'all' = useMemo(() => {
    if (selectedIds.size === 0) return 'none';
    if (selectedIds.size === students.length && students.length > 0)
      return 'all';
    return 'partial';
  }, [selectedIds.size, students.length]);

  const getStatusBadge = useCallback(
    (status: string, isActive: boolean) => {
      const statusColors: Record<string, string> = {
        [StudentStatus.PERFIL_INCOMPLETO]:
          'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        [StudentStatus.ACTIVO]:
          'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        [StudentStatus.INACTIVO]:
          'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        [StudentStatus.GRADUADO]:
          'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      };

      const statusColor = statusColors[status] || statusColors[StudentStatus.INACTIVO];

      return (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium rounded-lg border transition-all duration-200 ${statusColor}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span className="hidden sm:inline">{status}</span>
            <span className="sm:hidden">{status.split(' ')[0]}</span>
          </span>
          {!isActive && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              Inactivo
            </span>
          )}
        </div>
      );
    },
    [],
  );

  const selectedStudentsStatus = useMemo(() => {
    const selected = students.filter((s) => selectedIds.has(s._id));
    return {
      hasActive: selected.some((s) => s.isActive),
      hasInactive: selected.some((s) => !s.isActive),
    };
  }, [selectedIds, students]);

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
          ? `¿Estás seguro de que deseas eliminar ${count} estudiante${count > 1 ? 's' : ''}? Esta acción no se puede deshacer.`
          : `¿Estás seguro de que deseas ${actionName} ${count} estudiante${count > 1 ? 's' : ''}?`;

      if (!window.confirm(confirmMessage)) return;

      let success = 0;
      let fail = 0;
      const promises = Array.from(selectedIds).map(async (id) => {
        try {
          if (action === 'activate') {
            const student = students.find((s) => s._id === id);
            if (student && !student.isActive) {
              await toggleStatusMutation.mutateAsync(id);
            }
          } else if (action === 'deactivate') {
            const student = students.find((s) => s._id === id);
            if (student && student.isActive) {
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
          `${success} estudiante${success > 1 ? 's' : ''} ${action === 'delete' ? 'eliminado' : action === 'activate' ? 'activado' : 'desactivado'}${success > 1 ? 's' : ''} correctamente.`,
        );
      }
      if (fail > 0) {
        toast.error(
          'Error en la operación',
          `No se pudieron ${actionName} ${fail} estudiante${fail > 1 ? 's' : ''}.`,
        );
      }
    },
    [selectedIds, students, toggleStatusMutation, deleteMutation, toast],
  );

  const isActionLoading =
    deleteMutation.isPending || toggleStatusMutation.isPending;

  const handleExport = useCallback(() => {
    const exportData = students.map((student) => ({
      Nombre: `${student.firstName} ${student.lastName}`,
      Email: student.email,
      'Número de Identificación': student.identificationNumber,
      Teléfono: student.phone || '',
      Dirección: student.address || '',
      Carrera: student.career?.name || '',
      Estado: student.status,
      'Estado Activo': student.isActive ? 'Sí' : 'No',
      'Fecha de Creación': formatDate(student.createdAt),
      'Fecha de Actualización': formatDate(student.updatedAt),
    }));
    exportToCSV(exportData, 'estudiantes', {
      Nombre: 'Nombre',
      Email: 'Email',
      'Número de Identificación': 'Número de Identificación',
      Teléfono: 'Teléfono',
      Dirección: 'Dirección',
      Carrera: 'Carrera',
      Estado: 'Estado',
      'Estado Activo': 'Estado Activo',
      'Fecha de Creación': 'Fecha de Creación',
      'Fecha de Actualización': 'Fecha de Actualización',
    });
    toast.success('Exportación completada', 'Los datos se han exportado correctamente.');
  }, [students, toast]);

  const handleExportPDF = useCallback(async () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Cargar logo ITCA
    const logoUrl = '/assets/logo-itca-white.png';
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Encabezado rojo ITCA (#B1291D)
        doc.setFillColor(177, 41, 29);
        doc.rect(0, 0, pageWidth, 64, 'F');

        // Logo: mantener proporción 592×65, altura 32pt → ancho ≈ 291pt
        const logoH = 32;
        const logoW = (592 / 65) * logoH;
        doc.addImage(img, 'PNG', pageWidth - logoW - 32, 12, logoW, logoH);

        resolve();
      };
      img.onerror = () => resolve(); // si falla, continuar sin logo
      img.src = logoUrl;
    });

    // Si el logo no cargó, igual dibujar el encabezado
    if (!doc.getNumberOfPages()) {
      doc.setFillColor(177, 41, 29);
      doc.rect(0, 0, pageWidth, 64, 'F');
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Lista de Estudiantes', 32, 30);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generado: ${new Date().toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      32,
      46,
    );
    doc.text(
      `Total: ${students.length} estudiante${students.length !== 1 ? 's' : ''}`,
      32,
      58,
    );

    const practiceLabel = (status: string | null | undefined) => {
      if (!status) return 'Sin práctica';
      return status === 'en_curso' ? 'En Curso' : 'Finalizada';
    };

    const rows = students.map((s) => [
      `${s.firstName} ${s.lastName}`,
      s.email,
      s.identificationNumber,
      s.career?.name || '-',
      s.status,
      practiceLabel(s.practiceStatus),
      formatDate(s.createdAt),
    ]);

    autoTable(doc, {
      startY: 76,
      head: [['Nombre Completo', 'Email', 'Identificación', 'Carrera', 'Estado', 'Práctica', 'Creado']],
      body: rows,
      styles: {
        fontSize: 8,
        cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
        overflow: 'linebreak',
        textColor: [30, 41, 59],
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [71, 85, 105],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 140 },
        2: { cellWidth: 90 },
        3: { cellWidth: 100 },
        4: { cellWidth: 80 },
        5: { cellWidth: 70 },
        6: { cellWidth: 70 },
      },
      tableLineColor: [226, 232, 240],
      tableLineWidth: 0.5,
      margin: { left: 32, right: 32 },
    });

    doc.save('estudiantes.pdf');
    toast.success('PDF generado', 'La lista de estudiantes ha sido exportada en PDF.');
  }, [students, toast]);

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
              Estudiantes
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {isCompanyUser
                ? 'Estudiantes aceptados en tus oportunidades laborales'
                : 'Gestiona los estudiantes del sistema'}
            </p>
          </div>
          {!isCompanyUser && (
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
              <Tooltip content="Exportar a PDF">
                <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 sm:gap-2 transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-label="Exportar datos a PDF"
                >
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Exportar PDF</span>
                </Button>
              </Tooltip>
              <Tooltip content="Nuevo estudiante (Ctrl+N)">
                <Button
                  onClick={handleCreate}
                  className="gap-1.5 sm:gap-2 w-full sm:w-auto flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-label="Crear nuevo estudiante"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">
                    Nuevo Estudiante
                  </span>
                </Button>
              </Tooltip>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="max-w-md">
            <AutocompleteSearch
              value={search}
              onChange={setSearch}
              placeholder="Buscar estudiantes..."
              suggestions={searchSuggestions}
              isLoading={isLoading}
            />
          </div>
        </div>

        <Card className="relative w-full overflow-hidden">
          {!isCompanyUser && (
            <StudentFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters((p) => !p)}
              hasActiveFilters={hasActiveFilters}
            />
          )}

          <Pagination
            page={meta.page}
            totalPages={meta.pages}
            total={meta.total}
            limit={limit}
            onPageChange={setPage}
          />

          <div>
            {!isCompanyUser && (
              <div className="px-3 sm:px-4 md:px-6">
                <BulkActions
                  selectedCount={selectedIds.size}
                  hasActive={selectedStudentsStatus.hasActive}
                  hasInactive={selectedStudentsStatus.hasInactive}
                  onActivate={() => handleBulkAction('activate')}
                  onDeactivate={() => handleBulkAction('deactivate')}
                  onDelete={() => handleBulkAction('delete')}
                  isLoading={isActionLoading && selectedIds.size > 0}
                />
              </div>
            )}

            {isLoading ? (
              <div className="px-3 sm:px-4 md:px-6">
                <StudentTableSkeleton />
              </div>
            ) : students.length === 0 ? (
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    No se encontraron estudiantes
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                    {isCompanyUser
                      ? search
                        ? 'No hay estudiantes que coincidan con tu búsqueda'
                        : 'No hay estudiantes aceptados en tus oportunidades aún.'
                      : search
                        ? 'No hay estudiantes que coincidan con tu búsqueda'
                        : 'Comienza creando tu primer estudiante.'}
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
                    !isCompanyUser && (
                      <Button
                        size="sm"
                        onClick={handleCreate}
                        className="transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Estudiante
                      </Button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full px-3 sm:px-4 md:px-6">
                <StudentTable
                  students={students}
                  selectedIds={selectedIds}
                  sort={sort}
                  onSort={handleSort}
                  onToggleSelectAll={toggleSelectAll}
                  onToggleSelect={toggleSelectStudent}
                  onEdit={isCompanyUser ? undefined : handleEdit}
                  onDelete={isCompanyUser ? undefined : handleDelete}
                  onView={handleView}
                  onStatusChange={isCompanyUser ? undefined : handleToggleStatus}
                  onGeneratePassword={
                    isCompanyUser ? undefined : handleGeneratePassword
                  }
                  getStatusBadge={getStatusBadge}
                  selectionState={selectionState}
                  isReadOnly={isCompanyUser}
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

        <StudentFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          student={editingStudent}
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingStudent(null);
          }}
        />

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-3 sm:mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="break-words">
                  {selectedStudent?.firstName} {selectedStudent?.lastName}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Información detallada del estudiante
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Email
                    </p>
                    <p className="text-xs sm:text-sm break-words">
                      {selectedStudent.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Número de Identificación
                    </p>
                    <p className="text-xs sm:text-sm break-words">
                      {selectedStudent.identificationNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Carrera
                    </p>
                    <p className="text-xs sm:text-sm break-words">
                      {selectedStudent.career?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Estado
                    </p>
                    {getStatusBadge(selectedStudent.status, selectedStudent.isActive)}
                  </div>
                  {selectedStudent.phone && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                        Teléfono
                      </p>
                      <p className="text-xs sm:text-sm break-words">
                        {selectedStudent.phone}
                      </p>
                    </div>
                  )}
                  {selectedStudent.address && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                        Dirección
                      </p>
                      <p className="text-xs sm:text-sm break-words">
                        {selectedStudent.address}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Creado
                    </p>
                    <p className="text-xs sm:text-sm break-words">
                      {formatDate(selectedStudent.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          isOpen={confirmType === 'delete'}
          onClose={() => {
            setConfirmType(null);
            setStudentToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Eliminar Estudiante"
          message={
            studentToDelete
              ? formatMessageWithHighlight(
                  `${studentToDelete.firstName} ${studentToDelete.lastName}`,
                  '¿Estás seguro de eliminar el estudiante ',
                )
              : ''
          }
          confirmText="Eliminar"
          variant="destructive"
          loading={deleteMutation.isPending}
        />

        <Dialog
          open={!!generatedPassword}
          onOpenChange={(open) => {
            if (!open) {
              setGeneratedPassword(null);
              setPasswordStudent(null);
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Contraseña Temporal Generada
              </DialogTitle>
              <DialogDescription>
                Contraseña generada para{' '}
                {passwordStudent
                  ? `${passwordStudent.firstName} ${passwordStudent.lastName}`
                  : 'el estudiante'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg">
                <p className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
                  Contraseña generada
                </p>
                <p className="text-xs text-primary-700 dark:text-primary-300 mb-3">
                  Copia esta contraseña para enviarla al estudiante por correo. El
                  estudiante deberá cambiar esta contraseña al iniciar sesión.
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
                    className="flex-shrink-0"
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
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedPassword(null);
                  setPasswordStudent(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
