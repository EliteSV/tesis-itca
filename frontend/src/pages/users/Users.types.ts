import type { User } from '@/types/user.types';

export type SortField = 'name' | 'email' | 'isActive' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface Filters {
  status: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserTableProps {
  users: User[];
  selectedIds: Set<string>;
  sort: SortConfig;
  onSort: (field: SortField) => void;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
  onStatusChange: (user: User) => void;
  onGeneratePassword?: (user: User) => void;
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  selectionState: 'none' | 'partial' | 'all';
}

export interface BulkActionsProps {
  selectedCount: number;
  hasActive: boolean;
  hasInactive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

