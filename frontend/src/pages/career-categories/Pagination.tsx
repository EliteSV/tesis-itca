import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const start = total > 0 ? (page - 1) * limit + 1 : 0;
  const end = total > 0 ? Math.min(page * limit, total) : 0;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-3 sm:gap-4 py-2 px-3 sm:px-4 md:px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap text-center sm:text-left">
          Mostrando{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {start}
          </span>{' '}
          -{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {end}
          </span>{' '}
          de{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {total}
          </span>{' '}
          registros
        </p>

        <div className="flex items-center gap-1 sm:gap-1.5 sm:gap-2 w-full sm:w-auto justify-center">
          <button
            disabled={page === 1}
            onClick={() => page !== 1 && onPageChange(1)}
            className="h-9 w-9 sm:h-8 sm:w-8 p-0 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:pointer-events-auto flex items-center justify-center touch-manipulation"
            title="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            disabled={page === 1}
            onClick={() => page !== 1 && onPageChange(page - 1)}
            className="h-9 w-9 sm:h-8 sm:w-8 p-0 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:pointer-events-auto flex items-center justify-center touch-manipulation"
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-0.5 sm:gap-1 flex-1 sm:flex-initial justify-center max-w-full overflow-x-auto">
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1.5 sm:px-2 text-slate-400 dark:text-slate-500 text-xs sm:text-sm"
                  >
                    ...
                  </span>
                );
              }

              const pageNumber = pageNum as number;
              const isActive = pageNumber === page;

              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`h-9 min-w-[36px] sm:h-8 sm:min-w-[32px] px-2 sm:px-2.5 rounded-md border transition-all duration-200 font-medium text-sm sm:text-sm touch-manipulation ${
                    isActive
                      ? 'bg-[#B1291D] text-white border-[#B1291D] hover:bg-[#9A2418] dark:bg-[#B1291D] dark:text-white dark:border-[#B1291D] dark:hover:bg-[#9A2418] shadow-md cursor-default'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 cursor-pointer'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            disabled={page >= totalPages}
            onClick={() => page < totalPages && onPageChange(page + 1)}
            className="h-9 w-9 sm:h-8 sm:w-8 p-0 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:pointer-events-auto flex items-center justify-center touch-manipulation"
            title="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => page < totalPages && onPageChange(totalPages)}
            className="h-9 w-9 sm:h-8 sm:w-8 p-0 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:pointer-events-auto flex items-center justify-center touch-manipulation"
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

