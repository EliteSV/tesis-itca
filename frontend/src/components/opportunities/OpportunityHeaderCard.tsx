import { Building2, Calendar, GraduationCap, MapPin, Power, PowerOff, Clock, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/date.utils';
import type { Opportunity } from '@/types/opportunity.types';

interface OpportunityHeaderCardProps {
  opportunity: Opportunity;
  baseUrl: string;
  onToggleActive: () => void;
  isToggling: boolean;
  acceptedCount: number;
  availablePositions: number;
  showToggleButton?: boolean;
}

function getOpportunityStatusBadgeVariant(status?: string) {
  switch (status) {
    case 'activa':
      return 'default';
    case 'cerrada':
      return 'destructive';
    case 'pausada':
      return 'secondary';
    default:
      return 'outline';
  }
}

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function OpportunityHeaderCard({
  opportunity,
  baseUrl,
  onToggleActive,
  isToggling,
  acceptedCount,
  availablePositions,
  showToggleButton = true,
}: OpportunityHeaderCardProps) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4 mb-4">
          {/* Company Logo */}
          <div className="flex-shrink-0 relative w-16 h-16 sm:w-20 sm:h-20">
            {opportunity?.company?.logo ? (
              <>
                <img
                  key={`logo-${opportunity._id}-${opportunity.company.logo}`}
                  src={`${baseUrl}${opportunity.company.logo}`}
                  alt={opportunity.company.name || 'Company logo'}
                  className="w-full h-full rounded-lg object-contain border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1"
                  onLoad={() => {
                    const fallback = document.querySelector(`[data-logo-fallback="${opportunity._id}"]`) as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'none';
                    }
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.querySelector(`[data-logo-fallback="${opportunity._id}"]`) as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div
                  data-logo-fallback={opportunity._id}
                  className="absolute inset-0 w-full h-full rounded-lg bg-primary/10 dark:bg-primary/20 items-center justify-center border border-slate-200 dark:border-slate-700"
                  style={{ display: 'none' }}
                >
                  <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
              </>
            ) : (
              <div className="w-full h-full rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
            )}
          </div>

          {/* Title and Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 break-words">
                  {opportunity.title}
                </CardTitle>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">
                  {opportunity.company?.name}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {opportunity.modality && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
                      {opportunity.modality === 'remoto' ? 'En remoto' : 'Presencial'}
                    </span>
                  )}
                  {opportunity.career && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                        {opportunity.career.name}
                      </span>
                    </>
                  )}
                  {opportunity.expirationDate && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        Vence {formatDate(opportunity.expirationDate)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Badge
                  variant={getOpportunityStatusBadgeVariant(opportunity?.status)}
                  className="text-xs sm:text-sm px-3 py-1 w-fit"
                >
                  {opportunity?.status ? capitalizeFirst(String(opportunity.status)) : 'Sin estado'}
                </Badge>
                {showToggleButton && (
                  <Button
                    variant={opportunity.isActive ? 'outline' : 'default'}
                    size="sm"
                    onClick={onToggleActive}
                    disabled={isToggling}
                    className="whitespace-nowrap text-xs sm:text-sm"
                  >
                    {isToggling ? (
                      <>
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                        {opportunity.isActive ? 'Desactivando...' : 'Activando...'}
                      </>
                    ) : opportunity.isActive ? (
                      <>
                        <PowerOff className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <Power className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Activar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {opportunity.description && (
          <div className="mb-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Acerca de la oportunidad
            </h3>
            <div
              className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert [&_p]:mb-2 sm:[&_p]:mb-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-4 sm:[&_ul]:ml-6 [&_ol]:ml-4 sm:[&_ol]:ml-6 [&_ul]:space-y-1 sm:[&_ul]:space-y-2 [&_ol]:space-y-1 sm:[&_ol]:space-y-2 break-words"
              dangerouslySetInnerHTML={{ __html: opportunity.description }}
            />
          </div>
        )}

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">
              Vacantes disponibles
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-secondary flex-shrink-0" />
              {acceptedCount}/{availablePositions} ocupadas
            </p>
          </div>
          {opportunity.totalHours && (
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">
                Horas totales
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-accent flex-shrink-0" />
                {opportunity.totalHours} horas
              </p>
            </div>
          )}
          {opportunity.career && (
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">
                Carrera
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 text-secondary flex-shrink-0" />
                <span className="break-words">{opportunity.career.name}</span>
              </p>
            </div>
          )}
          {opportunity.expirationDate && (
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">
                Fecha de vencimiento
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-accent flex-shrink-0" />
                {formatDate(opportunity.expirationDate)}
              </p>
            </div>
          )}
        </div>

      </CardHeader>
    </Card>
  );
}

