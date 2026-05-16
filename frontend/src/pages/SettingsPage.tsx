import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Settings, User, Building2, GraduationCap, Lock, AlertCircle, FileText, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserProfileForm } from "@/components/settings/UserProfileForm";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { CompanyProfileForm } from "@/components/settings/CompanyProfileForm";
import { StudentCareerInfo } from "@/components/settings/StudentCareerInfo";
import { StudentProfileForm } from "@/components/settings/StudentProfileForm";
import { StudentDocumentsForm } from "@/components/settings/StudentDocumentsForm";
import { StudentProfessionalProfileForm } from "@/components/settings/StudentProfessionalProfileForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserRole } from "@/types/auth.types";

export function SettingsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const shouldChangePassword = searchParams.get("changePassword") === "true";
  
  const defaultTab = useMemo<"profile" | "password" | "entity" | "documents" | "professional">(
    () => (shouldChangePassword ? "password" : "profile"),
    [shouldChangePassword]
  );
  
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "entity" | "documents" | "professional">(
    defaultTab
  );
  
  const currentTab = shouldChangePassword ? "password" : activeTab;

  const showEntityTab =
    user?.role === UserRole.COMPANY || user?.role === UserRole.ESTUDIANTE;

  const hasIncompleteProfile =
    user?.isProfileIncomplete && user?.role === UserRole.ESTUDIANTE;

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Configuración
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Gestiona tu información personal y de la entidad asociada.
        </p>
      </div>

      {shouldChangePassword && (
        <Alert className="mb-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">
            Cambio de contraseña requerido
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            Debes cambiar tu contraseña temporal antes de continuar usando el sistema.
          </AlertDescription>
        </Alert>
      )}

      {hasIncompleteProfile && !shouldChangePassword && (
        <Alert className="mb-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertTitle className="text-orange-800 dark:text-orange-200">
            Perfil incompleto
          </AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            Para desbloquear las demás funcionalidades, primero debes completar tu perfil. Haz clic en el tab de{' '}
            <button
              onClick={() => setActiveTab('documents')}
              className="font-semibold underline hover:text-orange-900 dark:hover:text-orange-100 transition-colors"
            >
              Documentación
            </button>
            {' '}y carga los documentos que se te solicitan.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => !shouldChangePassword && setActiveTab("profile")}
          disabled={shouldChangePassword}
          className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
            shouldChangePassword
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          } ${
            currentTab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Mi Perfil</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            currentTab === "password"
              ? "border-primary text-primary"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Contraseña</span>
          </div>
        </button>
        {showEntityTab && (
          <button
            onClick={() => !shouldChangePassword && setActiveTab("entity")}
            disabled={shouldChangePassword}
            className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
              shouldChangePassword
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            } ${
              currentTab === "entity"
                ? "border-primary text-primary"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {user?.role === UserRole.COMPANY ? (
                <Building2 className="h-4 w-4" />
              ) : (
                <GraduationCap className="h-4 w-4" />
              )}
              <span>
                {user?.role === UserRole.COMPANY
                  ? "Mi Empresa"
                  : "Mi Carrera"}
              </span>
            </div>
          </button>
        )}
        {user?.role === UserRole.ESTUDIANTE && (
          <>
            <button
              onClick={() => !shouldChangePassword && setActiveTab("documents")}
              disabled={shouldChangePassword}
              className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                shouldChangePassword
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              } ${
                activeTab === "documents"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Documentación</span>
              </div>
            </button>
            <button
              onClick={() => !shouldChangePassword && setActiveTab("professional")}
              disabled={shouldChangePassword}
              className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                shouldChangePassword
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              } ${
                activeTab === "professional"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Mi Perfil Profesional</span>
              </div>
            </button>
          </>
        )}
      </div>

      {currentTab === "profile" && !shouldChangePassword && (<>
      <UserProfileForm />
      <div className="mb-6" />
      <StudentProfileForm />
      </>)}

      {currentTab === "password" && <ChangePasswordForm />}

      {shouldChangePassword && currentTab === "profile" && (
        <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">
            Cambio de contraseña requerido
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Por favor, cambia tu contraseña temporal en la pestaña "Contraseña" antes de acceder a otras secciones.
          </AlertDescription>
        </Alert>
      )}

      {currentTab === "entity" && user?.role === UserRole.COMPANY && (
        <CompanyProfileForm />
      )}

      {currentTab === "entity" && user?.role === UserRole.ESTUDIANTE && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Información de Mi Carrera
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Visualiza la información de la carrera a la que perteneces
            </p>
          </div>
          <StudentCareerInfo />
        </div>
      )}

      {currentTab === "documents" && user?.role === UserRole.ESTUDIANTE && (
        <StudentDocumentsForm />
      )}

      {currentTab === "professional" && user?.role === UserRole.ESTUDIANTE && (
        <StudentProfessionalProfileForm />
      )}
    </div>
  );
}
