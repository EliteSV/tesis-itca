import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  useOpportunity,
  useOpportunityApplications,
  useUpdateApplicationStatus,
  useToggleOpportunityActiveStatus,
} from '@/hooks/useOpportunities';
import { useStudent } from '@/hooks/useStudents';
import { useToastContext } from '@/contexts/ToastContext';
import type { Application, ApplicationStatus } from '@/types/opportunity.types';
import { ApplicationStatusValues } from '@/types/opportunity.types';
import { OpportunityHeaderCard } from '@/components/opportunities/OpportunityHeaderCard';
import { OpportunityTabs } from '@/components/opportunities/OpportunityTabs';
import { OpportunityDetailTab } from '@/components/opportunities/OpportunityDetailTab';
import { OpportunityApplicationsTab } from '@/components/opportunities/OpportunityApplicationsTab';
import { AcceptApplicationDialog } from '@/components/opportunities/AcceptApplicationDialog';
import { RejectApplicationDialog } from '@/components/opportunities/RejectApplicationDialog';
import { ApplicationDetailDialog } from '@/components/opportunities/ApplicationDetailDialog';
import { StudentProfileDialog } from '@/components/opportunities/StudentProfileDialog';

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [selectedApplicationDetail, setSelectedApplicationDetail] = useState<Application | null>(null);
  const [applicationStudentId, setApplicationStudentId] = useState<string | null>(null);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'detail' | 'applications'>('detail');
  const applicationsPerPage = 10;

  const { data: opportunity, isLoading: isLoadingOpportunity } =
    useOpportunity(id || '');
  const { data: applications, isLoading: isLoadingApplications } =
    useOpportunityApplications(id || '');
  
  // Ensure viewingStudentId is always a valid string
  const validStudentId = useMemo(() => {
    if (!viewingStudentId) return '';
    // Convert to string and validate
    const id = String(viewingStudentId).trim();
    // Prevent [object Object] from being passed
    if (id === '[object Object]' || id === 'object Object' || id === '' || id.includes('object')) {
      console.error('Invalid studentId detected:', viewingStudentId);
      return '';
    }
    return id;
  }, [viewingStudentId]);

  // Ensure applicationStudentId is always a valid string
  const validApplicationStudentId = useMemo(() => {
    if (!applicationStudentId) return '';
    // Convert to string and validate
    const id = String(applicationStudentId).trim();
    // Prevent [object Object] from being passed
    if (id === '[object Object]' || id === 'object Object' || id === '' || id.includes('object')) {
      console.error('Invalid applicationStudentId detected:', applicationStudentId);
      return '';
    }
    return id;
  }, [applicationStudentId]);

  const { data: viewingStudent, isLoading: isLoadingStudent, error: studentError } = useStudent(
    validStudentId,
  );
  
  const { data: applicationStudent, isLoading: isLoadingApplicationStudent } = useStudent(
    validApplicationStudentId,
  );
  const updateStatusMutation = useUpdateApplicationStatus();
  const toggleActiveMutation = useToggleOpportunityActiveStatus();
  const toast = useToastContext();
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Debug: Log opportunity data
  useEffect(() => {
    if (opportunity) {
      console.log('Opportunity data:', {
        company: opportunity.company,
        companyLogo: opportunity.company?.logo,
        baseUrl,
        fullUrl: opportunity.company?.logo ? `${baseUrl}${opportunity.company.logo}` : 'No logo'
      });
    }
  }, [opportunity, baseUrl]);

  // Log error for debugging
  useEffect(() => {
    if (studentError && viewingStudentId) {
      console.error('Error loading student:', studentError);
      toast.error('Error', 'No se pudo cargar la información del estudiante');
    }
  }, [studentError, viewingStudentId, toast]);


  const handleAccept = useCallback((application: Application) => {
    setSelectedApplication(application);
    setActionType('accept');
    setShowConfirmDialog(true);
  }, []);

  const handleReject = useCallback((application: Application) => {
    setSelectedApplication(application);
    setActionType('reject');
    setRejectionReason('');
    setShowConfirmDialog(true);
  }, []);

  const handleToggleActive = useCallback(async () => {
    if (!opportunity) return;
    try {
      await toggleActiveMutation.mutateAsync(opportunity._id);
      toast.success(
        `Oportunidad ${opportunity.isActive ? 'desactivada' : 'activada'}`,
        `La oportunidad ha sido ${opportunity.isActive ? 'desactivada' : 'activada'} correctamente.`,
      );
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Error al cambiar el estado';
      toast.error('Error', errorMessage);
    }
  }, [opportunity, toggleActiveMutation, toast]);

  const confirmAction = useCallback(async () => {
    if (!selectedApplication || !actionType) return;

    try {
      const status: ApplicationStatus =
        actionType === 'accept'
          ? ApplicationStatusValues.ACCEPTED
          : ApplicationStatusValues.REJECTED;

      await updateStatusMutation.mutateAsync({
        applicationId: selectedApplication._id,
        data: {
          status,
          rejectionReason:
            actionType === 'reject' ? rejectionReason : undefined,
        },
        opportunityId: id,
      });

      toast.success(
        `Aplicación ${actionType === 'accept' ? 'aceptada' : 'rechazada'}`,
        `La aplicación ha sido ${actionType === 'accept' ? 'aceptada' : 'rechazada'} correctamente.`,
      );

      setSelectedApplication(null);
      setActionType(null);
      setRejectionReason('');
      setShowConfirmDialog(false);
      setSelectedApplicationDetail(null);
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Error al actualizar la aplicación';
      toast.error('Error', errorMessage);
    }
  }, [selectedApplication, actionType, rejectionReason, updateStatusMutation, toast, id]);

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };


  const getApplicationStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'aceptada':
        return 'default';
      case 'rechazada':
        return 'destructive';
      case 'pendiente':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const acceptedCount =
    applications?.filter((app) => app.status === 'aceptada').length || 0;
  const rejectedCount =
    applications?.filter((app) => app.status === 'rechazada').length || 0;
  const pendingCount =
    applications?.filter((app) => app.status === 'pendiente').length || 0;
  const availablePositions = opportunity?.availablePositions || 1;
  const isClosed = opportunity?.status === 'cerrada';
  const canAcceptMore = !isClosed && acceptedCount < availablePositions;
  const remainingPositions = Math.max(0, availablePositions - acceptedCount);

  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    const filtered = filterStatus === 'all' ? applications : applications.filter((app) => app.status === filterStatus);
    return filtered;
  }, [applications, filterStatus]);

  const paginatedApplications = useMemo(() => {
    const startIndex = (applicationsPage - 1) * applicationsPerPage;
    const endIndex = startIndex + applicationsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, applicationsPage, applicationsPerPage]);

  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  const handleApplicationClick = useCallback((application: Application) => {
    setSelectedApplicationDetail(application);
    
    // Get student ID from application
    let studentId: string | null = null;
    if (application.student?._id) {
      studentId = String(application.student._id);
    } else if (application.studentId) {
      if (typeof application.studentId === 'string') {
        studentId = application.studentId;
      } else if (typeof application.studentId === 'object') {
        const studentIdObj = application.studentId as { _id?: string | { toString: () => string } } | string;
        if (studentIdObj && typeof studentIdObj === 'object' && '_id' in studentIdObj) {
          studentId = typeof studentIdObj._id === 'string' 
            ? studentIdObj._id 
            : studentIdObj._id?.toString() || '';
        } else {
          studentId = String(studentIdObj);
        }
      } else {
        studentId = String(application.studentId);
      }
    }
    
    // Validate and set student ID
    const cleanStudentId = studentId ? String(studentId).trim() : '';
    if (
      cleanStudentId && 
      cleanStudentId !== '' && 
      cleanStudentId !== '[object Object]' && 
      !cleanStudentId.includes('object') &&
      cleanStudentId.length > 0
    ) {
      setApplicationStudentId(cleanStudentId);
    }
  }, []);

  const handleViewProfileFromDetail = useCallback(() => {
    if (!selectedApplicationDetail) return;
    // Try multiple ways to get the student ID
    let studentId: string | null = null;
    
    // First try to get from student object
    if (selectedApplicationDetail.student?._id) {
      studentId = String(selectedApplicationDetail.student._id);
    } 
    // Then try from studentId field
    else if (selectedApplicationDetail.studentId) {
      if (typeof selectedApplicationDetail.studentId === 'string') {
        studentId = selectedApplicationDetail.studentId;
      } else if (typeof selectedApplicationDetail.studentId === 'object') {
        // If it's an object, try to extract _id or convert to string
        const studentIdObj = selectedApplicationDetail.studentId as { _id?: string | { toString: () => string } } | string;
        if (studentIdObj && typeof studentIdObj === 'object' && '_id' in studentIdObj) {
          studentId = typeof studentIdObj._id === 'string' 
            ? studentIdObj._id 
            : studentIdObj._id?.toString() || '';
        } else {
          studentId = String(studentIdObj);
        }
      } else {
        studentId = String(selectedApplicationDetail.studentId);
      }
    }
    
    // Validate that we have a valid string ID
    const cleanStudentId = studentId ? String(studentId).trim() : '';
    if (
      cleanStudentId && 
      cleanStudentId !== '' && 
      cleanStudentId !== '[object Object]' && 
      !cleanStudentId.includes('object') &&
      cleanStudentId.length > 0
    ) {
      setViewingStudentId(cleanStudentId);
      setSelectedApplicationDetail(null);
    } else {
      console.error('Invalid studentId:', {
        studentId,
        studentIdType: typeof selectedApplicationDetail.studentId,
        student: selectedApplicationDetail.student,
        application: selectedApplicationDetail,
      });
      toast.error('Error', 'No se pudo obtener el ID del estudiante. Por favor, intente nuevamente.');
    }
  }, [selectedApplicationDetail, toast]);

  if (isLoadingOpportunity) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] dark:bg-slate-900 -m-4 sm:-m-6 lg:-m-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] dark:bg-slate-900 -m-4 sm:-m-6 lg:-m-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Oportunidad no encontrada
              </h3>
              <Button onClick={() => navigate('/oportunidades')} className="mt-4">
                Volver a Oportunidades
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f3f2ef] dark:bg-slate-900 -m-4 sm:-m-6 lg:-m-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]">
      <div className="w-full py-4 sm:py-6">
        {/* Back Button */}
        <div className="px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/oportunidades')}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Oportunidades
        </Button>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-full">
          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Opportunity Header Card */}
            <OpportunityHeaderCard
              opportunity={opportunity}
              baseUrl={baseUrl}
              onToggleActive={handleToggleActive}
              isToggling={toggleActiveMutation.isPending}
              acceptedCount={acceptedCount}
              availablePositions={availablePositions}
            />

            <OpportunityTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              applicationsCount={applications?.length || 0}
            />

            {activeTab === 'detail' && (
              <OpportunityDetailTab
                opportunity={opportunity}
                baseUrl={baseUrl}
                acceptedCount={acceptedCount}
                pendingCount={pendingCount}
                rejectedCount={rejectedCount}
                availablePositions={availablePositions}
                isClosed={isClosed}
                canAcceptMore={canAcceptMore}
                remainingPositions={remainingPositions}
              />
            )}

            {activeTab === 'applications' && (
              <OpportunityApplicationsTab
                applications={applications}
                isLoading={isLoadingApplications}
                filterStatus={filterStatus}
                onFilterChange={(status) => {
                  setFilterStatus(status);
                  setApplicationsPage(1);
                }}
                onApplicationClick={handleApplicationClick}
                paginatedApplications={paginatedApplications}
                currentPage={applicationsPage}
                totalPages={totalPages}
                onPageChange={setApplicationsPage}
                startIndex={(applicationsPage - 1) * applicationsPerPage + 1}
                endIndex={Math.min(applicationsPage * applicationsPerPage, filteredApplications.length)}
                totalFiltered={filteredApplications.length}
                totalCount={applications?.length || 0}
                pendingCount={pendingCount}
                acceptedCount={acceptedCount}
                rejectedCount={rejectedCount}
                getStatusBadgeVariant={getApplicationStatusBadgeVariant}
                capitalizeFirst={capitalizeFirst}
              />
            )}
          </div>
        </div>
        </div>
      </div>

      <AcceptApplicationDialog
        open={showConfirmDialog && actionType === 'accept' && !!selectedApplication}
        onOpenChange={(open) => {
          if (!open) {
            setShowConfirmDialog(false);
            setSelectedApplication(null);
            setActionType(null);
          }
        }}
        application={selectedApplication}
        isClosed={isClosed}
        canAcceptMore={canAcceptMore}
        acceptedCount={acceptedCount}
        availablePositions={availablePositions}
        remainingPositions={remainingPositions}
        isPending={updateStatusMutation.isPending}
        onConfirm={confirmAction}
      />

      <RejectApplicationDialog
        open={showConfirmDialog && actionType === 'reject' && !!selectedApplication}
        onOpenChange={(open) => {
          if (!open) {
            setShowConfirmDialog(false);
            setSelectedApplication(null);
            setActionType(null);
            setRejectionReason('');
          }
        }}
        application={selectedApplication}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        isPending={updateStatusMutation.isPending}
        onConfirm={confirmAction}
      />

      <ApplicationDetailDialog
        open={!!selectedApplicationDetail}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApplicationDetail(null);
            setApplicationStudentId(null);
          }
        }}
        application={selectedApplicationDetail}
        student={applicationStudent}
        isLoadingStudent={isLoadingApplicationStudent}
        getStatusBadgeVariant={getApplicationStatusBadgeVariant}
        capitalizeFirst={capitalizeFirst}
        canAcceptMore={canAcceptMore}
        isClosed={isClosed}
        acceptedCount={acceptedCount}
        availablePositions={availablePositions}
        onViewProfile={handleViewProfileFromDetail}
        onAccept={() => handleAccept(selectedApplicationDetail!)}
        onReject={() => handleReject(selectedApplicationDetail!)}
      />

      <StudentProfileDialog
        open={!!viewingStudentId}
        onOpenChange={(open) => {
          if (!open) {
            setViewingStudentId(null);
          }
        }}
        student={viewingStudent}
        isLoading={isLoadingStudent}
      />
    </div>
  );
}
