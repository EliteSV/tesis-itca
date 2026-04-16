import { Loader2, Power, PowerOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionsProps {
  selectedCount: number;
  hasActive: boolean;
  hasInactive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

export function BulkActions({
  selectedCount,
  hasActive,
  hasInactive,
  onActivate,
  onDeactivate,
  onDelete,
  isLoading,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg sm:rounded-xl animate-in slide-in-from-top-2 duration-200">
      <span className="text-xs sm:text-sm font-medium text-primary-700 dark:text-primary-300 text-center sm:text-left">
        {selectedCount} usuario(s) seleccionado(s)
      </span>
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-2 sm:ml-auto w-full xs:w-auto">
        {hasInactive && (
          <Button
            variant="outline"
            size="sm"
            onClick={onActivate}
            disabled={isLoading}
            className="gap-1.5 flex-1 xs:flex-none transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation min-h-[44px] xs:min-h-0"
          >
            <Power className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Activar</span>
          </Button>
        )}
        {hasActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDeactivate}
            disabled={isLoading}
            className="gap-1.5 flex-1 xs:flex-none transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation min-h-[44px] xs:min-h-0"
          >
            <PowerOff className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Desactivar</span>
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isLoading}
          className="gap-1.5 flex-1 xs:flex-none transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation min-h-[44px] xs:min-h-0"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
          ) : (
            <Trash2 className="h-3.5 w-3.5 flex-shrink-0" />
          )}
          <span className="truncate">Eliminar</span>
        </Button>
      </div>
    </div>
  );
}

