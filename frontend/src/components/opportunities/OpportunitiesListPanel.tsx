import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import type { Opportunity } from '@/types/opportunity.types';
import { JobListItem } from './JobListItem';

interface OpportunitiesListPanelProps {
  opportunities: Opportunity[];
  selectedOpportunityId: string | null;
  totalResults: number;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  getTimeAgo: (date: string) => string;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

export function OpportunitiesListPanel({
  opportunities,
  selectedOpportunityId,
  totalResults,
  onSelectOpportunity,
  getTimeAgo,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}: OpportunitiesListPanelProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !onLoadMore || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      {
        rootMargin: '100px',
      },
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden border-t-2 border-t-accent/20 flex flex-col h-full min-h-0">
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 bg-secondary/5 dark:bg-secondary/5 flex-shrink-0">
        <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Principales oportunidades que te recomendamos
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
          Las recomendaciones se basan en tu perfil, preferencias y actividad
        </p>
        <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
          {totalResults} resultados
        </p>
      </div>
      <div className="overflow-y-auto flex-1 min-h-0">
        {opportunities.map((opportunity) => (
          <JobListItem
            key={opportunity._id}
            opportunity={opportunity}
            isSelected={selectedOpportunityId === opportunity._id}
            onSelect={() => onSelectOpportunity(opportunity)}
            getTimeAgo={getTimeAgo}
          />
        ))}
        {hasNextPage && (
          <div ref={loadMoreRef} className="p-4 flex justify-center">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

