import { useState, useMemo } from 'react';
import { useMyApplications, useSavedOpportunities } from '@/hooks/useOpportunities';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { ApplicationWithOpportunity } from '@/types/opportunity.types';
import { ApplicationStatusValues } from '@/types/opportunity.types';
import {
  ApplicationsTabNavigation,
  type ApplicationTabType,
} from '@/components/opportunities/ApplicationsTabNavigation';
import { ApplicationsEmptyState } from '@/components/opportunities/ApplicationsEmptyState';
import { ApplicationsContent } from '@/components/opportunities/ApplicationsContent';

const isApplicationTab = (tab: ApplicationTabType): boolean => {
  return tab === 'applied' || tab === 'approved' || tab === 'accepted' || tab === 'rejected';
};

export function MyApplicationsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<ApplicationTabType>('applied');
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationWithOpportunity | null>(null);
  const [selectedSavedOpportunity, setSelectedSavedOpportunity] =
    useState<string | null>(null);

  // Obtener aplicaciones
  const {
    data: applicationsData,
    isLoading: isLoadingApplications,
    isFetching: isFetchingApplications,
  } = useMyApplications({
    page,
    limit: 20,
  });

  // Obtener oportunidades guardadas
  const {
    data: savedOpportunitiesData,
    isLoading: isLoadingSaved,
    isFetching: isFetchingSaved,
  } = useSavedOpportunities({
    page,
    limit: 20,
  });

  const isLoading = isApplicationTab(activeTab)
    ? isLoadingApplications
    : isLoadingSaved;
  const isFetching = isApplicationTab(activeTab)
    ? isFetchingApplications
    : isFetchingSaved;

  const allApplications = useMemo(
    () => applicationsData?.data || [],
    [applicationsData?.data],
  );

  // Filtrar aplicaciones según el tab activo
  const displayedApplications = useMemo(() => {
    if (activeTab === 'applied') {
      return allApplications.filter(
        (app) => app.status === ApplicationStatusValues.PENDING,
      );
    }
    if (activeTab === 'approved') {
      return allApplications.filter(
        (app) => app.status === ApplicationStatusValues.APPROVED,
      );
    }
    if (activeTab === 'accepted') {
      return allApplications.filter(
        (app) => app.status === ApplicationStatusValues.ACCEPTED,
      );
    }
    if (activeTab === 'rejected') {
      return allApplications.filter(
        (app) => app.status === ApplicationStatusValues.REJECTED,
      );
    }
    return allApplications;
  }, [activeTab, allApplications]);

  const displayedSavedOpportunities = useMemo(
    () => savedOpportunitiesData?.data || [],
    [savedOpportunitiesData?.data],
  );

  // Determinar qué oportunidad mostrar (solo si hay una seleccionada)
  const displayedOpportunity = useMemo(() => {
    if (isApplicationTab(activeTab)) {
      if (selectedApplication?.opportunity) {
        return {
          ...selectedApplication.opportunity,
          hasApplied: true,
        };
      }
      return null;
    } else {
      if (selectedSavedOpportunity) {
        const found = displayedSavedOpportunities.find(
          (opp) => opp._id === selectedSavedOpportunity,
        );
        if (found) {
          const hasApplication = allApplications.some(
            (app) => app.opportunity?._id === found._id,
          );
          return {
            ...found,
            hasApplied: hasApplication,
          };
        }
      }
      return null;
    }
  }, [
    activeTab,
    selectedApplication,
    selectedSavedOpportunity,
    displayedSavedOpportunities,
    allApplications,
  ]);

  const displayedItems = isApplicationTab(activeTab)
    ? displayedApplications
    : displayedSavedOpportunities;
  const totalPages = isApplicationTab(activeTab)
    ? applicationsData?.totalPages || 0
    : savedOpportunitiesData?.totalPages || 0;

  const getTimeAgo = (date: string) => {
    if (!date || date.trim() === '') {
      return 'Fecha no disponible';
    }
    
    const now = new Date();
    const past = new Date(date);
    
    if (isNaN(past.getTime())) {
      return 'Fecha no disponible';
    }
    
    const diffInMs = now.getTime() - past.getTime();
    
    if (diffInMs < 0) {
      return 'Fecha no disponible';
    }
    
    const diffInWeeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));

    if (diffInWeeks === 0) return 'Hace menos de una semana';
    if (diffInWeeks === 1) return 'Hace 1 semana';
    return `Hace ${diffInWeeks} semanas`;
  };

  const handleTabChange = (tab: ApplicationTabType) => {
    setActiveTab(tab);
    setPage(1);
    setSelectedApplication(null);
    setSelectedSavedOpportunity(null);
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Mis anuncios de oportunidad
          </h1>
        </div>

        <ApplicationsTabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : displayedItems.length === 0 ? (
          <ApplicationsEmptyState activeTab={activeTab} />
        ) : (
          <ApplicationsContent
            applications={
              isApplicationTab(activeTab) ? displayedApplications : undefined
            }
            opportunities={
              activeTab === 'saved' ? displayedSavedOpportunities : undefined
            }
            selectedApplication={selectedApplication}
            selectedOpportunityId={selectedSavedOpportunity}
            displayedOpportunity={displayedOpportunity}
            onSelectApplication={setSelectedApplication}
            onSelectOpportunity={setSelectedSavedOpportunity}
            getTimeAgo={getTimeAgo}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="flex-1 sm:flex-initial bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            >
              Anterior
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400 px-4">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
              className="flex-1 sm:flex-initial bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
