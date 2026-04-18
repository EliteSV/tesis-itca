import type { Career } from '@/types/career.types';

export type SortField = 'name' | 'code' | 'duration' | 'isActive' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface Filters {
  status: string;
  categoryId: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CareerTableProps {
  careers: Career[];
  selectedIds: Set<string>;
  sort: SortConfig;
  onSort: (field: SortField) => void;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onEdit: (career: Career) => void;
  onDelete: (career: Career) => void;
  onView: (career: Career) => void;
  onDuplicate?: (career: Career) => void;
  onStatusChange: (career: Career) => void;
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  getCategoryName: (categoryId: Career['categoryId']) => string;
  selectionState: 'none' | 'partial' | 'all';
}

export interface CareerFiltersProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onClearFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  categoryOptions: Array<{ value: string; label: string }>;
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

