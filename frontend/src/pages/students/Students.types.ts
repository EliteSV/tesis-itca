import type { Student } from '@/types/student.types';

export type SortField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'identificationNumber'
  | 'createdAt'
  | 'updatedAt';

export interface SortConfig {
  field: SortField;
  order: 'asc' | 'desc';
}

export interface Filters {
  careerId: string;
  status: string;
  practiceStatus: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface StudentTableProps {
  students: Student[];
  selectedIds: Set<string>;
  sort: SortConfig;
  onSort: (field: SortField) => void;
  onToggleSelectAll: () => void;
  onToggleSelect: (studentId: string) => void;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onView: (student: Student) => void;
  onStatusChange?: (student: Student) => void;
  onGeneratePassword?: (student: Student) => void;
  getStatusBadge: (status: string, isActive: boolean) => React.ReactNode;
  selectionState: 'none' | 'partial' | 'all';
  isReadOnly?: boolean;
}

export interface StudentFiltersProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onClearFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
}

