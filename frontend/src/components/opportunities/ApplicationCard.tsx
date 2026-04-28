import { Mail, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/date.utils';
import type { Application } from '@/types/opportunity.types';
import { StarRating } from '@/components/ui/star-rating';

interface ApplicationCardProps {
  application: Application;
  onClick: () => void;
  getStatusBadgeVariant: (status: string) => 'default' | 'destructive' | 'secondary' | 'outline';
  capitalizeFirst: (str: string) => string;
}

export function ApplicationCard({
  application,
  onClick,
  getStatusBadgeVariant,
  capitalizeFirst,
}: ApplicationCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-200 cursor-pointer ${
        application.status === 'aceptada'
          ? 'border-[#388E3C]/30 dark:border-[#388E3C]/30 bg-[#388E3C]/5 dark:bg-[#388E3C]/10'
          : application.status === 'rechazada'
            ? 'border-[#C62828]/30 dark:border-[#C62828]/30 bg-[#C62828]/5 dark:bg-[#C62828]/10'
            : ''
      }`}
    >
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100 wrap-break-word mb-1">
                  {application.student?.name || 'Estudiante'}
                </h3>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 shrink-0" />
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                    {application.student?.email}
                  </p>
                </div>
              </div>
              <Badge
                variant={getStatusBadgeVariant(application.status)}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit"
              >
                {capitalizeFirst(application.status)}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 mb-2">
              <Calendar className="h-3 w-3" />
              <span>Aplicó el {formatDate(application.createdAt)}</span>
            </div>
            <div className="mt-2">
              {application.matchScore !== undefined &&
              application.matchScore !== null ? (
                <StarRating rating={application.matchScore} size={14} />
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Evaluando...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

