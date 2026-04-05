import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export interface TableSortButtonProps<T extends string> {
  field: T;
  label: string;
  currentField: T;
  currentOrder: 'asc' | 'desc';
  onSort: (field: T) => void;
}

export function TableSortButton<T extends string>({
  field,
  label,
  currentField,
  currentOrder,
  onSort,
}: TableSortButtonProps<T>) {
  const isActive = currentField === field;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1.5 group font-semibold transition-all hover:opacity-80"
    >
      <span>{label}</span>
      <span
        className={`transition-all duration-200 ${
          isActive
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500'
        }`}
      >
        {isActive ? (
          currentOrder === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
}

