import { FileText, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface OpportunityTabsProps {
  activeTab: 'detail' | 'applications';
  onTabChange: (tab: 'detail' | 'applications') => void;
  applicationsCount: number;
}

export function OpportunityTabs({
  activeTab,
  onTabChange,
  applicationsCount,
}: OpportunityTabsProps) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
      <CardContent className="p-0">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onTabChange('detail')}
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'detail'
                ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Detalle</span>
            </div>
          </button>
          <button
            onClick={() => onTabChange('applications')}
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'applications'
                ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              <span>Solicitudes ({applicationsCount})</span>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

