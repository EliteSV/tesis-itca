import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatisticsCardsProps {
  acceptedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export function StatisticsCards({
  acceptedCount,
  pendingCount,
  rejectedCount,
}: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="pt-3 pb-3 px-3 sm:pt-4 sm:pb-4 sm:px-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-[10px] xs:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Aceptadas
              </p>
              <p className="text-xl sm:text-2xl font-bold text-[#388E3C] dark:text-[#66BB6A]">
                {acceptedCount}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-[#388E3C]/10 dark:bg-[#388E3C]/20 rounded-lg flex-shrink-0">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-[#388E3C] dark:text-[#66BB6A]" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="pt-3 pb-3 px-3 sm:pt-4 sm:pb-4 sm:px-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-[10px] xs:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Pendientes
              </p>
              <p className="text-xl sm:text-2xl font-bold text-secondary dark:text-secondary">
                {pendingCount}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-secondary/20 dark:bg-secondary/10 rounded-lg flex-shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-secondary dark:text-secondary" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="pt-3 pb-3 px-3 sm:pt-4 sm:pb-4 sm:px-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-[10px] xs:text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Rechazadas
              </p>
              <p className="text-xl sm:text-2xl font-bold text-[#C62828] dark:text-[#EF5350]">
                {rejectedCount}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-[#C62828]/10 dark:bg-[#C62828]/20 rounded-lg flex-shrink-0">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#C62828] dark:text-[#EF5350]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

