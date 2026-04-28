import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  Calendar,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/utils/date.utils';
import { generateStudentPDF } from '@/utils/pdf.utils';
import { useToastContext } from '@/contexts/ToastContext';
import {
  useCompanyApplications,
  useUpdateApplicationStatus,
} from '@/hooks/useOpportunities';
import { useStudent } from '@/hooks/useStudents';
import { ApplicationStatusValues } from '@/types/opportunity.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';

export function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: applicationsData } = useCompanyApplications({
    page: 1,
    limit: 1000,
  });

  const application = useMemo(() => {
    if (!applicationsData?.data || !applicationId) return null;
    return applicationsData.data.find((app) => app._id === applicationId);
  }, [applicationsData?.data, applicationId]);

  const validStudentId = useMemo(() => {
    if (!application?.studentId) return '';
    const id = String(application.studentId).trim();
    if (id === '[object Object]' || id === '' || id.includes('object')) {
      return '';
    }
    return id;
  }, [application?.studentId]);

  const { data: student, isLoading: isLoadingStudent } = useStudent(
    validStudentId,
  );

  const updateStatusMutation = useUpdateApplicationStatus();

  const handleAccept = useCallback(() => {
    if (!application) return;
    setActionType('accept');
    setShowConfirmDialog(true);
  }, [application]);

  const handleReject = useCallback(() => {
    if (!application) return;
    setActionType('reject');
    setRejectionReason('');
    setShowConfirmDialog(true);
  }, [application]);

  const confirmAction = useCallback(async () => {
    if (!application || !actionType) return;

    try {
      await updateStatusMutation.mutateAsync({
        applicationId: application._id,
        data: {
          status:
            actionType === 'accept'
              ? ApplicationStatusValues.APPROVED
              : ApplicationStatusValues.REJECTED,
          rejectionReason:
            actionType === 'reject' ? rejectionReason : undefined,
        },
      });

      toast.success(
        `Solicitud ${actionType === 'accept' ? 'aprobada' : 'rechazada'}`,
        `La solicitud ha sido ${actionType === 'accept' ? 'aprobada' : 'rechazada'} correctamente.`,
      );

      navigate('/solicitudes');
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Error al actualizar el estado';
      toast.error('Error', errorMessage);
    }
  }, [application, actionType, rejectionReason, updateStatusMutation, toast, navigate]);

  const handleDownloadPDF = useCallback(async () => {
    if (!student) {
      toast.error('Error', 'No se pudo obtener la información del estudiante');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generateStudentPDF(student, {
        workExperiences: student.workExperience || [],
        education: student.education || [],
        skills: student.skills || [],
        professionalProfile: student.professionalProfile || {},
      });
      toast.success('Éxito', 'PDF generado correctamente');
    } catch (error: any) {
      toast.error('Error', `No se pudo generar el PDF: ${error.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [student, toast]);

  const getApplicationStatusBadge = (status: string) => {
    const labels = {
      [ApplicationStatusValues.PENDING]: 'Pendiente',
      [ApplicationStatusValues.APPROVED]: 'Aprobada',
      [ApplicationStatusValues.ACCEPTED]: 'Aceptada',
      [ApplicationStatusValues.REJECTED]: 'Rechazada',
    };

    const statusColors: Record<string, string> = {
      [ApplicationStatusValues.PENDING]:
        'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      [ApplicationStatusValues.APPROVED]:
        'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      [ApplicationStatusValues.ACCEPTED]:
        'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      [ApplicationStatusValues.REJECTED]:
        'bg-red-600 dark:bg-red-700 text-white border-red-700 dark:border-red-800',
    };

    const statusColor = statusColors[status] || statusColors[ApplicationStatusValues.PENDING];

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md border transition-all duration-200 ${statusColor}`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDateRange = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    const start = formatDate(startDate);
    const end = isCurrent ? 'Presente' : endDate ? formatDate(endDate) : '';
    return `${start} - ${end}`;
  };

  if (!application) {
    return (
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            Aplicación no encontrada
          </p>
          <Button
            onClick={() => navigate('/solicitudes')}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Solicitudes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => navigate('/solicitudes')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Solicitudes
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Detalle de Solicitud
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              Perfil profesional del estudiante
            </p>
          </div>
          {application.status === ApplicationStatusValues.PENDING && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAccept}
                disabled={updateStatusMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aceptar
              </Button>
              <Button
                onClick={handleReject}
                disabled={updateStatusMutation.isPending}
                variant="destructive"
                className="text-white"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Application Info Card */}
      <Card className="mb-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Estudiante
              </Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {application.student?.name || 'No disponible'}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-slate-400" />
                <a
                  href={`mailto:${application.student?.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {application.student?.email || 'No disponible'}
                </a>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Oportunidad
              </Label>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {application.opportunity?.title || 'No disponible'}
              </p>
              {application.opportunity?.career && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {application.opportunity.career.name}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Estado
              </Label>
              {getApplicationStatusBadge(application.status)}
              {application.matchScore !== undefined &&
                application.matchScore !== null && (
                  <div className="mt-2">
                    <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                      Match
                    </Label>
                    <StarRating rating={application.matchScore} />
                  </div>
                )}
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Fecha de Solicitud
              </Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(application.createdAt)}
                </p>
              </div>
            </div>
          </div>
          {application.coverLetter && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                Carta de Presentación
              </Label>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap wrap-break-word">
                {application.coverLetter}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Profile */}
      {isLoadingStudent ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : student ? (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-primary/20">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Perfil Profesional
              </h3>
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                size="sm"
                className="cursor-pointer"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar CV PDF
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-6">
              {student.professionalProfile?.summary && (
                <section>
                  <h4 className="text-lg font-bold text-primary mb-3 pb-2 border-b border-primary/30">
                    Resumen Profesional
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap wrap-break-word leading-relaxed">
                    {student.professionalProfile.summary}
                  </p>
                </section>
              )}

              {student.workExperience && student.workExperience.length > 0 && (
                <section>
                  <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experiencia Laboral
                  </h4>
                  <div className="space-y-5">
                    {student.workExperience.map((exp, index) => (
                      <div
                        key={index}
                        className="pl-4 border-l-2 border-primary/20"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-base text-slate-900 dark:text-slate-100">
                              {exp.position}
                            </p>
                            <p className="text-sm font-medium text-primary mt-1">
                              {exp.company}
                            </p>
                          </div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                          </p>
                        </div>
                        {exp.description && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {student.education && student.education.length > 0 && (
                <section>
                  <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Formación Académica
                  </h4>
                  <div className="space-y-5">
                    {student.education.map((edu, index) => (
                      <div key={index} className="pl-4 border-l-2 border-primary/20">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-base text-slate-900 dark:text-slate-100">
                              {edu.degree}
                            </p>
                            <p className="text-sm font-medium text-primary mt-1">
                              {edu.institution}
                            </p>
                            {edu.field && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {edu.field}
                              </p>
                            )}
                          </div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatDateRange(edu.startDate, edu.endDate, edu.isCurrent)}
                          </p>
                        </div>
                        {edu.description && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {student.skills && student.skills.length > 0 && (
                <section>
                  <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Habilidades
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded-md text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {student.professionalProfile?.languages &&
                student.professionalProfile.languages.length > 0 && (
                  <section>
                    <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Idiomas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {student.professionalProfile.languages.map((lang, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm py-2 px-3 bg-slate-50 dark:bg-slate-900/50 rounded"
                        >
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {lang.name}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {lang.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              {student.professionalProfile?.certifications &&
                student.professionalProfile.certifications.length > 0 && (
                  <section>
                    <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Certificaciones
                    </h4>
                    <div className="space-y-4">
                      {student.professionalProfile.certifications.map((cert, index) => (
                        <div key={index} className="pl-4 border-l-2 border-primary/20">
                          <p className="font-bold text-base text-slate-900 dark:text-slate-100">
                            {cert.name}
                          </p>
                          <p className="text-sm text-primary mt-1">{cert.issuer}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {formatDate(cert.date)}
                            {cert.expiryDate && ` - Expira: ${formatDate(cert.expiryDate)}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              {student.professionalProfile?.projects &&
                student.professionalProfile.projects.length > 0 && (
                  <section>
                    <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Proyectos
                    </h4>
                    <div className="space-y-5">
                      {student.professionalProfile.projects.map((proj, index) => (
                        <div key={index} className="pl-4 border-l-2 border-primary/20">
                          <p className="font-bold text-base text-slate-900 dark:text-slate-100">
                            {proj.name}
                          </p>
                          {proj.description && (
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                              {proj.description}
                            </p>
                          )}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {proj.technologies.map((tech, techIndex) => (
                                <span
                                  key={techIndex}
                                  className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                          {proj.url && (
                            <a
                              href={proj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline mt-2 inline-block cursor-pointer"
                            >
                              {proj.url}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No se pudo cargar la información del estudiante
            </p>
          </CardContent>
        </Card>
      )}

      {/* Accept/Reject Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept'
                ? 'Aceptar Solicitud'
                : 'Rechazar Solicitud'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept'
                ? '¿Estás seguro de que deseas aceptar esta solicitud?'
                : 'Por favor, proporciona una razón para rechazar esta solicitud.'}
            </DialogDescription>
          </DialogHeader>
          {actionType === 'reject' && (
            <div className="py-4">
              <Label htmlFor="rejection-reason" className="mb-2 block">
                Razón de Rechazo
              </Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explica por qué se rechaza esta solicitud..."
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setActionType(null);
                setRejectionReason('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmAction}
              disabled={
                updateStatusMutation.isPending ||
                (actionType === 'reject' && !rejectionReason.trim())
              }
              variant={actionType === 'accept' ? 'default' : 'destructive'}
              className={actionType === 'reject' ? 'text-white' : ''}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : actionType === 'accept' ? (
                'Aceptar'
              ) : (
                'Rechazar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
