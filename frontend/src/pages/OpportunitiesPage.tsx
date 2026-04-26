import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Search, Eye, Edit, Trash2, Share2, GraduationCap, Users, FileText, Power, PowerOff, Calendar, MapPin, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useOpportunities, useDeleteOpportunity, useToggleOpportunityActiveStatus } from '@/hooks/useOpportunities';
import { useDebounce } from '@/hooks/useDebounce';
import { useToastContext } from '@/contexts/ToastContext';
import { formatDate } from '@/utils/date.utils';
import { OpportunityFormDialog } from '@/components/opportunities/OpportunityFormDialog';
import { ShareOpportunityDialog } from '@/components/opportunities/ShareOpportunityDialog';
import type { Opportunity } from '@/types/opportunity.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function OpportunitiesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] =
    useState<Opportunity | null>(null);
  const [sharingOpportunity, setSharingOpportunity] =
    useState<Opportunity | null>(null);
  const [viewingOpportunity, setViewingOpportunity] =
    useState<Opportunity | null>(null);
  const [opportunityToDelete, setOpportunityToDelete] =
    useState<Opportunity | null>(null);

  const limit = 10;
  const { data, isLoading } = useOpportunities({
    page,
    limit,
    search: debouncedSearch || undefined,
  });
  const deleteMutation = useDeleteOpportunity();
  const toggleActiveMutation = useToggleOpportunityActiveStatus();
  const toast = useToastContext();

  const opportunities = useMemo(() => {
    const opps = data?.data ?? [];
    // Debug: Log opportunity statuses
    if (opps.length > 0) {
      console.log('Opportunities statuses:', opps.map(o => ({ id: o._id, title: o.title, status: o.status })));
    }
    return opps;
  }, [data?.data]);
  const totalPages = data?.totalPages ?? 1;

  const handleCreate = useCallback(() => {
    setEditingOpportunity(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((opportunity: Opportunity) => {
    setViewingOpportunity(opportunity);
  }, []);

  const handleShare = useCallback((opportunity: Opportunity) => {
    setSharingOpportunity(opportunity);
  }, []);

  const handleViewDetails = useCallback((opportunity: Opportunity) => {
    navigate(`/opportunities/${opportunity._id}`);
  }, [navigate]);

  const handleDelete = useCallback((opportunity: Opportunity) => {
    setOpportunityToDelete(opportunity);
  }, []);

  const handleToggleActive = useCallback(async (opportunity: Opportunity) => {
    try {
      await toggleActiveMutation.mutateAsync(opportunity._id);
      toast.success(
        `Oportunidad ${opportunity.isActive ? 'desactivada' : 'activada'}`,
        `La oportunidad "${opportunity.title}" ha sido ${opportunity.isActive ? 'desactivada' : 'activada'} correctamente.`,
      );
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Error al cambiar el estado';
      toast.error('Error', errorMessage);
    }
  }, [toggleActiveMutation, toast]);

  const confirmDelete = useCallback(async () => {
    if (!opportunityToDelete) return;
    try {
      await deleteMutation.mutateAsync(opportunityToDelete._id);
      toast.success(
        'Oportunidad eliminada',
        `La oportunidad "${opportunityToDelete.title}" ha sido eliminada correctamente.`,
      );
      setOpportunityToDelete(null);
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Error al eliminar la oportunidad';
      toast.error('Error al eliminar', errorMessage);
    }
  }, [opportunityToDelete, deleteMutation, toast]);

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getStatusBadgeVariant = (status: string | undefined) => {
    if (!status) return 'outline';
    const normalizedStatus = status.toLowerCase().trim();
    switch (normalizedStatus) {
      case 'activa':
        return 'default';
      case 'cerrada':
        return 'destructive';
      case 'borrador':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                Oportunidades
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Gestiona las oportunidades de prácticas profesionales disponibles para estudiantes.
              </p>
            </div>
          </div>
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Oportunidad
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar oportunidades..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              No hay oportunidades
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {debouncedSearch
                ? 'No se encontraron oportunidades con ese criterio de búsqueda.'
                : 'Comienza creando tu primera oportunidad de prácticas profesionales.'}
            </p>
            {!debouncedSearch && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Oportunidad
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {opportunities.map((opportunity) => (
              <Card key={opportunity._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <CardTitle className="text-lg sm:text-xl break-words">
                          {opportunity.title}
                        </CardTitle>
                        <Badge 
                          variant={getStatusBadgeVariant(opportunity?.status)} 
                          className="w-fit"
                        >
                          {opportunity?.status ? capitalizeFirst(String(opportunity.status)) : 'Sin estado'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        {opportunity.career && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
                            {opportunity.career.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                          {opportunity.totalHours} horas
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          {opportunity.availablePositions} vacante(s)
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(opportunity)}
                        className="flex-1 sm:flex-initial"
                        title="Ver"
                      >
                        <Eye className="h-4 w-4 sm:mr-0 md:mr-2" />
                        <span className="hidden md:inline">Ver</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(opportunity)}
                        className="flex-1 sm:flex-initial"
                        title="Compartir"
                      >
                        <Share2 className="h-4 w-4 sm:mr-0 md:mr-2" />
                        <span className="hidden md:inline">Compartir</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(opportunity)}
                        className="flex-1 sm:flex-initial"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 sm:mr-0 md:mr-2" />
                        <span className="hidden md:inline">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(opportunity)}
                        className={`flex-1 sm:flex-initial ${!opportunity.isActive ? 'text-amber-600 hover:text-amber-700' : ''}`}
                        title={opportunity.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {opportunity.isActive ? (
                          <>
                            <PowerOff className="h-4 w-4 sm:mr-0 md:mr-2" />
                            <span className="hidden md:inline">Desactivar</span>
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 sm:mr-0 md:mr-2" />
                            <span className="hidden md:inline">Activar</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(opportunity)}
                        className="flex-1 sm:flex-initial text-destructive hover:text-destructive"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-0 md:mr-2" />
                        <span className="hidden md:inline">Eliminar</span>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleViewDetails(opportunity)}
                        className="w-full sm:w-auto"
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {opportunity.description && (
                  <CardContent>
                    <div
                      className="text-slate-600 dark:text-slate-400 line-clamp-2 prose prose-sm max-w-none dark:prose-invert [&_p]:mb-1 [&_*]:line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: opportunity.description }}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      Creada el {formatDate(opportunity.createdAt)}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-full sm:w-auto"
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm text-slate-600 dark:text-slate-400">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-full sm:w-auto"
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}

      <OpportunityFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        opportunity={editingOpportunity}
        onSuccess={() => {
          setIsFormOpen(false);
          setEditingOpportunity(null);
        }}
      />

      {sharingOpportunity && (
        <ShareOpportunityDialog
          open={!!sharingOpportunity}
          onOpenChange={(open) => !open && setSharingOpportunity(null)}
          opportunity={sharingOpportunity}
        />
      )}

      {viewingOpportunity && (
        <Dialog
          open={!!viewingOpportunity}
          onOpenChange={(open) => !open && setViewingOpportunity(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 break-words">
                    {viewingOpportunity.title}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge 
                      variant={getStatusBadgeVariant(viewingOpportunity?.status)} 
                      className="text-xs sm:text-sm px-2.5 py-1"
                    >
                      {viewingOpportunity?.status ? capitalizeFirst(String(viewingOpportunity.status)) : 'Sin estado'}
                    </Badge>
                    <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      Creada el {formatDate(viewingOpportunity.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <div className="px-6 py-6 space-y-6">
              {viewingOpportunity.description && (
                <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Descripción
                  </h3>
                  <div
                    className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed prose prose-sm sm:prose-base max-w-none dark:prose-invert [&_p]:mb-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-4 sm:[&_ul]:ml-6 [&_ol]:ml-4 sm:[&_ol]:ml-6 [&_ul]:space-y-1 [&_ol]:space-y-1"
                    dangerouslySetInnerHTML={{ __html: viewingOpportunity.description }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-primary/10 dark:bg-primary/20 rounded-lg flex-shrink-0">
                      <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                        Carrera
                      </p>
                      <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 break-words">
                        {viewingOpportunity.career?.name || 'No especificada'}
                      </p>
                      {viewingOpportunity.career?.code && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                          Código: {viewingOpportunity.career.code}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-secondary/20 dark:bg-secondary/10 rounded-lg flex-shrink-0">
                      <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                        Horas Totales
                      </p>
                      <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {viewingOpportunity.totalHours} horas
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                        Equivalente a {Math.round(viewingOpportunity.totalHours / 8)} días laborables
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-accent/20 dark:bg-accent/10 rounded-lg flex-shrink-0">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                        Vacantes Disponibles
                      </p>
                      <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {viewingOpportunity.availablePositions} posición{viewingOpportunity.availablePositions !== 1 ? 'es' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {viewingOpportunity.company && (
                  <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 bg-primary/10 dark:bg-primary/20 rounded-lg flex-shrink-0">
                        <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                          Empresa
                        </p>
                        <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 break-words">
                          {viewingOpportunity.company.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {viewingOpportunity.modality && (
                  <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 bg-secondary/20 dark:bg-secondary/10 rounded-lg flex-shrink-0">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                          Modalidad
                        </p>
                        <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                          {viewingOpportunity.modality === 'remoto' ? 'Remoto' : 'Presencial'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {viewingOpportunity.workType && (
                  <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 bg-accent/20 dark:bg-accent/10 rounded-lg flex-shrink-0">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                          Tipo de Trabajo
                        </p>
                        <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                          {viewingOpportunity.workType === 'full-time' ? 'Tiempo Completo' : 'Tiempo Parcial'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {viewingOpportunity.expirationDate && (
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                        Fecha de Expiración
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                        {formatDate(viewingOpportunity.expirationDate)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={!!opportunityToDelete}
        onOpenChange={(open) => !open && setOpportunityToDelete(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar oportunidad?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              oportunidad "{opportunityToDelete?.title}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpportunityToDelete(null)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
