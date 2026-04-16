import { User, Mail, CheckSquare, Square } from 'lucide-react';
import { formatDate } from '@/utils/date.utils';
import { Badge } from '@/components/ui/badge';
import { getRoleLabel } from '@/utils/role.utils';
import { UserRole } from '@/types/auth.types';
import {
  TableSortButton,
  TableCheckboxCell,
  TableActionsCell,
  TableActionsDropdownMobile,
} from '@/components/ui/table-components';
import type { UserTableProps } from '@/pages/users/Users.types';

export function UserTable({
  users,
  selectedIds,
  sort,
  onSort,
  onToggleSelectAll,
  onToggleSelect,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  onGeneratePassword,
  getStatusBadge,
  selectionState,
}: UserTableProps) {
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
                <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[150px] sm:min-w-[180px]">
                  <TableSortButton
                    field="name"
                    label="Nombre"
                    currentField={sort.field}
                    currentOrder={sort.order}
                    onSort={onSort}
                  />
                </th>
                <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[180px] sm:min-w-[200px]">
                  <TableSortButton
                    field="email"
                    label="Email"
                    currentField={sort.field}
                    currentOrder={sort.order}
                    onSort={onSort}
                  />
                </th>
                <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[100px] sm:min-w-[120px]">
                  Rol
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
              {users.map((userItem, index) => (
                <tr
                  key={userItem._id}
                  className={`group transition-all duration-200 animate-in fade-in slide-in-from-left-4 ${
                    selectedIds.has(userItem._id)
                      ? 'bg-primary-50/50 dark:bg-primary-900/20'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TableCheckboxCell
                    isSelected={selectedIds.has(userItem._id)}
                    onToggle={() => onToggleSelect(userItem._id)}
                  />
                  <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[150px] sm:min-w-[180px]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                        <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-slate-400 flex-shrink-0" />
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate min-w-0">
                          {userItem.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[180px] sm:min-w-[200px]">
                    <div className="flex items-center gap-1 min-w-0">
                      <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                        {userItem.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[100px] sm:min-w-[120px]">
                    <Badge
                      variant={
                        userItem.role === UserRole.ADMIN
                          ? 'default'
                          : userItem.role === UserRole.COORDINADOR
                            ? 'secondary'
                            : 'outline'
                      }
                      className="text-xs"
                    >
                      {getRoleLabel(userItem.role)}
                    </Badge>
                  </td>
                  <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[80px] sm:min-w-[90px]">
                    {getStatusBadge(userItem.isActive)}
                  </td>
                  <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap hidden sm:table-cell min-w-[100px]">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(userItem.createdAt)}
                    </p>
                  </td>
                  <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap hidden lg:table-cell min-w-[100px]">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(userItem.updatedAt)}
                    </p>
                  </td>
                  <TableActionsCell
                    itemId={userItem._id}
                    isSelected={selectedIds.has(userItem._id)}
                    actions={{
                      onView: onView ? () => onView(userItem) : undefined,
                      onEdit: onEdit ? () => onEdit(userItem) : undefined,
                      onToggleStatus: onStatusChange
                        ? () => onStatusChange(userItem)
                        : undefined,
                      onGeneratePassword: onGeneratePassword
                        ? () => onGeneratePassword(userItem)
                        : undefined,
                      onDelete: onDelete ? () => onDelete(userItem) : undefined,
                    }}
                    statusConfig={{
                      isActive: userItem.isActive,
                    }}
                    itemName={userItem.name}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {users.map((userItem) => (
          <div
            key={userItem._id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => onToggleSelect(userItem._id)}
                  className="mt-1 flex-shrink-0"
                >
                  {selectedIds.has(userItem._id) ? (
                    <CheckSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-400" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {userItem.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {userItem.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        userItem.role === UserRole.ADMIN
                          ? 'default'
                          : userItem.role === UserRole.COORDINADOR
                            ? 'secondary'
                            : 'outline'
                      }
                      className="text-xs"
                    >
                      {getRoleLabel(userItem.role)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(userItem.isActive)}
                  </div>
                </div>
              </div>
              <TableActionsDropdownMobile
                itemId={userItem._id}
                actions={{
                  onView: onView ? () => onView(userItem) : undefined,
                  onEdit: onEdit ? () => onEdit(userItem) : undefined,
                  onToggleStatus: onStatusChange
                    ? () => onStatusChange(userItem)
                    : undefined,
                  onGeneratePassword: onGeneratePassword
                    ? () => onGeneratePassword(userItem)
                    : undefined,
                  onDelete: onDelete ? () => onDelete(userItem) : undefined,
                }}
                statusConfig={{
                  isActive: userItem.isActive,
                }}
                itemName={userItem.name}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

