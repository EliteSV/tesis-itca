import { useState } from 'react';
import { TableActionsDropdown } from '@/components/ui/table-components/TableActionsDropdown';
import type { TableActionsDropdownProps } from '@/components/ui/table-components/TableActionsDropdown';

export interface TableActionsDropdownMobileProps
  extends Omit<TableActionsDropdownProps, 'isOpen' | 'onToggle' | 'onClose'> {
  itemId: string;
}

export function TableActionsDropdownMobile({
  itemId,
  ...dropdownProps
}: TableActionsDropdownMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <TableActionsDropdown
        {...dropdownProps}
        itemId={itemId}
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

