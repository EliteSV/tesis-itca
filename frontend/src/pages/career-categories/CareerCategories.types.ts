import type { CareerCategory } from '@/types/career-category.types';

export type SortField = 'name' | 'isActive' | 'createdAt' | 'updatedAt';
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

export interface CareerCategoryTableProps {
  categories: CareerCategory[];
  selectedIds: Set<string>;
  sort: SortConfig;
  onSort: (field: SortField) => void;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onEdit: (category: CareerCategory) => void;
  onDelete: (category: CareerCategory) => void;
  onView: (category: CareerCategory) => void;
  onDuplicate?: (category: CareerCategory) => void;
  onStatusChange: (category: CareerCategory) => void;
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  selectionState: 'none' | 'partial' | 'all';
}

export interface CareerCategoryFiltersProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onClearFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
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

