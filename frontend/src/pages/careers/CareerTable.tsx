import { GraduationCap, FolderTree, CheckSquare, Square } from 'lucide-react';
import { formatDate } from '@/utils/date.utils';
import {
  TableSortButton,
  TableCheckboxCell,
  TableActionsCell,
  TableActionsDropdownMobile,
} from '@/components/ui/table-components';
import type { CareerTableProps } from '@/pages/careers/Careers.types';

export function CareerTable({
  careers,
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
  getCategoryName,
  selectionState,
}: CareerTableProps) {

  return (
    <>
      <div className="hidden md:block w-full overflow-x-auto">
        <div className="min-w-full px-3 sm:px-4 md:px-6">
          <table className="w-full min-w-[600px] lg:min-w-[700px] table-auto border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <TableCheckboxCell
                isSelected={selectionState === 'all'}
                onToggle={onToggleSelectAll}
                selectionState={selectionState}
                isHeader
                className="text-left"
              />
              <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[70px] sm:min-w-[90px]">
                <TableSortButton
                  field="code"
                  label="Código"
                  currentField={sort.field}
                  currentOrder={sort.order}
                  onSort={onSort}
                />
              </th>
              <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[120px] sm:min-w-[140px]">
                <TableSortButton
                  field="name"
                  label="Nombre"
                  currentField={sort.field}
                  currentOrder={sort.order}
                  onSort={onSort}
                />
              </th>
              <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell min-w-[120px]">
                Categoría
              </th>
              <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell whitespace-nowrap min-w-[90px]">
                <TableSortButton
                  field="duration"
                  label="Duración"
                  currentField={sort.field}
                  currentOrder={sort.order}
                  onSort={onSort}
                />
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
              <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[80px] sm:min-w-[90px]">
                Estado
              </th>
              <th className="text-right py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky right-0 bg-white dark:bg-slate-900 z-30 w-16 sm:w-20 md:w-24 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {careers.map((career, index) => (
              <tr
                key={career._id}
                className={`group transition-all duration-200 animate-in fade-in slide-in-from-left-4 ${
                  selectedIds.has(career._id)
                    ? 'bg-primary-50/50 dark:bg-primary-900/20'
                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TableCheckboxCell
                  isSelected={selectedIds.has(career._id)}
                  onToggle={() => onToggleSelect(career._id)}
                />
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[70px] sm:min-w-[90px]">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {career.code}
                    </p>
                  </div>
                </td>
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[120px] sm:min-w-[140px]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                      <GraduationCap className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-slate-400 flex-shrink-0" />
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate min-w-0">
                        {career.name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 hidden md:table-cell min-w-[120px]">
                  <div className="flex items-center gap-1 min-w-0">
                    <FolderTree className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                      {getCategoryName(career.categoryId)}
                    </p>
                  </div>
                </td>
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 hidden lg:table-cell whitespace-nowrap min-w-[90px]">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                    {career.duration ? `${career.duration} años` : '-'}
                  </p>
                </td>
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap hidden sm:table-cell min-w-[100px]">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(career.createdAt)}
                  </p>
                </td>
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap hidden lg:table-cell min-w-[100px]">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(career.updatedAt)}
                  </p>
                </td>
                <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[80px] sm:min-w-[90px]">{getStatusBadge(career.isActive)}</td>
                <TableActionsCell
                  itemId={career._id}
                  isSelected={selectedIds.has(career._id)}
                  actions={{
                    onView: onView ? () => onView(career) : undefined,
                    onEdit: onEdit ? () => onEdit(career) : undefined,
                    onDuplicate: onDuplicate ? () => onDuplicate(career) : undefined,
                    onToggleStatus: onStatusChange ? () => onStatusChange(career) : undefined,
                    onDelete: onDelete ? () => onDelete(career) : undefined,
                  }}
                  statusConfig={{
                    isActive: career.isActive,
                  }}
                  itemName={career.name}
                />
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {careers.map((career, index) => (
          <div
            key={career._id}
            className={`p-4 rounded-lg border transition-all duration-200 animate-in fade-in slide-in-from-left-4 ${
              selectedIds.has(career._id)
                ? 'bg-primary-50/50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => onToggleSelect(career._id)}
                  className="mt-0.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all duration-200 active:scale-95 touch-manipulation"
                >
                  {selectedIds.has(career._id) ? (
                    <CheckSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-400" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {career.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    {career.code}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 relative">
                {getStatusBadge(career.isActive)}
                <TableActionsDropdownMobile
                  itemId={career._id}
                  actions={{
                    onView: onView ? () => onView(career) : undefined,
                    onEdit: onEdit ? () => onEdit(career) : undefined,
                    onDuplicate: onDuplicate ? () => onDuplicate(career) : undefined,
                    onToggleStatus: onStatusChange ? () => onStatusChange(career) : undefined,
                    onDelete: onDelete ? () => onDelete(career) : undefined,
                  }}
                  statusConfig={{
                    isActive: career.isActive,
                  }}
                  itemName={career.name}
                />
              </div>
            </div>
            <div className="space-y-2 pl-10">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <FolderTree className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{getCategoryName(career.categoryId)}</span>
              </div>
              {career.duration && (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Duración: {career.duration} años
                </div>
              )}
              <div className="text-xs text-slate-500 dark:text-slate-500">
                Creado: {formatDate(career.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>

    </>
  );
}

