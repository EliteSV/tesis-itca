import { useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { Opportunity } from '@/types/opportunity.types';

interface OpportunityDialogContentProps {
  opportunity: Opportunity;
  coverLetter: string;
  setCoverLetter: (value: string) => void;
  disabled?: boolean;
}

export function OpportunityDialogContent({
  opportunity,
  coverLetter,
  setCoverLetter,
  disabled = false,
}: OpportunityDialogContentProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const hasLogo = opportunity.company?.logo && !imageError;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Opportunity Summary */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0 relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
            {hasLogo ? (
              <>
                {imageLoading && (
                  <div className="absolute inset-0 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center">
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 animate-spin" />
                  </div>
                )}
                <img
                  src={opportunity.company?.logo || ''}
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
            <h3 className="font-semibold text-sm sm:text-base md:text-lg text-slate-900 dark:text-slate-100 mb-1 break-words">
              {opportunity.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium break-words">
              {opportunity.company?.name}
            </p>
            {opportunity.career && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 break-words">
                {opportunity.career.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cover Letter */}
      <div className="space-y-2">
        <label className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
          Carta de Presentación{' '}
          <span className="text-slate-400 font-normal">(Opcional)</span>
        </label>
        <Textarea
          placeholder="Comparte por qué eres un buen candidato para esta oportunidad..."
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={6}
          disabled={disabled}
          className="resize-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Una carta de presentación puede ayudar a destacar tu aplicación
        </p>
      </div>
    </div>
  );
}

