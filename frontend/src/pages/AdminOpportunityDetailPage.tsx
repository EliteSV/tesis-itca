import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Users,
  Mail,
  Calendar,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useOpportunityForAdmin,
  useOpportunityApplicationsForAdmin,
} from '@/hooks/useOpportunities';
import { useStudent } from '@/hooks/useStudents';
import { formatDate } from '@/utils/date.utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { Application } from '@/types/opportunity.types';
import { OpportunityHeaderCard } from '@/components/opportunities/OpportunityHeaderCard';
import { StatisticsCards } from '@/components/opportunities/StatisticsCards';
import { CompanyInfoSection } from '@/components/opportunities/CompanyInfoSection';

export function AdminOpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [selectedApplicationDetail, setSelectedApplicationDetail] =
    useState<Application | null>(null);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [isToggling] = useState(false);
  const applicationsPerPage = 10;

  const { data: opportunity, isLoading: isLoadingOpportunity } =
    useOpportunityForAdmin(id || '');
  const { data: applications, isLoading: isLoadingApplications } =
    useOpportunityApplicationsForAdmin(id || '');

  const validStudentId = useMemo(() => {
    if (!viewingStudentId) return '';
    const id = String(viewingStudentId).trim();
    if (
      id === '[object Object]' ||
      id === 'object Object' ||
      id === '' ||
      id.includes('object')
    ) {
      return '';
    }
    return id;
  }, [viewingStudentId]);

  const { data: viewingStudent, isLoading: isLoadingStudent } = useStudent(
    validStudentId,
  );
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getApplicationStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'aceptada':
        return 'default';
      case 'rechazada':
        return 'destructive';
      case 'pendiente':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const acceptedCount =
    applications?.filter((app) => app.status === 'aceptada').length || 0;
  const rejectedCount =
    applications?.filter((app) => app.status === 'rechazada').length || 0;
  const pendingCount =
    applications?.filter((app) => app.status === 'pendiente').length || 0;

  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    const filtered =
      filterStatus === 'all'
        ? applications
        : applications.filter((app) => app.status === filterStatus);
    return filtered;
  }, [applications, filterStatus]);

  const paginatedApplications = useMemo(() => {
    const startIndex = (applicationsPage - 1) * applicationsPerPage;
    const endIndex = startIndex + applicationsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, applicationsPage, applicationsPerPage]);

  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  const handleApplicationClick = useCallback((application: Application) => {
    setSelectedApplicationDetail(application);
  }, []);

  const handleToggleActive = useCallback(async () => {
    // Admin can't toggle opportunity status
  }, []);

  const handleViewProfileFromDetail = useCallback(() => {
    if (!selectedApplicationDetail) return;
    let studentId: string | null = null;

    if (selectedApplicationDetail.student?._id) {
      studentId = String(selectedApplicationDetail.student._id);
    } else if (selectedApplicationDetail.studentId) {
      if (typeof selectedApplicationDetail.studentId === 'string') {
        studentId = selectedApplicationDetail.studentId;
      } else if (typeof selectedApplicationDetail.studentId === 'object') {
        const studentIdObj = selectedApplicationDetail.studentId as {
          _id?: string | { toString: () => string };
        } | string;
        if (
          studentIdObj &&
          typeof studentIdObj === 'object' &&
          '_id' in studentIdObj
        ) {
          studentId =
            typeof studentIdObj._id === 'string'
              ? studentIdObj._id
              : studentIdObj._id?.toString() || '';
        } else {
          studentId = String(studentIdObj);
        }
      } else {
        studentId = String(selectedApplicationDetail.studentId);
      }
    }

    const cleanStudentId = studentId ? String(studentId).trim() : '';
    if (
      cleanStudentId &&
      cleanStudentId !== '' &&
      cleanStudentId !== '[object Object]' &&
      !cleanStudentId.includes('object') &&
      cleanStudentId.length > 0
    ) {
      setViewingStudentId(cleanStudentId);
      setSelectedApplicationDetail(null);
    }
  }, [selectedApplicationDetail]);

  if (isLoadingOpportunity) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] dark:bg-slate-900 -m-4 sm:-m-6 lg:-m-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] dark:bg-slate-900 -m-4 sm:-m-6 lg:-m-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Oportunidad no encontrada
              </h3>
              <Button onClick={() => navigate('/admin/opportunities')} className="mt-4">
                Volver a Oportunidades
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] dark:bg-slate-900 -m-4 sm:-m-6 lg:-m-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]">
      <div className="w-full py-4 sm:py-6">
        <div className="px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/opportunities')}
            className="mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Oportunidades
          </Button>
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-full">
            <div className="space-y-4 sm:space-y-6">
              <OpportunityHeaderCard
                opportunity={opportunity}
                onToggleActive={handleToggleActive}
                isToggling={isToggling}
                acceptedCount={acceptedCount}
                availablePositions={opportunity.availablePositions}
                showToggleButton={false}
              />

              <StatisticsCards
                acceptedCount={acceptedCount}
                pendingCount={pendingCount}
                rejectedCount={rejectedCount}
              />

              <CompanyInfoSection opportunity={opportunity} />

              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Users className="h-5 w-5" />
                      Aplicaciones ({applications?.length || 0})
                    </CardTitle>
                    {applications && applications.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={filterStatus === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setFilterStatus('all');
                            setApplicationsPage(1);
                          }}
                          className="text-xs sm:text-sm"
                        >
                          Todas ({applications.length})
                        </Button>
                        <Button
                          variant={filterStatus === 'pendiente' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setFilterStatus('pendiente');
                            setApplicationsPage(1);
                          }}
                          className="text-xs sm:text-sm"
                        >
                          Pendientes ({pendingCount})
                        </Button>
                        <Button
                          variant={filterStatus === 'aceptada' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setFilterStatus('aceptada');
                            setApplicationsPage(1);
                          }}
                          className="text-xs sm:text-sm"
                        >
                          Aceptadas ({acceptedCount})
                        </Button>
                        <Button
                          variant={filterStatus === 'rechazada' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setFilterStatus('rechazada');
                            setApplicationsPage(1);
                          }}
                          className="text-xs sm:text-sm"
                        >
                          Rechazadas ({rejectedCount})
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingApplications ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  ) : !applications || applications.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                        No hay aplicaciones
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Aún no se han recibido aplicaciones para esta oportunidad.
                      </p>
                    </div>
                  ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                        No hay aplicaciones con este filtro
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        No se encontraron aplicaciones con el estado seleccionado.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 sm:space-y-4">
                        {paginatedApplications.map((application) => (
                          <Card
                            key={application._id}
                            onClick={() => handleApplicationClick(application)}
                            className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-200 cursor-pointer ${
                              application.status === 'aceptada'
                                ? 'border-[#388E3C]/30 dark:border-[#388E3C]/30 bg-[#388E3C]/5 dark:bg-[#388E3C]/10'
                                : application.status === 'rechazada'
                                  ? 'border-[#C62828]/30 dark:border-[#C62828]/30 bg-[#C62828]/5 dark:bg-[#C62828]/10'
                                  : ''
                            }`}
                          >
                            <CardContent className="pt-4 sm:pt-6">
                              <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100 break-words mb-1">
                                        {application.student?.name || 'Estudiante'}
                                      </h3>
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                                          {application.student?.email}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge
                                      variant={getApplicationStatusBadgeVariant(
                                        application.status,
                                      )}
                                      className="text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit"
                                    >
                                      {capitalizeFirst(application.status)}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      Aplicó el {formatDate(application.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            Mostrando{' '}
                            {(applicationsPage - 1) * applicationsPerPage + 1} -{' '}
                            {Math.min(
                              applicationsPage * applicationsPerPage,
                              filteredApplications.length,
                            )}{' '}
                            de {filteredApplications.length} aplicaciones
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setApplicationsPage((p) => Math.max(1, p - 1))
                              }
                              disabled={applicationsPage === 1}
                              className="text-xs sm:text-sm"
                            >
                              Anterior
                            </Button>
                            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-2">
                              Página {applicationsPage} de {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setApplicationsPage((p) =>
                                  Math.min(totalPages, p + 1),
                                )
                              }
                              disabled={applicationsPage === totalPages}
                              className="text-xs sm:text-sm"
                            >
                              Siguiente
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Application Detail Dialog */}
      <Dialog
        open={!!selectedApplicationDetail}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApplicationDetail(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {selectedApplicationDetail && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <span>Detalles de la Solicitud</span>
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={getApplicationStatusBadgeVariant(
                      selectedApplicationDetail.status,
                    )}
                    className="text-xs sm:text-sm"
                  >
                    {capitalizeFirst(selectedApplicationDetail.status)}
                  </Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Aplicó el{' '}
                    {formatDate(selectedApplicationDetail.createdAt)}
                  </span>
                </div>
              </DialogHeader>

              <div className="px-6 py-6 space-y-6">
                <div className="p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Información del Estudiante
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                        Nombre completo
                      </Label>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {selectedApplicationDetail.student?.name || 'No disponible'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                        Email
                      </Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <a
                          href={`mailto:${selectedApplicationDetail.student?.email}`}
                          className="text-sm text-primary hover:text-primary/80 break-all"
                        >
                          {selectedApplicationDetail.student?.email || 'No disponible'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedApplicationDetail.coverLetter && (
                  <div className="p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Carta de Presentación
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
                      {selectedApplicationDetail.coverLetter}
                    </p>
                  </div>
                )}

                {selectedApplicationDetail.rejectionReason && (
                  <div className="p-5 bg-[#C62828]/5 dark:bg-[#C62828]/10 rounded-lg border border-[#C62828]/20 dark:border-[#C62828]/30">
                    <h3 className="text-sm font-semibold text-[#C62828] dark:text-[#EF5350] mb-3 flex items-center gap-2">
                      Razón de Rechazo
                    </h3>
                    <p className="text-sm text-[#C62828] dark:text-[#EF5350] break-words leading-relaxed">
                      {selectedApplicationDetail.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {(selectedApplicationDetail.studentId ||
                    selectedApplicationDetail.student?._id) && (
                    <Button
                      variant="outline"
                      onClick={handleViewProfileFromDetail}
                      className="flex-1 border-secondary/30 dark:border-secondary/20 hover:bg-secondary/10 dark:hover:bg-secondary/5 text-secondary-foreground"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Ver Perfil del Estudiante
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Student Profile Dialog - Reusing from OpportunityDetailPage */}
      {viewingStudentId && (
        <Dialog
          open={!!viewingStudentId}
          onOpenChange={(open) => {
            if (!open) {
              setViewingStudentId(null);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
            <DialogHeader className="px-6 pt-6 pb-5 border-b border-slate-200 dark:border-slate-700">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                <span>Perfil del Estudiante</span>
              </DialogTitle>
            </DialogHeader>
            {isLoadingStudent ? (
              <div className="flex justify-center items-center py-12 px-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : viewingStudent ? (
              <div className="px-6 py-6 space-y-6">
                <div className="pb-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {viewingStudent.firstName} {viewingStudent.lastName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Mail className="h-4 w-4 text-primary" />
                      <a
                        href={`mailto:${viewingStudent.email}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {viewingStudent.email}
                      </a>
                    </div>
                    {viewingStudent.identificationNumber && (
                      <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">
                          ID:
                        </span>
                        <span className="text-sm font-mono font-semibold">
                          {viewingStudent.identificationNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {viewingStudent.career && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                      <GraduationCap className="h-6 w-6 text-primary" />
                      <Label className="text-sm font-bold uppercase tracking-wide">
                        Información Académica
                      </Label>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">
                        Carrera
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {typeof viewingStudent.career === 'object'
                          ? viewingStudent.career.name
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 px-6">
                <p className="text-slate-600 dark:text-slate-400">
                  No se pudo cargar el perfil del estudiante.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

