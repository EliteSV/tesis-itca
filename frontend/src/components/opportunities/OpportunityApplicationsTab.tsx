import { Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApplicationFilters } from './ApplicationFilters';
import { ApplicationCard } from './ApplicationCard';
import { ApplicationsPagination } from './ApplicationsPagination';
import type { Application } from '@/types/opportunity.types';

interface OpportunityApplicationsTabProps {
  applications: Application[] | undefined;
  isLoading: boolean;
  filterStatus: string;
  onFilterChange: (status: string) => void;
  onApplicationClick: (application: Application) => void;
  paginatedApplications: Application[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalFiltered: number;
  totalCount: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  getStatusBadgeVariant: (status: string) => 'default' | 'destructive' | 'secondary' | 'outline';
  capitalizeFirst: (str: string) => string;
}

export function OpportunityApplicationsTab({
  applications,
  isLoading,
  filterStatus,
  onFilterChange,
  onApplicationClick,
  paginatedApplications,
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalFiltered,
  totalCount,
  pendingCount,
  acceptedCount,
  rejectedCount,
  getStatusBadgeVariant,
  capitalizeFirst,
}: OpportunityApplicationsTabProps) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Users className="h-5 w-5" />
            Aplicaciones ({totalCount})
          </CardTitle>
          {applications && applications.length > 0 && (
            <ApplicationFilters
              filterStatus={filterStatus}
              onFilterChange={onFilterChange}
              totalCount={totalCount}
              pendingCount={pendingCount}
              acceptedCount={acceptedCount}
              rejectedCount={rejectedCount}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : !applications || applications.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              No hay aplicaciones
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Aún no se han recibido aplicaciones para esta oportunidad.
            </p>
          </div>
        ) : totalFiltered === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              No hay aplicaciones con este filtro
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              No se encontraron aplicaciones con el estado seleccionado.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4">
              {paginatedApplications.map((application) => (
                <ApplicationCard
                  key={application._id}
                  application={application}
                  onClick={() => onApplicationClick(application)}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                  capitalizeFirst={capitalizeFirst}
                />
              ))}
            </div>

            <ApplicationsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={totalFiltered}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

