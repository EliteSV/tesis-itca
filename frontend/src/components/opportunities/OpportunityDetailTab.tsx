import { AlertCircle, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatisticsCards } from './StatisticsCards';
import { CompanyInfoSection } from './CompanyInfoSection';
import type { Opportunity } from '@/types/opportunity.types';

interface OpportunityDetailTabProps {
  opportunity: Opportunity;
  acceptedCount: number;
  pendingCount: number;
  rejectedCount: number;
  availablePositions: number;
  isClosed: boolean;
  canAcceptMore: boolean;
  remainingPositions: number;
}

export function OpportunityDetailTab({
  opportunity,
  acceptedCount,
  pendingCount,
  rejectedCount,
  availablePositions,
  isClosed,
  canAcceptMore,
  remainingPositions,
}: OpportunityDetailTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <StatisticsCards
        acceptedCount={acceptedCount}
        pendingCount={pendingCount}
        rejectedCount={rejectedCount}
      />

      <CompanyInfoSection opportunity={opportunity} />

      {!canAcceptMore && (
        <Card
          className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${
            isClosed
              ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
              : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
          }`}
        >
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                  isClosed
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              />
              <div>
                <p
                  className={`text-sm font-semibold mb-1 ${
                    isClosed
                      ? 'text-red-900 dark:text-red-100'
                      : 'text-amber-900 dark:text-amber-100'
                  }`}
                >
                  {isClosed ? 'Oportunidad cerrada' : 'Vacantes completas'}
                </p>
                <p
                  className={`text-xs sm:text-sm ${
                    isClosed
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {isClosed
                    ? 'Esta oportunidad está cerrada. No se pueden aceptar más aplicaciones.'
                    : `Ya se han aceptado todas las vacantes disponibles (${acceptedCount}/${availablePositions}). No se pueden aceptar más aplicaciones.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {canAcceptMore && (
        <Card className="bg-white dark:bg-slate-800 border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Vacantes disponibles
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Puedes aceptar {remainingPositions} aplicación
                  {remainingPositions !== 1 ? 'es' : ''} más.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

