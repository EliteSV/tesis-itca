import { useState, useMemo, useEffect } from 'react';
import {
  useAvailableOpportunitiesInfinite,
  useCreateApplication,
  useMyApplications,
} from '@/hooks/useOpportunities';
import { useToast } from '@/hooks/useToast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  Loader2,
  CheckCircle2,
  GraduationCap,
  Search,
} from 'lucide-react';
import type { Opportunity } from '@/types/opportunity.types';
import { ApplicationStatusValues } from '@/types/opportunity.types';
import { formatDate } from '@/utils/date.utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useCareers } from '@/hooks/useCareers';
import { JobDetailPanel } from '@/components/opportunities/JobDetailPanel';
import { OpportunitiesListPanel } from '@/components/opportunities/OpportunitiesListPanel';
import { OpportunityDialogContent } from '@/components/opportunities/OpportunityDialogContent';

export function StudentOpportunitiesPage() {
  const [search, setSearch] = useState('');
  const [careerId, setCareerId] = useState<string>('');
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const { success, error: showError } = useToast();

  const careersQueryParams = useMemo(() => ({ limit: 1000, isActive: true }), []);
  const { data: careersData } = useCareers(careersQueryParams);
  const careers = useMemo(() => careersData?.data || [], [careersData?.data]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useAvailableOpportunitiesInfinite({
    limit: 20,
    search: debouncedSearch || undefined,
    careerId: careerId || undefined,
  });

  const createApplicationMutation = useCreateApplication();

  // Obtener aplicaciones del estudiante para verificar si tiene una aceptada
  const { data: myApplicationsData } = useMyApplications({
    page: 1,
    limit: 100,
  });

  const hasAcceptedApplication = useMemo(() => {
    const applications = myApplicationsData?.data || [];
    return applications.some(
      (app) => app.status === ApplicationStatusValues.ACCEPTED,
    );
  }, [myApplicationsData?.data]);

  // Get all opportunities from all pages
  const displayedOpportunities = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data?.pages]);

  const totalResults = useMemo(() => {
    return data?.pages[0]?.total || 0;
  }, [data?.pages]);

  // Reset selected opportunity when filters change
  useEffect(() => {
    setSelectedOpportunity(null);
  }, [debouncedSearch, careerId]);

  // Determine which opportunity to display
  const displayedOpportunity = useMemo(() => {
    if (selectedOpportunity) {
      // Check if selected opportunity is still in the list and update it with latest data
      const updatedOpportunity = displayedOpportunities.find(
        (opp) => opp._id === selectedOpportunity._id,
      );
      if (updatedOpportunity) {
        return updatedOpportunity;
      }
    }
    // Return first available opportunity
    return displayedOpportunities[0] || null;
  }, [displayedOpportunities, selectedOpportunity]);

  const handleApply = (opportunity: Opportunity) => {
    if (hasAcceptedApplication) {
      return;
    }
    setSelectedOpportunity(opportunity);
    setCoverLetter('');
    setIsApplyDialogOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedOpportunity) return;

    try {
      await createApplicationMutation.mutateAsync({
        opportunityId: selectedOpportunity._id,
        coverLetter: coverLetter.trim() || undefined,
      });
      success(
        'Aplicación enviada',
        'Tu aplicación ha sido enviada exitosamente.',
      );
      setIsApplyDialogOpen(false);
      setCoverLetter('');
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        'No se pudo enviar la aplicación. Intenta nuevamente.';
      showError('Error', errorMessage);
    }
  };


  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace unos momentos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    if (diffInSeconds < 31536000) return `Hace ${Math.floor(diffInSeconds / 2592000)} meses`;
    return formatDate(date);
  };

  return (
    <div className="h-screen bg-[#f3f2ef] dark:bg-slate-900 flex flex-col overflow-hidden">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-4 md:py-6 flex flex-col flex-1 min-h-0">
        {/* Search Header */}
        <div className="mb-4 sm:mb-6 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-3 sm:p-4 border-t-2 border-t-secondary/20">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cargo, aptitud o empresa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Search is handled by debounce
                    }
                  }}
                  className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-primary"
                />
              </div>
              
              {/* Career Filter */}
              <div className="flex items-center gap-2 sm:w-64">
                <GraduationCap className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0 hidden sm:block" />
                <Select
                  value={careerId || 'all'}
                  onValueChange={(value) => {
                    setCareerId(value === 'all' ? '' : value);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-full bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 h-9 sm:h-10">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-500 dark:text-slate-400 sm:hidden" />
                      <SelectValue placeholder="Filtrar por carrera" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las carreras</SelectItem>
                    {careers.map((career) => (
                      <SelectItem key={career._id} value={career._id}>
                        {career.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12 sm:py-20 flex-1">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
          </div>
        ) : displayedOpportunities.length === 0 ? (
          <Card className="p-6 sm:p-8 md:p-12 text-center bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex-shrink-0">
            <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-slate-400 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No hay oportunidades disponibles
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              {search || careerId
                ? 'No se encontraron oportunidades con los filtros aplicados.'
                : 'No hay oportunidades disponibles en este momento.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-3 sm:gap-4 flex-1 min-h-0">
            {/* Left Panel - Job Listings */}
            <OpportunitiesListPanel
              opportunities={displayedOpportunities}
              selectedOpportunityId={displayedOpportunity?._id || null}
              totalResults={totalResults}
              onSelectOpportunity={setSelectedOpportunity}
              getTimeAgo={getTimeAgo}
              onLoadMore={() => fetchNextPage()}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />

            {/* Right Panel - Job Details */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden border-t-2 border-t-secondary/20 flex flex-col min-h-0">
              {displayedOpportunity ? (
                <JobDetailPanel
                  opportunity={displayedOpportunity}
                  onApply={() => handleApply(displayedOpportunity)}
                  getTimeAgo={getTimeAgo}
                  hasAcceptedApplication={hasAcceptedApplication}
                  isApplying={createApplicationMutation.isPending}
                />
              ) : (
                <div className="p-6 sm:p-8 md:p-12 text-center">
                  <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-slate-400 mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    Selecciona una oportunidad para ver los detalles
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Apply Dialog */}
        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 mx-2 sm:mx-4">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-semibold">Aplicar a esta oportunidad</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {hasAcceptedApplication
                  ? 'Ya tienes una solicitud aceptada. Solo puedes tener una solicitud aceptada a la vez.'
                  : 'Completa tu aplicación para esta posición'}
              </DialogDescription>
            </DialogHeader>

            {hasAcceptedApplication && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
                <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  Ya tienes una solicitud aceptada. Solo puedes tener una solicitud aceptada a la vez.
                </p>
              </div>
            )}

            {selectedOpportunity && (
              <OpportunityDialogContent
                opportunity={selectedOpportunity}
                coverLetter={coverLetter}
                setCoverLetter={setCoverLetter}
                disabled={hasAcceptedApplication}
              />
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsApplyDialogOpen(false)}
                disabled={createApplicationMutation.isPending}
                className="flex-1 sm:flex-initial"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitApplication}
                disabled={createApplicationMutation.isPending || hasAcceptedApplication}
                className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {createApplicationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Enviar Aplicación
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

