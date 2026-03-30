import { CheckSquare, Square, MinusSquare } from 'lucide-react';

export interface TableCheckboxCellProps {
  isSelected: boolean;
  onToggle: () => void;
  selectionState?: 'none' | 'partial' | 'all';
  isHeader?: boolean;
  className?: string;
}

export function TableCheckboxCell({
  isSelected,
  onToggle,
  selectionState,
  isHeader = false,
  className = '',
}: TableCheckboxCellProps) {
  const baseClasses = `py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 sticky left-0 z-20 transition-all duration-200 relative ${
    isSelected
      ? 'bg-primary-50/50 dark:bg-primary-900/20'
      : 'bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50'
  } after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-slate-200 dark:after:bg-slate-700 ${className}`;

  const headerClasses = isHeader
    ? 'w-10 sm:w-12 bg-white dark:bg-slate-900'
    : '';

  const getIcon = () => {
    if (isHeader) {
      if (selectionState === 'all') {
        return (
          <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 dark:text-primary-400" />
        );
      }
      if (selectionState === 'partial') {
        return (
          <MinusSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 dark:text-primary-400" />
        );
      }
      return (
        <Square className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
      );
    }

    return isSelected ? (
      <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 dark:text-primary-400" />
    ) : (
      <Square className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
    );
  };

  const CellTag = isHeader ? 'th' : 'td';
  
  return (
    <CellTag className={`${baseClasses} ${headerClasses}`}>
      <button
        onClick={onToggle}
        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label={isHeader ? 'Seleccionar todos' : 'Seleccionar'}
      >
        {getIcon()}
      </button>
    </CellTag>
  );
}

