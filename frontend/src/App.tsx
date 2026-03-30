import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RequireCompany } from '@/components/auth/RequireCompany';
import { MainLayout } from '@/components/layout/MainLayout';
import { UserRole } from '@/types/auth.types';
import { useAuth } from '@/hooks/useAuth';
import { useHasActivePractice } from '@/hooks/useHasActivePractice';

const LoginPage = lazy(() => import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const OpportunitiesPage = lazy(() => import('@/pages/OpportunitiesPage').then((module) => ({ default: module.OpportunitiesPage })));
const OpportunityDetailPage = lazy(() => import('@/pages/OpportunityDetailPage').then((module) => ({ default: module.OpportunityDetailPage })));
const StudentsPage = lazy(() => import('@/pages/StudentsPage').then((module) => ({ default: module.StudentsPage })));
const StudentDetailPage = lazy(() => import('@/pages/StudentDetailPage').then((module) => ({ default: module.StudentDetailPage })));
const AdminStudentDetailPage = lazy(() => import('@/pages/AdminStudentDetailPage').then((module) => ({ default: module.AdminStudentDetailPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const CompaniesPage = lazy(() => import('@/pages/CompaniesPage').then((module) => ({ default: module.CompaniesPage })));
const CareerCategoriesPage = lazy(() => import('@/pages/CareerCategoriesPage').then((module) => ({ default: module.CareerCategoriesPage })));
const CareersPage = lazy(() => import('@/pages/CareersPage').then((module) => ({ default: module.CareersPage })));
const UsersPage = lazy(() => import('@/pages/UsersPage').then((module) => ({ default: module.UsersPage })));
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((module) => ({ default: module.ReportsPage })));
const AcceptInvitationPage = lazy(() => import('@/pages/AcceptInvitationPage').then((module) => ({ default: module.AcceptInvitationPage })));
const StudentOpportunitiesPage = lazy(() => import('@/pages/StudentOpportunitiesPage').then((module) => ({ default: module.StudentOpportunitiesPage })));
const MyApplicationsPage = lazy(() => import('@/pages/MyApplicationsPage').then((module) => ({ default: module.MyApplicationsPage })));
const MyPracticeProfessionalPage = lazy(() => import('@/pages/MyPracticeProfessionalPage').then((module) => ({ default: module.MyPracticeProfessionalPage })));
const PracticeHistoryPage = lazy(() => import('@/pages/PracticeHistoryPage').then((module) => ({ default: module.PracticeHistoryPage })));
const PracticeDetailPage = lazy(() => import('@/pages/PracticeDetailPage').then((module) => ({ default: module.PracticeDetailPage })));
const CompanyApplicationsPage = lazy(() => import('@/pages/CompanyApplicationsPage').then((module) => ({ default: module.CompanyApplicationsPage })));
const CoordinatorApplicationsPage = lazy(() => import('@/pages/CoordinatorApplicationsPage').then((module) => ({ default: module.CoordinatorApplicationsPage })));
const ApplicationDetailPage = lazy(() => import('@/pages/ApplicationDetailPage').then((module) => ({ default: module.ApplicationDetailPage })));
const AdminOpportunitiesPage = lazy(() => import('@/pages/AdminOpportunitiesPage').then((module) => ({ default: module.AdminOpportunitiesPage })));
const AdminOpportunityDetailPage = lazy(() => import('@/pages/AdminOpportunityDetailPage').then((module) => ({ default: module.AdminOpportunityDetailPage })));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage').then((module) => ({ default: module.UnauthorizedPage })));
const Page404 = lazy(() => import('@/pages/Page404').then((module) => ({ default: module.Page404 })));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-slate-600 dark:text-slate-400">Cargando...</p>
      </div>
    </div>
  );
}

function StudentDashboardRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const hasActivePractice = useHasActivePractice();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      user?.role === UserRole.ESTUDIANTE &&
      hasActivePractice
    ) {
      navigate('/mi-practica-profesional', { replace: true });
    }
  }, [user?.role, hasActivePractice, navigate]);

  if (user?.role === UserRole.ESTUDIANTE && hasActivePractice) {
    return null;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route
            path="/login"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="/invitation/:token"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AcceptInvitationPage />
              </Suspense>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.COMPANY, UserRole.ESTUDIANTE, UserRole.COORDINADOR]}>
                <StudentDashboardRedirect>
                  <MainLayout>
                    <Suspense fallback={<LoadingFallback />}>
                      <DashboardPage />
                    </Suspense>
                  </MainLayout>
                </StudentDashboardRedirect>
              </ProtectedRoute>
            }
          />
          <Route
            path="/oportunidades"
            element={
              <ProtectedRoute allowedRoles={[UserRole.COMPANY]}>
                <MainLayout>
                  <RequireCompany>
                    <Suspense fallback={<LoadingFallback />}>
                      <OpportunitiesPage />
                    </Suspense>
                  </RequireCompany>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/solicitudes"
            element={
              <ProtectedRoute allowedRoles={[UserRole.COMPANY]}>
                <MainLayout>
                  <RequireCompany>
                    <Suspense fallback={<LoadingFallback />}>
                      <CompanyApplicationsPage />
                    </Suspense>
                  </RequireCompany>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/solicitudes-coordinador"
            element={
              <ProtectedRoute allowedRoles={[UserRole.COORDINADOR]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <CoordinatorApplicationsPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/solicitudes/:applicationId"
            element={
              <ProtectedRoute allowedRoles={[UserRole.COMPANY]}>
                <MainLayout>
                  <RequireCompany>
                    <Suspense fallback={<LoadingFallback />}>
                      <ApplicationDetailPage />
                    </Suspense>
                  </RequireCompany>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/opportunities/:id"
            element={
              <ProtectedRoute allowedRoles={[UserRole.COMPANY]}>
                <MainLayout>
                  <RequireCompany>
                    <Suspense fallback={<LoadingFallback />}>
                      <OpportunityDetailPage />
                    </Suspense>
                  </RequireCompany>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/estudiantes"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.COMPANY, UserRole.COORDINADOR]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <StudentsPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/estudiantes/:id"
            element={
              <ProtectedRoute allowedRoles={[UserRole.COMPANY]}>
                <MainLayout>
                  <RequireCompany>
                    <Suspense fallback={<LoadingFallback />}>
                      <StudentDetailPage />
                    </Suspense>
                  </RequireCompany>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/estudiantes/:id/admin"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminStudentDetailPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <CompaniesPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/career-categories"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <CareerCategoriesPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/careers"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <CareersPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <UsersPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <ReportsPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/oportunidades-disponibles"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ESTUDIANTE]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <StudentOpportunitiesPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-solicitudes"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ESTUDIANTE]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <MyApplicationsPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mi-practica-profesional"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ESTUDIANTE]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <MyPracticeProfessionalPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial-practicas"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ESTUDIANTE]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <PracticeHistoryPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial-practicas/:applicationId"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ESTUDIANTE]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <PracticeDetailPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.COMPANY, UserRole.ESTUDIANTE, UserRole.COORDINADOR]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <SettingsPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracion"
            element={<Navigate to="/settings" replace />}
          />
          <Route
            path="/admin/opportunities"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.COORDINADOR]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminOpportunitiesPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/opportunities/:id"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.COORDINADOR]}>
                <MainLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminOpportunityDetailPage />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <UnauthorizedPage />
              </Suspense>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="*"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Page404 />
              </Suspense>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
