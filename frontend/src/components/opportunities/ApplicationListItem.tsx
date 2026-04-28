import { useState } from 'react';
import { MapPin, Building2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { ApplicationWithOpportunity, Opportunity } from '@/types/opportunity.types';
import { ApplicationStatusValues } from '@/types/opportunity.types';
import { cn, getImageUrl } from '@/lib/utils';

interface ApplicationListItemProps {
  application?: ApplicationWithOpportunity;
  opportunity?: Opportunity;
  isSelected: boolean;
  onSelect: () => void;
  getTimeAgo: (date: string) => string;
  createdAt?: string;
}

export function ApplicationListItem({
  application,
  opportunity,
  isSelected,
  onSelect,
  getTimeAgo,
  createdAt,
}: ApplicationListItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Determinar qué oportunidad usar
  const opp = opportunity || application?.opportunity;
  const dateToShow = createdAt || application?.createdAt || '';
  const hasLogo = opp?.company?.logo && !imageError;

  return (
    <div
      onClick={onSelect}
      className={`p-4 border-b border-secondary border-t-0 border-l-0 border-r-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
        isSelected
          ? 'bg-primary/5 dark:bg-primary/10'
          : 'bg-background'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="flex-shrink-0 relative">
          {hasLogo ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 w-14 h-14 rounded bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                </div>
              )}
              <img
                src={getImageUrl(opp?.company?.logo)}
                alt={opp?.company?.name || 'Company logo'}
                className={`w-14 h-14 rounded object-cover border border-slate-200 dark:border-slate-700 ${
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
            <div className="w-14 h-14 rounded bg-primary flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                {opp?.title || 'Oportunidad no disponible'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                {opp?.company?.name || 'Empresa no disponible'}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  {opp?.modality
                    ? opp.modality === 'remoto'
                      ? 'En remoto'
                      : 'Presencial'
                    : 'Ubicación no disponible'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {application ? (
                    <span>Solicitado {getTimeAgo(dateToShow)}</span>
                  ) : (
                    <span>Guardado {getTimeAgo(dateToShow)}</span>
                  )}
                </div>
                {application && (
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1',
                      application.status === ApplicationStatusValues.ACCEPTED
                        ? 'bg-success/20 dark:bg-success/10 text-success dark:text-success border border-success/30'
                        : application.status === ApplicationStatusValues.REJECTED
                          ? 'bg-destructive/20 dark:bg-destructive/10 text-destructive dark:text-destructive border border-destructive/30'
                          : 'bg-secondary/20 dark:bg-secondary/10 text-secondary-foreground border border-secondary/30',
                    )}
                  >
                    {application.status === ApplicationStatusValues.ACCEPTED ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Aceptada
                      </>
                    ) : application.status === ApplicationStatusValues.REJECTED ? (
                      <>
                        <XCircle className="h-3 w-3" />
                        Rechazada
                      </>
                    ) : (
                      'Pendiente'
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

