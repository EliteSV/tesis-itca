import { useState, useCallback } from 'react';
import {
  FileSearch,
  User,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  Briefcase,
  GraduationCap,
  Code,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/utils/date.utils';
import { generateStudentPDF } from '@/utils/pdf.utils';
import { useToastContext } from '@/contexts/ToastContext';
import type { Application } from '@/types/opportunity.types';
import type { Student } from '@/types/student.types';

interface ApplicationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  student: Student | null | undefined;
  isLoadingStudent: boolean;
  getStatusBadgeVariant: (status: string) => 'default' | 'destructive' | 'secondary' | 'outline';
  capitalizeFirst: (str: string) => string;
  canAcceptMore: boolean;
  isClosed: boolean;
  acceptedCount: number;
  availablePositions: number;
  onViewProfile: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export function ApplicationDetailDialog({
  open,
  onOpenChange,
  application,
  student,
  isLoadingStudent,
  getStatusBadgeVariant,
  capitalizeFirst,
  canAcceptMore,
  isClosed,
  acceptedCount,
  availablePositions,
  onViewProfile,
  onAccept,
  onReject,
}: ApplicationDetailDialogProps) {
  const toast = useToastContext();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = useCallback(async () => {
    if (!student) {
      toast.error('Error', 'No se pudo obtener la información del estudiante');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generateStudentPDF(student, student.professionalProfile || {});
      toast.success('Éxito', 'PDF generado correctamente');
    } catch (error: any) {
      toast.error('Error', `No se pudo generar el PDF: ${error.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [student, toast]);

  if (!application) return null;

  const formatDateRange = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    const start = formatDate(startDate);
    const end = isCurrent ? 'Presente' : endDate ? formatDate(endDate) : '';
    return `${start} - ${end}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <FileSearch className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <span>Detalles de la Solicitud</span>
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant={getStatusBadgeVariant(application.status)}
              className="text-xs sm:text-sm"
            >
              {capitalizeFirst(application.status)}
            </Badge>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Aplicó el {formatDate(application.createdAt)}
            </span>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
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
                  {application.student?.name || 'No disponible'}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Email
                </Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <a
                    href={`mailto:${application.student?.email}`}
                    className="text-sm text-primary hover:text-primary/80 break-all cursor-pointer"
                  >
                    {application.student?.email || 'No disponible'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {application.coverLetter && (
            <div className="p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Carta de Presentación
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap wrap-break-word leading-relaxed">
                {application.coverLetter}
              </p>
            </div>
          )}

          {application.rejectionReason && (
            <div className="p-5 bg-[#C62828]/5 dark:bg-[#C62828]/10 rounded-lg border border-[#C62828]/20 dark:border-[#C62828]/30">
              <h3 className="text-sm font-semibold text-[#C62828] dark:text-[#EF5350] mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Razón de Rechazo
              </h3>
              <p className="text-sm text-[#C62828] dark:text-[#EF5350] wrap-break-word leading-relaxed">
                {application.rejectionReason}
              </p>
            </div>
          )}

          {/* Professional Profile Section - CV Style */}
          {isLoadingStudent ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : student ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="p-6 sm:p-8">
                {/* Header with Download Button */}
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
                        Descargar PDF
                      </>
                    )}
                  </Button>
                </div>

                {/* Resume Content - CV Style */}
                <div className="space-y-6">
                  {/* Summary */}
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

                  {/* Work Experience */}
                  {student.professionalProfile?.workExperience && student.professionalProfile?.workExperience.length > 0 && (
                    <section>
                      <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Experiencia Laboral
                      </h4>
                      <div className="space-y-5">
                        {student.professionalProfile?.workExperience.map((exp, index) => (
                          <div key={index} className="pl-4 border-l-2 border-primary/20">
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

                  {/* Education */}
                  {student.professionalProfile?.education && student.professionalProfile?.education.length > 0 && (
                    <section>
                      <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Formación Académica
                      </h4>
                      <div className="space-y-5">
                        {student.professionalProfile?.education.map((edu, index) => (
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

                  {/* Skills */}
                  {student.professionalProfile?.skills && student.professionalProfile?.skills.length > 0 && (
                    <section>
                      <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Habilidades
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {student.professionalProfile?.skills.map((skill, index) => (
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

                  {/* Languages */}
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

                  {/* Certifications */}
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

                  {/* Projects */}
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
              </div>
            </div>
          ) : !isLoadingStudent ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                El estudiante no ha completado su perfil profesional.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            {(application.studentId || application.student?._id) && (
              <Button
                variant="outline"
                onClick={onViewProfile}
                className="flex-1 border-secondary/30 dark:border-secondary/20 hover:bg-secondary/10 dark:hover:bg-secondary/5 text-secondary-foreground"
              >
                <User className="h-4 w-4 mr-2" />
                Ver Perfil Completo
              </Button>
            )}

            {application.status === 'pendiente' && (
              <>
                {canAcceptMore ? (
                  <Button
                    onClick={onAccept}
                    className="flex-1 bg-[#388E3C] hover:bg-[#2E7D32] text-white font-semibold shadow-sm transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aceptar Solicitud
                  </Button>
                ) : (
                  <div className="flex-1">
                    <Button
                      variant="outline"
                      disabled
                      className="w-full border-slate-300 dark:border-slate-600 opacity-50 cursor-not-allowed"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      No se puede aceptar
                    </Button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 text-center">
                      {isClosed
                        ? 'Esta oportunidad está cerrada'
                        : `Todas las vacantes han sido ocupadas (${acceptedCount}/${availablePositions})`}
                    </p>
                  </div>
                )}
                <Button
                  onClick={onReject}
                  className="flex-1 bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold shadow-sm transition-all"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar Solicitud
                </Button>
              </>
            )}

            {application.status !== 'pendiente' && (
              <div className="flex-1 flex items-center justify-center">
                <Badge
                  variant={getStatusBadgeVariant(application.status)}
                  className="text-sm px-4 py-2"
                >
                  {application.status === 'aceptada' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Solicitud Aceptada
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Solicitud Rechazada
                    </>
                  )}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
