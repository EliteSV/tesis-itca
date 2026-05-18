import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePracticeProfessionalById } from '@/hooks/usePracticeProfessional';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  GraduationCap,
  XCircle,
  AlertCircle,
  Wrench,
  ArrowLeft,
  FileText,
  Star,
} from 'lucide-react';
import { formatDate } from '@/utils/date.utils';
import { getImageUrl } from '@/lib/utils';
import type { ActivityStatus } from '@/types/practice-professional.types';
import { ActivityStatus as ActivityStatusEnum } from '@/types/practice-professional.types';
import { generatePracticeProfessionalPDF, generatePracticeEvaluationPDF } from '@/utils/pdf.utils';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToastContext } from '@/contexts/ToastContext';

function getActivityStatusBadge(status: ActivityStatus) {
  switch (status) {
    case ActivityStatusEnum.APPROVED:
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Aprobada
        </Badge>
      );
    case ActivityStatusEnum.REJECTED:
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Rechazada
        </Badge>
      );
    case ActivityStatusEnum.PENDING_APPROVAL:
    default:
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      );
  }
}

export function PracticeDetailPage() {
  const { practiceId } = useParams<{ practiceId: string }>();
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingEvalPDF, setIsGeneratingEvalPDF] = useState(false);

  const { data: practiceData, isLoading: isLoadingPractice, error } =
    usePracticeProfessionalById(practiceId || null);
  const { data: userProfile } = useUserProfile();
  const toast = useToastContext();

  const handleExportPDF = async () => {
    if (!practiceData) return;

    const approvedActivities = practiceData.activities.filter(
      (activity) => activity.status === ActivityStatusEnum.APPROVED,
    );

    if (approvedActivities.length === 0) {
      toast.error('Error', 'No hay actividades aprobadas para exportar');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const studentName = userProfile?.name || 'Estudiante';
      await generatePracticeProfessionalPDF(practiceData, studentName);
      toast.success('PDF generado', 'El registro de práctica profesional se ha exportado correctamente.');
    } catch (error) {
      console.error('Error generando PDF:', error);
      const errorMessage =
        (error as { message?: string })?.message || 'Error al generar el PDF';
      toast.error('Error', errorMessage);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExportEvaluationPDF = async () => {
    if (!practiceData?.practiceEvaluation) return;
    setIsGeneratingEvalPDF(true);
    try {
      const studentName = userProfile?.name || 'Estudiante';
      await generatePracticeEvaluationPDF(practiceData, studentName);
      toast.success('PDF generado', 'La evaluación final se ha exportado correctamente.');
    } catch (error) {
      const errorMessage =
        (error as { message?: string })?.message || 'Error al generar el PDF';
      toast.error('Error', errorMessage);
    } finally {
      setIsGeneratingEvalPDF(false);
    }
  };

  if (isLoadingPractice) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !practiceData) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Práctica profesional no encontrada
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {(error as { message?: string })?.message ||
              'No se pudo cargar la información de la práctica profesional'}
          </p>
          <Button onClick={() => navigate('/historial-practicas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al historial
          </Button>
        </Card>
      </div>
    );
  }

  const { opportunity, totalHours, approvedHours, activities } = practiceData;
  const totalActivities = activities.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/historial-practicas')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Detalle de Práctica Profesional
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Información completa de la práctica profesional
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          {opportunity.company?.logo ? (
            <img
              src={getImageUrl(opportunity.company.logo)}
              alt={opportunity.company.name}
              className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {opportunity.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {opportunity.company?.name}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              {opportunity.career && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {opportunity.career.name}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  {formatDate(practiceData.application.createdAt)}
                  {practiceData.application.updatedAt !==
                    practiceData.application.createdAt &&
                    ` - ${formatDate(practiceData.application.updatedAt)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  {opportunity.totalHours} horas totales
                </span>
              </div>
              {opportunity.modality && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {opportunity.modality === 'remoto' ? 'Remoto' : 'Presencial'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {opportunity.description && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Descripción
            </h3>
            <div
              className="text-sm text-slate-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: opportunity.description }}
            />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Horas Registradas
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {totalHours}
              </p>
            </div>
            <Clock className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Horas Aprobadas
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {approvedHours}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Actividades
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {totalActivities}
              </p>
            </div>
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Actividades
          </h2>
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="gap-2"
            disabled={isGeneratingPDF || !practiceData}
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Exportar PDF
              </>
            )}
          </Button>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No hay actividades registradas
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block w-full overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
              <div className="min-w-full">
                <table className="w-full min-w-[800px] lg:min-w-[1000px] table-auto border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left py-3 md:py-4 px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[250px] bg-white dark:bg-slate-900">
                        Descripción
                      </th>
                      <th className="text-left py-3 md:py-4 px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[120px] bg-white dark:bg-slate-900">
                        Fecha
                      </th>
                      <th className="text-left py-3 md:py-4 px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[100px] bg-white dark:bg-slate-900">
                        Horas
                      </th>
                      <th className="text-left py-3 md:py-4 px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[200px] bg-white dark:bg-slate-900">
                        Maquinaria/Herramienta
                      </th>
                      <th className="text-left py-3 md:py-4 px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[120px] bg-white dark:bg-slate-900">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {activities.map((activity) => (
                      <tr
                        key={activity._id}
                        className="group transition-all duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-3 md:py-4 px-2 md:px-4 min-w-[250px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 break-words">
                              {activity.description}
                            </p>
                            {activity.status === ActivityStatusEnum.REJECTED &&
                              activity.rejectionReason && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
                                  <p className="font-semibold text-red-800 dark:text-red-300 mb-1">
                                    Razón de rechazo:
                                  </p>
                                  <p className="text-red-700 dark:text-red-400">
                                    {activity.rejectionReason}
                                  </p>
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 whitespace-nowrap min-w-[120px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {formatDate(activity.activityDate)}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 whitespace-nowrap min-w-[100px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {activity.hours} {activity.hours === 1 ? 'hora' : 'horas'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 min-w-[200px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <Wrench className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              {activity.equipmentOrTool}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 whitespace-nowrap min-w-[120px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                          {getActivityStatusBadge(activity.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden space-y-4">
              {activities.map((activity) => (
                <Card
                  key={activity._id}
                  className="p-4 border-l-4 border-l-primary hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getActivityStatusBadge(activity.status)}
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(activity.activityDate)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {activity.hours} {activity.hours === 1 ? 'hora' : 'horas'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {activity.equipmentOrTool}
                      </span>
                    </div>
                  </div>
                  {activity.status === ActivityStatusEnum.REJECTED &&
                    activity.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-xs font-semibold text-red-800 dark:text-red-300 mb-1">
                          Razón de rechazo:
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-400">
                          {activity.rejectionReason}
                        </p>
                      </div>
                    )}
                </Card>
              ))}
            </div>
          </>
        )}

      </Card>

      {/* Evaluación Final */}
      {practiceData.practiceEvaluation ? (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Evaluación Final
              </h2>
            </div>
            <Button
              onClick={handleExportEvaluationPDF}
              variant="outline"
              className="gap-2"
              disabled={isGeneratingEvalPDF}
            >
              {isGeneratingEvalPDF ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Exportar PDF
                </>
              )}
            </Button>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Calidad y Organización del Trabajo', key: 'qualityAndOrganization' },
              { label: 'Conocimiento y Aplicación', key: 'knowledgeAndApplication' },
              { label: 'Capacidad de Aprendizaje', key: 'learningCapacity' },
              { label: 'Asistencia y Puntualidad', key: 'attendanceAndPunctuality' },
              { label: 'Iniciativa y Criterio', key: 'initiativeAndJudgment' },
            ].map(({ label, key }) => {
              const score = practiceData.practiceEvaluation![key as keyof typeof practiceData.practiceEvaluation] as number;
              return (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{label}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${star <= score ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-slate-900 dark:text-slate-100 w-6 text-right">
                      {score}/5
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Promedio general</span>
            <span className="text-xl font-bold text-primary">
              {(
                (practiceData.practiceEvaluation.qualityAndOrganization +
                  practiceData.practiceEvaluation.knowledgeAndApplication +
                  practiceData.practiceEvaluation.learningCapacity +
                  practiceData.practiceEvaluation.attendanceAndPunctuality +
                  practiceData.practiceEvaluation.initiativeAndJudgment) / 5
              ).toFixed(1)}{' '}
              / 5
            </span>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Evaluación Final
            </h2>
          </div>
          <div className="text-center py-8">
            <Star className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aún no se ha registrado una evaluación para esta práctica
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
