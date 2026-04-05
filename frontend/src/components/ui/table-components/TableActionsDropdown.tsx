import { useRef, useEffect } from 'react';
import {
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Copy,
  Key,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';

export interface TableActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  ariaLabel?: string;
}

export interface TableActionsDropdownProps {
  itemId: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  actions: {
    onView?: () => void;
    onEdit?: () => void;
    onDuplicate?: () => void;
    onToggleStatus?: () => void;
    onDelete?: () => void;
    onGeneratePassword?: () => void;
  };
  statusConfig?: {
    isActive: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
  };
  itemName?: string;
}

export function TableActionsDropdown({
  itemId: _itemId, // eslint-disable-line @typescript-eslint/no-unused-vars
  isOpen,
  onToggle,
  onClose,
  actions,
  statusConfig,
  itemName = '',
}: TableActionsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Check if click is inside dropdown - if so, don't close
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }

      // Check if click is on the button that opens the dropdown
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }

      // Only close if clicking outside both dropdown and button
      onClose();
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleAction = (action: () => void) => {
    action();
    setTimeout(() => {
      onClose();
    }, 0);
  };

  return (
    <>
      <Tooltip content="Más opciones">
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 touch-manipulation cursor-pointer"
          aria-label={`Opciones para ${itemName}`}
        >
          <MoreVertical className="h-4 w-4 text-slate-500" />
        </button>
      </Tooltip>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-1 z-[99999] w-56 sm:w-52 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 sm:py-1.5 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {actions.onView && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAction(actions.onView!);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-base sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
              aria-label={`Ver detalles de ${itemName}`}
            >
              <Eye className="h-4 w-4 text-slate-400" />
              Ver
            </button>
          )}

          {actions.onEdit && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAction(actions.onEdit!);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-base sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
              aria-label={`Editar ${itemName}`}
            >
              <Pencil className="h-4 w-4 text-slate-400" />
              Editar
            </button>
          )}

          {actions.onDuplicate && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAction(actions.onDuplicate!);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-base sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
              aria-label={`Duplicar ${itemName}`}
            >
              <Copy className="h-4 w-4 text-slate-400" />
              Duplicar
            </button>
          )}

          {actions.onToggleStatus && statusConfig && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAction(actions.onToggleStatus!);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-base sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
              aria-label={
                statusConfig.isActive
                  ? `${statusConfig.inactiveLabel || 'Desactivar'} ${itemName}`
                  : `${statusConfig.activeLabel || 'Activar'} ${itemName}`
              }
            >
              {statusConfig.isActive ? (
                <>
                  <XCircle className="h-4 w-4 text-slate-400" />
                  {statusConfig.inactiveLabel || 'Desactivar'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-slate-400" />
                  {statusConfig.activeLabel || 'Activar'}
                </>
              )}
            </button>
          )}

          {actions.onGeneratePassword && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAction(actions.onGeneratePassword!);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-base sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
              aria-label={`Generar contraseña temporal para ${itemName}`}
            >
              <Key className="h-4 w-4 text-slate-400" />
              Generar Contraseña
            </button>
          )}

          {actions.onDelete && (
            <>
              <hr className="my-1.5 border-slate-100 dark:border-slate-700" />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleAction(actions.onDelete!);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label={`Eliminar ${itemName}`}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

