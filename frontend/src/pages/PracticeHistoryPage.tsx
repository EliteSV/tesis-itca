import { useNavigate } from 'react-router-dom';
import { usePracticeHistory } from '@/hooks/usePracticeProfessional';
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
  History,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '@/utils/date.utils';
import { getImageUrl } from '@/lib/utils';
import type { PracticeHistoryItem, PracticeStatus } from '@/types/practice-professional.types';

function getPracticeStatusBadge(status: PracticeStatus) {
  switch (status) {
    case 'finalizada':
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Finalizada
        </Badge>
      );
    case 'en_curso':
    default:
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
          <Clock className="h-3 w-3 mr-1" />
          En Curso
        </Badge>
      );
  }
}

export function PracticeHistoryPage() {
  const navigate = useNavigate();
  const { data: historyData, isLoading, error } = usePracticeHistory();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !historyData) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Error al cargar el historial
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No se pudo cargar el historial de prácticas profesionales
          </p>
        </Card>
      </div>
    );
  }

  const practices = historyData.data || [];

  if (practices.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Historial de Prácticas Profesionales
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Revisa todas las prácticas profesionales que has realizado
          </p>
        </div>
        <Card className="p-12 text-center">
          <History className="h-16 w-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No tienes prácticas profesionales
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Aún no has completado ninguna práctica profesional
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Historial de Prácticas Profesionales
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Revisa todas las prácticas profesionales que has realizado
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {practices.map((practice: PracticeHistoryItem) => (
          <Card
            key={practice.applicationId}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/historial-practicas/${practice.applicationId}`)}
          >
            <div className="flex items-start gap-4 mb-4">
              {practice.companyLogo ? (
                <img
                  src={getImageUrl(practice.companyLogo)}
                  alt={practice.companyName}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center border border-slate-200 dark:border-slate-700 flex-shrink-0">
                  <Building2 className="h-8 w-8 text-primary-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {practice.opportunityTitle}
                  </h3>
                  {getPracticeStatusBadge(practice.status)}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {practice.companyName}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {formatDate(practice.startDate)}
                      {practice.endDate && ` - ${formatDate(practice.endDate)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {practice.approvedHours} / {practice.requiredHours} horas
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {practice.totalHours} horas trabajadas
                </span>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                Ver detalle
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
