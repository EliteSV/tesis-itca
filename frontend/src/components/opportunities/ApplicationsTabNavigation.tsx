import { cn } from '@/lib/utils';

export type ApplicationTabType = 'saved' | 'applied' | 'approved' | 'accepted' | 'rejected';

interface Tab {
  id: ApplicationTabType;
  label: string;
}

interface ApplicationsTabNavigationProps {
  activeTab: ApplicationTabType;
  onTabChange: (tab: ApplicationTabType) => void;
}

const tabs: Tab[] = [
  { id: 'saved', label: 'Guardado' },
  { id: 'applied', label: 'Solicitados' },
  { id: 'approved', label: 'Aprobadas' },
  { id: 'accepted', label: 'Aceptados' },
  { id: 'rejected', label: 'Rechazados' },
];

export function ApplicationsTabNavigation({
  activeTab,
  onTabChange,
}: ApplicationsTabNavigationProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-0 border-b border-slate-200 dark:border-slate-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer',
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

