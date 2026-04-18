import { FolderTree, CheckSquare, Square } from 'lucide-react';
import { formatDate } from '@/utils/date.utils';
import {
  TableSortButton,
  TableCheckboxCell,
  TableActionsCell,
  TableActionsDropdownMobile,
} from '@/components/ui/table-components';
import type { CareerCategoryTableProps } from '@/pages/career-categories/CareerCategories.types';

export function CareerCategoryTable({
  categories,
  selectedIds,
  sort,
  onSort,
  onToggleSelectAll,
  onToggleSelect,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  onStatusChange,
  getStatusBadge,
  selectionState,
}: CareerCategoryTableProps) {

  return (
    <>
      <div className="hidden md:block w-full overflow-x-auto">
        <div className="min-w-full px-3 sm:px-4 md:px-6">
          <table className="w-full min-w-[500px] lg:min-w-[600px] table-auto border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <TableCheckboxCell
                isSelected={selectionState === 'all'}
                onToggle={onToggleSelectAll}
                selectionState={selectionState}
                isHeader
                className="text-left"
              />
              <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[120px] sm:min-w-[140px]">
                <TableSortButton
                  field="name"
                  label="Nombre"
                  currentField={sort.field}
                  currentOrder={sort.order}
                  onSort={onSort}
                />
              </th>
              <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell min-w-[150px]">
                Descripción
              </th>
              <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[100px] sm:min-w-[120px]">
                Horas Prof.
              </th>
              <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[80px] sm:min-w-[90px]">
                Estado
              </th>
              <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell min-w-[100px]">
                <TableSortButton
                  field="createdAt"
                  label="Creado"
                  currentField={sort.field}
                  currentOrder={sort.order}
                  onSort={onSort}
                />
              </th>
              <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell min-w-[100px]">
                <TableSortButton
                  field="updatedAt"
                  label="Actualizado"
                  currentField={sort.field}
                  currentOrder={sort.order}
                  onSort={onSort}
                />
              </th>
              <th className="text-right py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky right-0 bg-white dark:bg-slate-900 z-30 w-16 sm:w-20 md:w-24 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {categories.map((category, index) => (
              <tr
                key={category._id}
                className={`group transition-all duration-200 animate-in fade-in slide-in-from-left-4 ${
                  selectedIds.has(category._id)
                    ? 'bg-primary-50/50 dark:bg-primary-900/20'
                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TableCheckboxCell
                  isSelected={selectedIds.has(category._id)}
                  onToggle={() => onToggleSelect(category._id)}
                />
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[120px] sm:min-w-[140px]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                      <FolderTree className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-slate-400 flex-shrink-0" />
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate min-w-0">
                        {category.name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 hidden md:table-cell min-w-[150px]">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                    {category.description || '-'}
                  </p>
                </td>
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[100px] sm:min-w-[120px]">
                  <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                    {category.requiredProfessionalHours || 0}
                  </p>
                </td>
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[80px] sm:min-w-[90px]">{getStatusBadge(category.isActive)}</td>
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap hidden sm:table-cell min-w-[100px]">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(category.createdAt)}
                  </p>
                </td>
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap hidden lg:table-cell min-w-[100px]">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(category.updatedAt)}
                  </p>
                </td>
                <TableActionsCell
                  itemId={category._id}
                  isSelected={selectedIds.has(category._id)}
                  actions={{
                    onView: onView ? () => onView(category) : undefined,
                    onEdit: onEdit ? () => onEdit(category) : undefined,
                    onDuplicate: onDuplicate ? () => onDuplicate(category) : undefined,
                    onToggleStatus: onStatusChange ? () => onStatusChange(category) : undefined,
                    onDelete: onDelete ? () => onDelete(category) : undefined,
                  }}
                  statusConfig={{
                    isActive: category.isActive,
                  }}
                  itemName={category.name}
                />
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {categories.map((category, index) => (
          <div
            key={category._id}
            className={`p-4 rounded-lg border transition-all duration-200 animate-in fade-in slide-in-from-left-4 ${
              selectedIds.has(category._id)
                ? 'bg-primary-50/50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => onToggleSelect(category._id)}
                  className="mt-0.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all duration-200 active:scale-95 touch-manipulation"
                >
                  {selectedIds.has(category._id) ? (
                    <CheckSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-400" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FolderTree className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {category.name}
                    </h3>
                  </div>
                  {category.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Horas Prof.: {category.requiredProfessionalHours || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 relative">
                {getStatusBadge(category.isActive)}
                <TableActionsDropdownMobile
                  itemId={category._id}
                  actions={{
                    onView: onView ? () => onView(category) : undefined,
                    onEdit: onEdit ? () => onEdit(category) : undefined,
                    onDuplicate: onDuplicate ? () => onDuplicate(category) : undefined,
                    onToggleStatus: onStatusChange ? () => onStatusChange(category) : undefined,
                    onDelete: onDelete ? () => onDelete(category) : undefined,
                  }}
                  statusConfig={{
                    isActive: category.isActive,
                  }}
                  itemName={category.name}
                />
              </div>
            </div>
            <div className="space-y-2 pl-10">
              <div className="text-xs text-slate-500 dark:text-slate-500">
                Creado: {formatDate(category.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>

    </>
  );
}

