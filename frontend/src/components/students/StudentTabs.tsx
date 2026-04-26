import { User, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StudentTabsProps {
  activeTab: 'info' | 'activities';
  onTabChange: (tab: 'info' | 'activities') => void;
  activitiesCount: number;
}

export function StudentTabs({
  activeTab,
  onTabChange,
  activitiesCount,
}: StudentTabsProps) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
      <CardContent className="p-0">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onTabChange('info')}
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'info'
                ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User className="h-4 w-4" />
              <span>Información del Estudiante</span>
            </div>
          </button>
          <button
            onClick={() => onTabChange('activities')}
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'activities'
                ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Actividades ({activitiesCount})</span>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

