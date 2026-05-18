import { useState, useMemo } from 'react';
import {
  Building2,
  Clock,
  Calendar,
  GraduationCap,
  Users,
  Loader2,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Send,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Opportunity } from '@/types/opportunity.types';
import { formatDate } from '@/utils/date.utils';
import { CompanyInfoSection } from './CompanyInfoSection';
import { useSaveOpportunity, useUnsaveOpportunity } from '@/hooks/useOpportunities';
import { useToast } from '@/hooks/useToast';
import { getImageUrl } from '@/lib/utils';

interface JobDetailPanelProps {
  opportunity: Opportunity;
  onApply: () => void;
  getTimeAgo: (date: string) => string;
  hideAppliedMessage?: boolean;
  hasActivePractice?: boolean;
  isApplying?: boolean;
}

export function JobDetailPanel({
  opportunity,
  onApply,
  getTimeAgo,
  hideAppliedMessage = false,
  hasActivePractice = false,
  isApplying = false,
}: JobDetailPanelProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [localIsSaved, setLocalIsSaved] = useState(opportunity.isSaved || false);
  const saveMutation = useSaveOpportunity();
  const unsaveMutation = useUnsaveOpportunity();
  const { success, error: showError } = useToast();

  // Usar el estado local si está disponible, de lo contrario usar el de la oportunidad
  const isSaved = useMemo(() => {
    return localIsSaved || opportunity.isSaved || false;
  }, [localIsSaved, opportunity.isSaved]);

  const hasLogo = opportunity.company?.logo && !imageError;

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        await unsaveMutation.mutateAsync(opportunity._id);
        setLocalIsSaved(false);
        success('Oportunidad eliminada', 'La oportunidad ha sido eliminada de tus guardadas.');
      } else {
        await saveMutation.mutateAsync(opportunity._id);
        setLocalIsSaved(true);
        success('Oportunidad guardada', 'La oportunidad ha sido guardada exitosamente.');
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'No se pudo guardar la oportunidad. Intenta nuevamente.';
      showError('Error', errorMessage);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-shrink-0 relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
            {hasLogo ? (
              <>
                {imageLoading && (
                  <div className="absolute inset-0 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center">
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 animate-spin" />
                  </div>
                )}
                <img
                  src={getImageUrl(opportunity.company?.logo)}
                  alt={opportunity.company?.name || 'Company logo'}
                  className={`w-full h-full rounded-lg object-cover border border-slate-200 dark:border-slate-700 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  } transition-opacity`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
              </>
            ) : (
              <div className="w-full h-full rounded-lg bg-primary flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <Building2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1 sm:gap-2 flex-wrap">
                  <span className="break-words">{opportunity.title}</span>
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1 sm:mb-2 break-words">
                  {opportunity.company?.name}
                </p>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {opportunity.modality && (
                    <span>
                      {opportunity.modality === 'remoto' ? 'En remoto' : 'Presencial'}
                    </span>
                  )}
                  {opportunity.career && (
                    <>
                      <span>•</span>
                      <span className="break-words">{opportunity.career.name}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Publicado {getTimeAgo(opportunity.createdAt)}</span>
                </div>
              </div>
              <button
                onClick={handleToggleSave}
                disabled={
                  opportunity.hasApplied ||
                  hasActivePractice ||
                  saveMutation.isPending ||
                  unsaveMutation.isPending
                }
                className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  opportunity.hasApplied
                    ? 'No puedes guardar una oportunidad a la que ya aplicaste'
                    : hasActivePractice
                    ? 'No puedes guardar oportunidades si tienes una práctica en curso'
                    : undefined
                }
              >
                {saveMutation.isPending || unsaveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-spin" />
                ) : isSaved ? (
                  <BookmarkCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
              {opportunity.modality && (
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium bg-secondary/20 dark:bg-secondary/10 text-secondary-foreground border border-secondary/30 rounded-full">
                  {opportunity.modality === 'remoto' ? 'En remoto' : 'Presencial'}
                </span>
              )}
              {opportunity.workType && (
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium bg-accent/20 dark:bg-accent/10 text-accent-foreground border border-accent/30 rounded-full">
                  {opportunity.workType === 'full-time'
                    ? 'Tiempo completo'
                    : 'Tiempo parcial'}
                </span>
              )}
              {opportunity.hasApplied && (
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-full flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3" />
                  Ya aplicaste
                </span>
              )}
            </div>

            {opportunity.hasApplied && !hideAppliedMessage && (
              <div className="mt-3 sm:mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  Ya has aplicado a esta oportunidad. Puedes ver el estado de tu solicitud en "Mis Solicitudes".
                </p>
              </div>
            )}

            {hasActivePractice && !opportunity.hasApplied && (
              <div className="mt-3 sm:mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  Tienes una práctica en curso. No puedes aplicar a nuevas oportunidades mientras tengas una práctica activa.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
              <Button
                onClick={onApply}
                disabled={opportunity.hasApplied || hasActivePractice || isApplying}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full sm:w-auto sm:flex-initial text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : opportunity.hasApplied ? (
                  <>
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Ya aplicaste
                  </>
                ) : hasActivePractice ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Práctica en curso
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Aplicar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleSave}
                disabled={
                  opportunity.hasApplied ||
                  hasActivePractice ||
                  saveMutation.isPending ||
                  unsaveMutation.isPending
                }
                className="w-full sm:w-auto border-secondary/30 dark:border-secondary/20 hover:bg-secondary/10 dark:hover:bg-secondary/5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveMutation.isPending || unsaveMutation.isPending ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-secondary animate-spin" />
                    {isSaved ? 'Eliminando...' : 'Guardando...'}
                  </>
                ) : isSaved ? (
                  <>
                    <BookmarkCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-secondary" />
                    Guardado
                  </>
                ) : (
                  <>
                    <Bookmark className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-secondary" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Description */}
        {opportunity.description && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3">
              Acerca de la oportunidad
            </h2>
            <div
              className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert [&_p]:mb-2 sm:[&_p]:mb-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-4 sm:[&_ul]:ml-6 [&_ol]:ml-4 sm:[&_ol]:ml-6 [&_ul]:space-y-1 sm:[&_ul]:space-y-2 [&_ol]:space-y-1 sm:[&_ol]:space-y-2 break-words"
              dangerouslySetInnerHTML={{ __html: opportunity.description }}
            />
          </div>
        )}

        {/* Activities */}
        {opportunity.activities && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3">
              Actividades a realizar
            </h2>
            <div
              className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert [&_p]:mb-2 sm:[&_p]:mb-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-4 sm:[&_ul]:ml-6 [&_ol]:ml-4 sm:[&_ol]:ml-6 [&_ul]:space-y-1 sm:[&_ul]:space-y-2 [&_ol]:space-y-1 sm:[&_ol]:space-y-2 break-words"
              dangerouslySetInnerHTML={{ __html: opportunity.activities }}
            />
          </div>
        )}

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">
              Vacantes disponibles
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-secondary flex-shrink-0" />
              {opportunity.availablePositions} posición
              {opportunity.availablePositions !== 1 ? 'es' : ''}
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

        {/* Company Info */}
        <CompanyInfoSection opportunity={opportunity} />
      </div>
    </div>
  );
}

