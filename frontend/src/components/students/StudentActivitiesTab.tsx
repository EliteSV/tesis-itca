import { Calendar, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/utils/date.utils';
import type { PracticeActivity } from '@/types/practice-professional.types';

interface StudentActivitiesTabProps {
  activities: PracticeActivity[];
  isLoading: boolean;
  activitiesPage: number;
  totalActivitiesPages: number;
  totalActivities: number;
  activitiesPerPage: number;
  onPageChange: (page: number) => void;
  onApprove: (activityId: string) => void;
  onReject: (activityId: string) => void;
  getActivityStatusBadgeVariant: (status: string) => 'default' | 'destructive' | 'secondary' | 'outline';
  capitalizeFirst: (str: string) => string;
}

export function StudentActivitiesTab({
  activities,
  isLoading,
  activitiesPage,
  totalActivitiesPages,
  totalActivities,
  activitiesPerPage,
  onPageChange,
  onApprove,
  onReject,
  getActivityStatusBadgeVariant,
  capitalizeFirst,
}: StudentActivitiesTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-16 w-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
          No hay actividades registradas
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          El estudiante aún no ha registrado actividades para esta práctica profesional.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card
          key={activity._id}
          className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${
            activity.status === 'aprobada'
              ? 'border-[#388E3C]/30 dark:border-[#388E3C]/30 bg-[#388E3C]/5 dark:bg-[#388E3C]/10'
              : activity.status === 'rechazada'
                ? 'border-[#C62828]/30 dark:border-[#C62828]/30 bg-[#C62828]/5 dark:bg-[#C62828]/10'
                : ''
          }`}
        >
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
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

                  {activity.evaluation && (
                    <div
                      className={`mt-3 p-3 rounded-lg border ${
                        activity.evaluation.type === 'warning'
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                          : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {activity.evaluation.type === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <Label
                            className={`text-xs font-medium mb-1 block ${
                              activity.evaluation.type === 'warning'
                                ? 'text-amber-800 dark:text-amber-300'
                                : 'text-green-800 dark:text-green-300'
                            }`}
                          >
                            Evaluación de Relevancia
                          </Label>
                          <p
                            className={`text-sm wrap-break-word ${
                              activity.evaluation.type === 'warning'
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-green-700 dark:text-green-400'
                            }`}
                          >
                            {activity.evaluation.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {activity.status === 'pendiente_aprobacion' && (
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <Button
                    onClick={() => onApprove(activity._id)}
                    size="sm"
                    className="bg-[#388E3C] hover:bg-[#2E7D32] text-white cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aprobar
                  </Button>
                  <Button
                    onClick={() => onReject(activity._id)}
                    size="sm"
                    variant="destructive"
                    className="cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {totalActivitiesPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Mostrando {((activitiesPage - 1) * activitiesPerPage) + 1} -{' '}
            {Math.min(activitiesPage * activitiesPerPage, totalActivities)} de{' '}
            {totalActivities} actividades
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, activitiesPage - 1))}
              disabled={activitiesPage === 1}
              className="text-xs sm:text-sm cursor-pointer"
            >
              Anterior
            </Button>
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-2">
              Página {activitiesPage} de {totalActivitiesPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalActivitiesPages, activitiesPage + 1))}
              disabled={activitiesPage === totalActivitiesPages}
              className="text-xs sm:text-sm cursor-pointer"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

