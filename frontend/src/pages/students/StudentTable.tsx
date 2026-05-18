import { GraduationCap, CheckSquare, Square } from 'lucide-react';
import { formatDate } from '@/utils/date.utils';
import {
  TableSortButton,
  TableCheckboxCell,
  TableActionsCell,
  TableActionsDropdownMobile,
} from '@/components/ui/table-components';
import type { StudentTableProps } from '@/pages/students/Students.types';

function getPracticeStatusBadge(status: string | null | undefined) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        Sin práctica
      </span>
    );
  }
  const isEnCurso = status === 'en_curso';
  const colorClass = isEnCurso
    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  const label = isEnCurso ? 'En Curso' : 'Finalizada';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-medium rounded-lg border transition-all duration-200 ${colorClass}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function StudentTable({
  students,
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
  isReadOnly = false,
}: StudentTableProps) {
  return (
    <>
      <div className="hidden md:block w-full overflow-x-auto">
        <div className="min-w-full px-3 sm:px-4 md:px-6">
          <table className="w-full min-w-[500px] lg:min-w-[600px] table-auto border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                {!isReadOnly && (
                  <TableCheckboxCell
                    isSelected={selectionState === 'all'}
                    onToggle={onToggleSelectAll}
                    selectionState={selectionState}
                    isHeader
                    className="text-left"
                  />
                )}
                <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[150px] sm:min-w-[180px]">
                  <TableSortButton
                    field="firstName"
                    label="Nombre Completo"
                    currentField={sort.field}
                    currentOrder={sort.order}
                    onSort={onSort}
                  />
                </th>
                <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell min-w-[150px]">
                  <TableSortButton
                    field="email"
                    label="Email"
                    currentField={sort.field}
                    currentOrder={sort.order}
                    onSort={onSort}
                  />
                </th>
                <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[120px]">
                  Identificación
                </th>
                <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell min-w-[150px]">
                  Carrera
                </th>
                <th className="text-left py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                  {isReadOnly ? 'Práctica' : 'Estado'}
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
                <th className="text-right py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky right-0 bg-white dark:bg-slate-900 z-30 w-16 sm:w-20 md:w-24 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {students.map((student, index) => (
                <tr
                  key={student._id}
                  className={`group transition-all duration-200 animate-in fade-in slide-in-from-left-4 ${
                    selectedIds.has(student._id)
                      ? 'bg-primary-50/50 dark:bg-primary-900/20'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {!isReadOnly && (
                    <TableCheckboxCell
                      isSelected={selectedIds.has(student._id)}
                      onToggle={() => onToggleSelect(student._id)}
                    />
                  )}
                  <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 min-w-[150px] sm:min-w-[180px]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                        <GraduationCap className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-slate-400 flex-shrink-0" />
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate min-w-0">
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 hidden md:table-cell min-w-[150px]">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                      {student.email}
                    </p>
                  </td>
                  <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[120px]">
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                      {student.identificationNumber}
                    </p>
                  </td>
                  <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 hidden lg:table-cell min-w-[150px]">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                      {student.career?.name || '-'}
                    </p>
                  </td>
                  <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap min-w-[120px]">
                    {isReadOnly
                      ? getPracticeStatusBadge(student.practiceStatus)
                      : getStatusBadge(student.status, student.isActive)}
                  </td>
                  <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap hidden sm:table-cell min-w-[100px]">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(student.createdAt)}
                    </p>
                  </td>
                  {!isReadOnly ? (
                    <TableActionsCell
                      itemId={student._id}
                      isSelected={selectedIds.has(student._id)}
                      actions={{
                        onView: onView ? () => onView(student) : undefined,
                        onEdit: onEdit ? () => onEdit(student) : undefined,
                        onToggleStatus: onStatusChange ? () => onStatusChange(student) : undefined,
                        onGeneratePassword: onGeneratePassword ? () => onGeneratePassword(student) : undefined,
                        onDelete: onDelete ? () => onDelete(student) : undefined,
                      }}
                      statusConfig={{
                        isActive: student.isActive,
                      }}
                      itemName={`${student.firstName} ${student.lastName}`}
                    />
                  ) : (
                    <td className="py-2 sm:py-3 md:py-4 px-1.5 sm:px-2 md:px-4 whitespace-nowrap">
                      {onView && (
                        <button
                          onClick={() => onView(student)}
                          className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                        >
                          Ver
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {students.map((student, index) => (
          <div
            key={student._id}
            className={`p-4 rounded-lg border transition-all duration-200 animate-in fade-in slide-in-from-left-4 ${
              selectedIds.has(student._id)
                ? 'bg-primary-50/50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {!isReadOnly && (
                  <button
                    onClick={() => onToggleSelect(student._id)}
                    className="mt-0.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all duration-200 active:scale-95 touch-manipulation"
                  >
                    {selectedIds.has(student._id) ? (
                      <CheckSquare className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-400" />
                    )}
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {student.firstName} {student.lastName}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {student.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    ID: {student.identificationNumber}
                  </p>
                  {student.career && (
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Carrera: {student.career.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 relative">
                {isReadOnly
                  ? getPracticeStatusBadge(student.practiceStatus)
                  : getStatusBadge(student.status, student.isActive)}
                {!isReadOnly ? (
                  <TableActionsDropdownMobile
                    itemId={student._id}
                    actions={{
                      onView: onView ? () => onView(student) : undefined,
                      onEdit: onEdit ? () => onEdit(student) : undefined,
                      onToggleStatus: onStatusChange ? () => onStatusChange(student) : undefined,
                      onGeneratePassword: onGeneratePassword ? () => onGeneratePassword(student) : undefined,
                      onDelete: onDelete ? () => onDelete(student) : undefined,
                    }}
                    statusConfig={{
                      isActive: student.isActive,
                    }}
                    itemName={`${student.firstName} ${student.lastName}`}
                  />
                ) : (
                  onView && (
                    <button
                      onClick={() => onView(student)}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium px-2 py-1 rounded transition-colors"
                    >
                      Ver
                    </button>
                  )
                )}
              </div>
            </div>
            <div className="space-y-2 pl-10">
              <div className="text-xs text-slate-500 dark:text-slate-500">
                Creado: {formatDate(student.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

