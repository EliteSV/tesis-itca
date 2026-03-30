import { useState } from 'react';
import { TableActionsDropdown } from '@/components/ui/table-components/TableActionsDropdown';
import type { TableActionsDropdownProps } from '@/components/ui/table-components/TableActionsDropdown';

export interface TableActionsCellProps
  extends Omit<TableActionsDropdownProps, 'isOpen' | 'onToggle' | 'onClose'> {
  itemId: string;
  isSelected?: boolean;
  className?: string;
}

export function TableActionsCell({
  itemId,
  isSelected = false,
  className = '',
  ...dropdownProps
}: TableActionsCellProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <td
      className={`py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-right sticky right-0 w-16 sm:w-20 md:w-24 transition-all duration-200 ${
        isOpen ? 'z-[99999]' : 'z-30'
      } ${
        isSelected
          ? 'bg-primary-50/50 dark:bg-primary-900/20'
          : 'bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/50'
      } before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700 ${className}`}
    >
      <div className="relative">
        <TableActionsDropdown
          {...dropdownProps}
          itemId={itemId}
          isOpen={isOpen}
          onToggle={() => setIsOpen((prev) => !prev)}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </td>
  );
}

