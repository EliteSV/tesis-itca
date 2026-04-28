import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OpportunitiesSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

export function OpportunitiesSearchBar({
  search,
  onSearchChange,
  onSearch,
}: OpportunitiesSearchBarProps) {
  return (
    <div className="mb-3 sm:mb-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-3 sm:p-4 border-t-2 border-t-secondary/20">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Cargo, aptitud o empresa..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearch();
                }
              }}
              className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary"
            />
          </div>
          <Button
            onClick={onSearch}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 sm:h-10 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
          >
            Buscar
          </Button>
        </div>
      </div>
    </div>
  );
}

