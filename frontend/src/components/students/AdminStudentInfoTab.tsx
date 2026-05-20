import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  FileText,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/utils/date.utils';
import type { Student } from '@/types/student.types';
import { StudentStatus } from '@/types/student.types';
import { ProfessionalProfileView } from './ProfessionalProfileView';

interface AdminStudentInfoTabProps {
  student: Student;
  isGeneratingPDF: boolean;
  onDownloadPDF: () => void;
}

export function AdminStudentInfoTab({
  student,
  isGeneratingPDF,
  onDownloadPDF,
}: AdminStudentInfoTabProps) {
  const getStatusBadgeVariant = (status: string, isActive: boolean) => {
    if (!isActive) return 'destructive';
    switch (status) {
      case StudentStatus.ACTIVO:
        return 'default';
      case StudentStatus.GRADUADO:
        return 'secondary';
      case StudentStatus.PERFIL_INCOMPLETO:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case StudentStatus.ACTIVO:
        return 'Activo';
      case StudentStatus.INACTIVO:
        return 'Inactivo';
      case StudentStatus.GRADUADO:
        return 'Graduado';
      case StudentStatus.PERFIL_INCOMPLETO:
        return 'Perfil Incompleto';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Personal Information */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Información Personal
            </CardTitle>
            <Button
              onClick={onDownloadPDF}
              disabled={isGeneratingPDF}
              size="sm"
              className="cursor-pointer"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar CV PDF
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Nombre Completo
              </Label>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {student.firstName} {student.lastName}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Email
              </Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {student.email}
                </p>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Número de Identificación
              </Label>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                {student.identificationNumber}
              </p>
            </div>
            {student.phone && (
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Teléfono
                </Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {student.phone}
                  </p>
                </div>
              </div>
            )}
            {student.address && (
              <div className="sm:col-span-2">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Dirección
                </Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {student.address}
                  </p>
                </div>
              </div>
            )}
            {student.dateOfBirth && (
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Fecha de Nacimiento
                </Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {formatDate(student.dateOfBirth)}
                  </p>
                </div>
              </div>
            )}
            {student.gender && (
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Género
                </Label>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {student.gender}
                </p>
              </div>
            )}
            <div>
              <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                Estado
              </Label>
              <Badge
                variant={getStatusBadgeVariant(student.status, student.isActive)}
                className="text-xs"
              >
                {getStatusLabel(student.status)}
              </Badge>
            </div>
            {student.career && (
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Carrera
                </Label>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {student.career.name} ({student.career.code})
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      {student.socialServiceDocument && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
                  Documento de Horas Sociales
                </Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={student.socialServiceDocument.isValidated ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {student.socialServiceDocument.isValidated ? 'Validado' : 'Pendiente'}
                  </Badge>
                  {student.socialServiceDocument.validatedAt && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(student.socialServiceDocument.validatedAt)}
                    </span>
                  )}
                </div>
                {student.socialServiceDocument.validationErrors &&
                  student.socialServiceDocument.validationErrors.length > 0 && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 rounded text-xs text-red-600 dark:text-red-400">
                      <p className="font-semibold mb-1">Errores:</p>
                      <ul className="list-disc list-inside">
                        {student.socialServiceDocument.validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Profile */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-primary/20">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Perfil Profesional
            </h3>
          </div>
          <ProfessionalProfileView profile={student.professionalProfile ?? {}} />
        </CardContent>
      </Card>
    </div>
  );
}

