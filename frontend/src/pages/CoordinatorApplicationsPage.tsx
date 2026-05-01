import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Loader2,
  Mail,
  User,
  Briefcase,
  Search,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useCoordinatorApplications,
  useAcceptApplicationByCoordinator,
} from '@/hooks/useOpportunities';
import { useOpportunitiesForAdmin } from '@/hooks/useOpportunities';
import { useStudent } from '@/hooks/useStudents';
import { useToastContext } from '@/contexts/ToastContext';
import { formatDate } from '@/utils/date.utils';
import type { ApplicationWithOpportunity } from '@/types/opportunity.types';
import { ApplicationStatusValues } from '@/types/opportunity.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip } from '@/components/ui/tooltip';
import { StarRating } from '@/components/ui/star-rating';

export function CoordinatorApplicationsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [viewingApplication, setViewingApplication] =
    useState<ApplicationWithOpportunity | null>(null);
  const toast = useToastContext();

  const limit = 20;

  // Obtener todas las oportunidades de la carrera del coordinador para el filtro
  // El backend ya filtra por carrera del coordinador automáticamente
  const { data: opportunitiesData } = useOpportunitiesForAdmin({
    page: 1,
    limit: 1000,
  });

  const opportunityOptions = useMemo(() => {
    const opps = opportunitiesData?.data || [];
    return opps.map((opp) => ({
      value: opp._id,
      label: opp.title,
    }));
  }, [opportunitiesData?.data]);

  // Obtener solicitudes
  const { data, isLoading, isFetching } = useCoordinatorApplications({
    page,
    limit,
    opportunityId: selectedOpportunityId || undefined,
    search: debouncedSearch || undefined,
  });

  // Obtener información completa del estudiante cuando se ve el detalle
  const validStudentId = useMemo(() => {
    if (!viewingApplication?.studentId) return '';
    const id = String(viewingApplication.studentId).trim();
    if (id === '[object Object]' || id === '' || id.includes('object')) {
      return '';
    }
    return id;
  }, [viewingApplication?.studentId]);

  const { data: studentDetail, isLoading: isLoadingStudent } = useStudent(
    validStudentId,
  );

  const applications = useMemo(() => data?.data || [], [data?.data]);
  const totalPages = data?.totalPages || 0;

  const handleOpportunityChange = useCallback((value: string) => {
    setSelectedOpportunityId(value);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    },
    [],
  );

  const handleViewOpportunity = useCallback(
    (opportunityId: string) => {
      navigate(`/admin/opportunities/${opportunityId}`);
    },
    [navigate],
  );

  const handleViewDetail = useCallback(
    (application: ApplicationWithOpportunity) => {
      setViewingApplication(application);
    },
    [],
  );

  const acceptApplicationMutation = useAcceptApplicationByCoordinator();

  const handleAccept = useCallback(
    async (application: ApplicationWithOpportunity) => {
      try {
        await acceptApplicationMutation.mutateAsync(application._id);
        toast.success(
          'Solicitud aceptada',
          'La solicitud ha sido aceptada correctamente.',
        );
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || 'Error al aceptar la solicitud';
        toast.error('Error', errorMessage);
      }
    },
    [acceptApplicationMutation, toast],
  );

  const getApplicationStatusBadge = useCallback(
    (status: string) => {
      const statusColors: Record<string, string> = {
        [ApplicationStatusValues.PENDING]:
          'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        [ApplicationStatusValues.APPROVED]:
          'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        [ApplicationStatusValues.ACCEPTED]:
          'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        [ApplicationStatusValues.REJECTED]:
          'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      };

      const labels: Record<string, string> = {
        [ApplicationStatusValues.PENDING]: 'Pendiente',
        [ApplicationStatusValues.APPROVED]: 'Aprobada',
        [ApplicationStatusValues.ACCEPTED]: 'Aceptada',
        [ApplicationStatusValues.REJECTED]: 'Rechazada',
      };

      const statusColor =
        statusColors[status as keyof typeof statusColors] ||
        'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';

      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md border transition-all duration-200 ${statusColor}`}
        >
          {labels[status as keyof typeof labels] || status}
        </span>
      );
    },
    [],
  );

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                Solicitudes
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Visualiza las solicitudes de los estudiantes de tu carrera para
                oportunidades de prácticas profesionales.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <Label htmlFor="opportunity-filter" className="mb-2 block">
              Filtrar por oportunidad
            </Label>
            <SearchableSelect
              options={opportunityOptions}
              value={selectedOpportunityId}
              onValueChange={handleOpportunityChange}
              placeholder="Todas las oportunidades"
              searchPlaceholder="Buscar oportunidad..."
              emptyMessage="No se encontraron oportunidades"
            />
          </div>
          <div className="flex-1 max-w-md">
            <Label htmlFor="student-search" className="mb-2 block">
              Buscar por nombre de estudiante
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="student-search"
                placeholder="Buscar estudiante..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              No hay solicitudes
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {selectedOpportunityId || debouncedSearch
                ? 'No se encontraron solicitudes con los filtros aplicados.'
                : 'Aún no hay solicitudes de estudiantes de tu carrera.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block w-full overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
            <div className="min-w-full">
              <table className="w-full min-w-[800px] lg:min-w-[1000px] table-auto border-collapse bg-white dark:bg-slate-900">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300 bg-white dark:bg-slate-900">
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[150px] bg-white dark:bg-slate-900">
                      Estudiante
                    </th>
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[200px] bg-white dark:bg-slate-900">
                      Oportunidad
                    </th>
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[100px] bg-white dark:bg-slate-900">
                      Estado
                    </th>
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[140px] bg-white dark:bg-slate-900">
                      Match
                    </th>
                    <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell min-w-[120px] bg-white dark:bg-slate-900">
                      Fecha de Solicitud
                    </th>
                    <th className="text-right py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky right-0 bg-white dark:bg-slate-900 z-30 w-32 sm:w-40 md:w-48 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {applications.map((application, index) => (
                    <tr
                      key={application._id}
                      className="group transition-all duration-200 animate-in fade-in slide-in-from-left-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[150px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                            <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {application.student?.name || 'Estudiante'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {application.student?.email || ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[200px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                            <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-slate-400 shrink-0" />
                            <button
                              onClick={() =>
                                handleViewOpportunity(application.opportunityId)
                              }
                              className="text-xs sm:text-sm font-medium text-primary hover:underline truncate text-left"
                            >
                              {application.opportunity?.title || 'Oportunidad'}
                            </button>
                          </div>
                          {application.opportunity?.career && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                              {application.opportunity.career.name}
                            </p>
                          )}
                          {application.opportunity?.company && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {application.opportunity.company.name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[100px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                        {getApplicationStatusBadge(application.status)}
                      </td>
                      <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[140px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                        {application.matchScore !== undefined &&
                        application.matchScore !== null ? (
                          <StarRating rating={application.matchScore} />
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Evaluando...</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap hidden sm:table-cell min-w-[120px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(application.createdAt)}
                        </p>
                      </td>
                      <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-right sticky right-0 w-32 sm:w-40 md:w-48 transition-all duration-200 relative bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700 z-30">
                        <div className="flex items-center justify-end gap-2">
                          {application.status === ApplicationStatusValues.APPROVED && (
                            <Tooltip content="Aceptar solicitud" side="left">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleAccept(application)}
                                disabled={acceptApplicationMutation.isPending}
                                className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white"
                              >
                                {acceptApplicationMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                              </Button>
                            </Tooltip>
                          )}
                          <Tooltip content="Ver detalle de la solicitud" side="left">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetail(application)}
                              className="h-8 px-2"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {applications.map((application, index) => (
              <Card
                key={application._id}
                className={`transition-all duration-200 animate-in fade-in slide-in-from-left-4`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {application.student?.name || 'Estudiante'}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate mb-2">
                        {application.student?.email || ''}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-3 w-3 text-slate-400" />
                        <button
                          onClick={() =>
                            handleViewOpportunity(application.opportunityId)
                          }
                          className="text-xs text-primary hover:underline truncate text-left"
                        >
                          {application.opportunity?.title || 'Oportunidad'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        {getApplicationStatusBadge(application.status)}
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {formatDate(application.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2">
                        {application.matchScore !== undefined &&
                        application.matchScore !== null ? (
                          <StarRating rating={application.matchScore} size={14} />
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Evaluando...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {application.status === ApplicationStatusValues.APPROVED && (
                        <Tooltip content="Aceptar solicitud" side="left">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAccept(application)}
                            disabled={acceptApplicationMutation.isPending}
                            className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {acceptApplicationMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip content="Ver detalle de la solicitud" side="left">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(application)}
                          className="h-8 px-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                className="flex-1 sm:flex-initial bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              >
                Anterior
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-400 px-4">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
                className="flex-1 sm:flex-initial bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}

      {/* Dialog for View Detail */}
      <Dialog
        open={!!viewingApplication}
        onOpenChange={(open) => {
          if (!open) {
            setViewingApplication(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalle de Solicitud
            </DialogTitle>
            <DialogDescription>
              Información completa del estudiante y su solicitud
            </DialogDescription>
          </DialogHeader>
          {viewingApplication && (
            <div className="space-y-6 py-4">
              {/* Student Information */}
              {isLoadingStudent ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : studentDetail ? (
                <div className="p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Información del Estudiante
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                        Nombre completo
                      </Label>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {studentDetail.firstName} {studentDetail.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                        Email
                      </Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <a
                          href={`mailto:${studentDetail.email}`}
                          className="text-sm text-primary hover:text-primary/80 break-all"
                        >
                          {studentDetail.email}
                        </a>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                        Número de Identificación
                      </Label>
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {studentDetail.identificationNumber}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                        Carrera
                      </Label>
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {studentDetail.career?.name || '-'}
                      </p>
                    </div>
                    {studentDetail.phone && (
                      <div>
                        <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                          Teléfono
                        </Label>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          {studentDetail.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No se pudo cargar la información del estudiante.
                  </p>
                </div>
              )}

              {/* Application Information */}
              <div className="p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Información de la Solicitud
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                      Oportunidad
                    </Label>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {viewingApplication.opportunity?.title || 'Oportunidad'}
                    </p>
                    {viewingApplication.opportunity?.company && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {viewingApplication.opportunity.company.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                      Estado
                    </Label>
                    {getApplicationStatusBadge(viewingApplication.status)}
                  </div>
                  {viewingApplication.matchScore !== undefined &&
                    viewingApplication.matchScore !== null && (
                      <div>
                        <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                          Calificación de Match
                        </Label>
                        <StarRating rating={viewingApplication.matchScore} />
                      </div>
                    )}
                  {viewingApplication.coverLetter && (
                    <div>
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                        Carta de Presentación
                      </Label>
                      <p className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                        {viewingApplication.coverLetter}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                      Fecha de Solicitud
                    </Label>
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      {formatDate(viewingApplication.createdAt)}
                    </p>
                  </div>
                  {viewingApplication.status === ApplicationStatusValues.APPROVED && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        onClick={() => handleAccept(viewingApplication)}
                        disabled={acceptApplicationMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {acceptApplicationMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Aceptando...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Aceptar Solicitud
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
