import { Briefcase, Calendar, Clock, Building2, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/utils/date.utils';
import type { PracticeProfessional } from '@/types/practice-professional.types';
import { ActivityStatus } from '@/types/practice-professional.types';

interface AdminStudentPracticeTabProps {
  practiceProfessional: PracticeProfessional;
}

export function AdminStudentPracticeTab({
  practiceProfessional,
}: AdminStudentPracticeTabProps) {
  const { application, opportunity, activities, totalHours, approvedHours } =
    practiceProfessional;

  const getActivityStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case ActivityStatus.APPROVED:
        return 'default';
      case ActivityStatus.REJECTED:
        return 'destructive';
      case ActivityStatus.PENDING_APPROVAL:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Opportunity Information */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Briefcase className="h-5 w-5 text-primary" />
            Información de la Oportunidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Título
              </Label>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {opportunity.title}
              </p>
            </div>
            {opportunity.description && (
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Descripción
                </Label>
                <p className="text-sm text-slate-700 dark:text-slate-300 wrap-break-word">
                  {opportunity.description}
                </p>
              </div>
            )}
            {opportunity.activities && (
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Actividades
                </Label>
                <p className="text-sm text-slate-700 dark:text-slate-300 wrap-break-word">
                  {opportunity.activities}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Horas Totales
                </Label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {opportunity.totalHours} horas
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Modalidad
                </Label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {opportunity.modality === 'presencial' ? 'Presencial' : 'Remoto'}
                </p>
              </div>
              {opportunity.workType && (
                <div>
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                    Tipo de Trabajo
                  </Label>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {opportunity.workType === 'full-time' ? 'Tiempo Completo' : 'Medio Tiempo'}
                  </p>
                </div>
              )}
              {opportunity.expirationDate && (
                <div>
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                    Fecha de Expiración
                  </Label>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatDate(opportunity.expirationDate)}
                  </p>
                </div>
              )}
            </div>
            {opportunity.company && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Empresa
                </Label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {opportunity.company.name}
                  </p>
                </div>
              </div>
            )}
            {opportunity.career && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Carrera
                </Label>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {opportunity.career.name} ({opportunity.career.code})
                  </p>
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Fecha de Aplicación
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {formatDate(application.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Clock className="h-5 w-5 text-primary" />
            Estadísticas de Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Total de Actividades
              </Label>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {activities.length}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Horas Totales Registradas
              </Label>
              <p className="text-2xl font-bold text-primary">
                {totalHours}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Horas Aprobadas
              </Label>
              <p className="text-2xl font-bold text-[#388E3C]">
                {approvedHours}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Clock className="h-5 w-5 text-primary" />
            Actividades Registradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                No hay actividades registradas
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                El estudiante aún no ha registrado actividades para esta práctica profesional.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card
                  key={activity._id}
                  className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${
                    activity.status === ActivityStatus.APPROVED
                      ? 'border-[#388E3C]/30 dark:border-[#388E3C]/30 bg-[#388E3C]/5 dark:bg-[#388E3C]/10'
                      : activity.status === ActivityStatus.REJECTED
                        ? 'border-[#C62828]/30 dark:border-[#C62828]/30 bg-[#C62828]/5 dark:bg-[#C62828]/10'
                        : ''
                  }`}
                >
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {formatDate(activity.activityDate)}
                        </span>
                      </div>
                      <Badge
                        variant={getActivityStatusBadgeVariant(activity.status)}
                        className="text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit"
                      >
                        {capitalizeFirst(activity.status.replace('_', ' '))}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                          Descripción
                        </Label>
                        <p className="text-sm text-slate-700 dark:text-slate-300 wrap-break-word">
                          {activity.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                            Horas
                          </Label>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {activity.hours} horas
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                            Equipo/Herramienta
                          </Label>
                          <p className="text-sm text-slate-700 dark:text-slate-300 wrap-break-word">
                            {activity.equipmentOrTool}
                          </p>
                        </div>
                      </div>

                      {activity.rejectionReason && (
                        <div className="mt-3 p-3 bg-[#C62828]/5 dark:bg-[#C62828]/10 rounded-lg border border-[#C62828]/20 dark:border-[#C62828]/30">
                          <Label className="text-xs font-medium text-[#C62828] dark:text-[#EF5350] mb-1 block">
                            Razón de Rechazo
                          </Label>
                          <p className="text-sm text-[#C62828] dark:text-[#EF5350] wrap-break-word">
                            {activity.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

