import { useState } from 'react';
import { Building2, MapPin, Loader2, CheckCircle } from 'lucide-react';
import type { Opportunity } from '@/types/opportunity.types';
import { getImageUrl } from '@/lib/utils';
import { StarRating } from '@/components/ui/star-rating';

interface JobListItemProps {
  opportunity: Opportunity;
  isSelected: boolean;
  onSelect: () => void;
  getTimeAgo: (date: string) => string;
}

export function JobListItem({
  opportunity,
  isSelected,
  onSelect,
  getTimeAgo,
}: JobListItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const hasLogo = opportunity.company?.logo && !imageError;

  return (
    <div
      onClick={onSelect}
      className={`p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-secondary/5 dark:hover:bg-secondary/10 transition-colors ${
        isSelected
          ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary'
          : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Company Logo */}
        <div className="flex-shrink-0 relative">
          {hasLogo ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center">
                  <Loader2 className="h-3 w-3 text-slate-400 animate-spin" />
                </div>
              )}
              <img
                src={getImageUrl(opportunity.company?.logo)}
                alt={opportunity.company?.name || 'Company logo'}
                className={`w-12 h-12 rounded-lg object-cover ${
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
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                {opportunity.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {opportunity.company?.name}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                {opportunity.modality && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-secondary" />
                    {opportunity.modality === 'remoto' ? 'En remoto' : 'Presencial'}
                  </span>
                )}
                {opportunity.career && (
                  <>
                    <span>•</span>
                    <span>{opportunity.career.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{getTimeAgo(opportunity.createdAt)}</span>
            {opportunity.totalHours && (
              <>
                <span>•</span>
                <span>{opportunity.totalHours} horas</span>
              </>
            )}
            {opportunity.hasApplied && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle className="h-3 w-3" />
                  Ya aplicaste
                </span>
              </>
            )}
          </div>

          {/* Match Score */}
          {opportunity.matchScore !== undefined &&
            opportunity.matchScore !== null && (
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={opportunity.matchScore} size={14} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Match con tu perfil
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

