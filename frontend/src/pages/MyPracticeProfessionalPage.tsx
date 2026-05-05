import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  usePracticeProfessional,
  useCreateActivity,
  usePracticeActivities,
} from '@/hooks/usePracticeProfessional';
import { useHolidays } from '@/hooks/useHolidays';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  GraduationCap,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wrench,
  FileText,
  Target,
} from 'lucide-react';
import { formatDate } from '@/utils/date.utils';
import type { CreateActivityDto } from '@/types/practice-professional.types';
import {
  ActivityStatus,
  PracticeStatus,
  type PracticeStatus as PracticeStatusType,
} from '@/types/practice-professional.types';
import { getImageUrl } from '@/lib/utils';
import { Pagination } from '@/pages/career-categories/Pagination';
import { generatePracticeProfessionalPDF } from '@/utils/pdf.utils';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToastContext } from '@/contexts/ToastContext';

export function MyPracticeProfessionalPage() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const limit = 20;
  const [formData, setFormData] = useState<CreateActivityDto>({
    description: '',
    activityDate: new Date().toISOString().split('T')[0],
    hours: 0,
    equipmentOrTool: '',
  });

  const { data: practiceData, isLoading: isLoadingPractice, error } = usePracticeProfessional();
  const { data: activitiesData, isLoading: isLoadingActivities } = usePracticeActivities({
    page,
    limit,
  });
  const createActivityMutation = useCreateActivity();
  const { data: userProfile } = useUserProfile();
  const toast = useToastContext();
  const currentYear = new Date().getFullYear();
  const { data: holidays = [] } = useHolidays(currentYear);

  const handleOpenCreateDialog = () => {
    setFormData({
      description: '',
      activityDate: new Date().toISOString().split('T')[0],
      hours: 0,
      equipmentOrTool: '',
    });
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setFormData({
      description: '',
      activityDate: new Date().toISOString().split('T')[0],
      hours: 0,
      equipmentOrTool: '',
    });
  };

  const handleSubmitActivity = async () => {
    if (!formData.description.trim()) {
      toast.error('Error', 'La descripción es requerida');
      return;
    }
    if (formData.hours <= 0) {
      toast.error('Error', 'Las horas deben ser mayor a 0');
      return;
    }
    if (!formData.equipmentOrTool.trim()) {
      toast.error('Error', 'La maquinaria o herramienta es requerida');
      return;
    }

    const selectedDate = formData.activityDate.split('T')[0];
    if (holidays.includes(selectedDate)) {
      toast.error('Error', 'No se pueden registrar actividades en días festivos');
      return;
    }

    const activities = practiceData?.activities || [];
    const selectedDateStr = formData.activityDate.split('T')[0];

    const activitiesOnSameDate = activities.filter((activity) => {
      const actDate = new Date(activity.activityDate);
      const actDateStr = actDate.toISOString().split('T')[0];
      return actDateStr === selectedDateStr;
    });

    const dailyHours = activitiesOnSameDate.reduce(
      (sum, activity) => sum + (activity.hours || 0),
      0,
    );

    if (dailyHours + formData.hours > 8) {
      toast.error(
        'Error',
        `No puedes registrar más de 8 horas por día. Ya tienes ${dailyHours} horas registradas en esta fecha.`,
      );
      return;
    }

    const [year, month, day] = selectedDateStr.split('-').map(Number);
    const activityDate = new Date(year, month - 1, day);
    const dayOfWeek = activityDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const mondayDate = new Date(activityDate);
    mondayDate.setDate(mondayDate.getDate() - daysToMonday);
    mondayDate.setHours(0, 0, 0, 0);

    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(sundayDate.getDate() + 6);
    sundayDate.setHours(23, 59, 59, 999);

    const activitiesInSameWeek = activities.filter((activity) => {
      const actDate = new Date(activity.activityDate);
      const actDateStr = actDate.toISOString().split('T')[0];
      const [actYear, actMonth, actDay] = actDateStr.split('-').map(Number);
      const actDateNormalized = new Date(actYear, actMonth - 1, actDay);
      return actDateNormalized >= mondayDate && actDateNormalized <= sundayDate;
    });

    const weeklyHours = activitiesInSameWeek.reduce(
      (sum, activity) => sum + (activity.hours || 0),
      0,
    );

    if (weeklyHours + formData.hours > 40) {
      toast.error(
        'Error',
        `No puedes registrar más de 40 horas por semana. Ya tienes ${weeklyHours} horas registradas esta semana.`,
      );
      return;
    }

    try {
      await createActivityMutation.mutateAsync(formData);
      handleCloseCreateDialog();
      setPage(1);
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'No se pudo crear la actividad. Intenta nuevamente.';
      toast.error('Error', errorMessage);
    }
  };

  const handleExportPDF = async () => {
    if (!practiceData) return;

    const approvedActivities = practiceData.activities.filter(
      (activity) => activity.status === ActivityStatus.APPROVED,
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

  const activities = useMemo(() => activitiesData?.data || [], [activitiesData?.data]);
  const totalPages = activitiesData?.totalPages || 0;
  const totalActivities = activitiesData?.total || 0;

  const getActivityStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case ActivityStatus.APPROVED:
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aprobada
          </Badge>
        );
      case ActivityStatus.REJECTED:
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazada
          </Badge>
        );
      case ActivityStatus.PENDING_APPROVAL:
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
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
    const isNotFound =
      (error as { response?: { status?: number } })?.response?.status === 404;

    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Card className="p-8 text-center max-w-md">
          {isNotFound ? (
            <Briefcase className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          ) : (
            <AlertCircle className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          )}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {isNotFound
              ? 'No tienes una práctica profesional activa'
              : 'No se pudo cargar la información'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {isNotFound
              ? 'Actualmente no estás participando en ninguna práctica profesional. Cuando una empresa acepte tu solicitud, podrás gestionar tus actividades aquí.'
              : (error as { message?: string })?.message ||
              'Ocurrió un error al cargar la información. Por favor, intenta nuevamente.'}
          </p>
          {isNotFound && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/oportunidades-disponibles')}
              >
                Ver Oportunidades
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  const { opportunity, totalHours, approvedHours, status } = practiceData;

  const getPracticeStatusBadge = (status: PracticeStatusType) => {
    switch (status) {
      case PracticeStatus.FINALIZADA:
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Finalizada
          </Badge>
        );
      case PracticeStatus.EN_CURSO:
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            En Curso
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Mi Práctica Profesional
            </h1>
            {getPracticeStatusBadge(status)}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gestiona tus actividades y horas de práctica profesional
          </p>
        </div>
        <div className="flex gap-2">
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
          <Button onClick={handleOpenCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Actividad
          </Button>
        </div>
      </div>

      {/* Opportunity Details */}
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                Horas Faltantes
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {Math.max(0, (opportunity.totalHours || 0) - approvedHours)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                De {opportunity.totalHours || 0} requeridas
              </p>
            </div>
            <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
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

      {/* Activities Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Actividades
          </h2>
        </div>

        {isLoadingActivities ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No hay actividades registradas aún
            </p>
            <Button
              onClick={handleOpenCreateDialog}
              variant="outline"
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Actividad
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block w-full overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
              <div className="min-w-full">
                <table className="w-full min-w-[800px] lg:min-w-[1000px] table-auto border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                      <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[250px] bg-white dark:bg-slate-900">
                        Descripción
                      </th>
                      <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[120px] bg-white dark:bg-slate-900">
                        Fecha
                      </th>
                      <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[100px] bg-white dark:bg-slate-900">
                        Horas
                      </th>
                      <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[200px] bg-white dark:bg-slate-900">
                        Maquinaria/Herramienta
                      </th>
                      <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[120px] bg-white dark:bg-slate-900">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {activities.map((activity, index) => (
                      <tr
                        key={activity._id}
                        className="group transition-all duration-200 animate-in fade-in slide-in-from-left-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[250px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 break-words">
                              {activity.description}
                            </p>
                            {activity.status === ActivityStatus.REJECTED &&
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
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[120px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                              {formatDate(activity.activityDate)}
                            </p>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[100px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                            <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                              {activity.hours} {activity.hours === 1 ? 'hora' : 'horas'}
                            </p>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[200px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <Wrench className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                              {activity.equipmentOrTool}
                            </p>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[120px] bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50 transition-all duration-200">
                          {getActivityStatusBadge(activity.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
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
                  {activity.status === ActivityStatus.REJECTED &&
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

        {/* Pagination */}
        {activitiesData && totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={totalActivities}
            limit={limit}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Create Activity Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Actividad</DialogTitle>
            <DialogDescription>
              Registra una nueva actividad realizada en tu práctica profesional
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                placeholder="Describe la actividad realizada..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activityDate">Fecha *</Label>
                <Input
                  id="activityDate"
                  type="date"
                  value={formData.activityDate}
                  onChange={(e) =>
                    setFormData({ ...formData, activityDate: e.target.value })
                  }
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">Horas *</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.hours || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hours: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipmentOrTool">
                Maquinaria o Herramienta Utilizada *
              </Label>
              <Input
                id="equipmentOrTool"
                placeholder="Ej: Visual Studio Code, Node.js, MongoDB..."
                value={formData.equipmentOrTool}
                onChange={(e) =>
                  setFormData({ ...formData, equipmentOrTool: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseCreateDialog}
              disabled={createActivityMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitActivity}
              disabled={
                createActivityMutation.isPending ||
                !formData.description.trim() ||
                formData.hours <= 0 ||
                !formData.equipmentOrTool.trim()
              }
            >
              {createActivityMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Actividad
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

