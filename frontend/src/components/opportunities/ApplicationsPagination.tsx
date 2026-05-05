import { Button } from '@/components/ui/button';

interface ApplicationsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function ApplicationsPagination({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
}: ApplicationsPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        Mostrando {startIndex} - {endIndex} de {totalItems} aplicaciones
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-xs sm:text-sm"
        >
          Anterior
        </Button>
        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-2">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-xs sm:text-sm"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}

