import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin as MapPinIcon,
  FileText,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/date.utils';
import type { Student } from '@/types/student.types';

interface StudentProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null | undefined;
  isLoading: boolean;
}

export function StudentProfileDialog({
  open,
  onOpenChange,
  student,
  isLoading,
}: StudentProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-[#B1291D]/5 via-[#B1291D]/10 to-[#B1291D]/5 dark:from-[#B1291D]/10 dark:via-[#B1291D]/20 dark:to-[#B1291D]/10">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="p-3 bg-[#B1291D]/20 dark:bg-[#B1291D]/30 rounded-xl shadow-sm">
              <User className="h-6 w-6 sm:h-7 sm:w-7 text-[#B1291D] dark:text-[#D64032]" />
            </div>
            <span>Perfil del Estudiante</span>
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center py-12 px-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : student ? (
          <div className="px-6 py-6 space-y-6">
            <div className="pb-6 border-b border-[#E0E0E0] dark:border-slate-700">
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#B1291D] to-[#D64032] flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {student.firstName?.[0]?.toUpperCase()}
                    {student.lastName?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-slate-100 mb-2">
                    {student.firstName} {student.lastName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F5] dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Mail className="h-4 w-4 text-[#B1291D] dark:text-[#D64032] shrink-0" />
                      <a
                        href={`mailto:${student.email}`}
                        className="text-sm font-medium text-[#1976D2] dark:text-[#42A5F5] hover:underline transition-colors break-all cursor-pointer"
                      >
                        {student.email}
                      </a>
                    </div>
                    {student.identificationNumber && (
                      <div className="px-3 py-1.5 bg-[#F5F5F5] dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-[#757575] dark:text-slate-400 mr-2">ID:</span>
                        <span className="text-sm font-mono font-semibold text-[#212121] dark:text-slate-100">
                          {student.identificationNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {student.phone && (
                <div className="p-5 bg-gradient-to-br from-[#FFFFFF] to-[#F5F5F5] dark:from-slate-800 dark:to-slate-900 rounded-lg border border-[#E0E0E0] dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#B1291D]/30 dark:hover:border-[#D64032]/30">
                  <Label className="text-xs font-semibold text-[#757575] dark:text-slate-400 mb-2 block uppercase tracking-wide flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#B1291D] dark:text-[#D64032]" />
                    Teléfono
                  </Label>
                  <a
                    href={`tel:${student.phone}`}
                    className="text-base font-semibold text-[#1976D2] dark:text-[#42A5F5] hover:underline block cursor-pointer"
                  >
                    {student.phone}
                  </a>
                </div>
              )}
              {student.career && (
                <div className="sm:col-span-2 p-6 bg-gradient-to-br from-[#EBD299]/10 via-[#FFFFFF] to-[#EBD299]/10 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-xl border-2 border-[#EBD299]/30 dark:border-[#F5C35C]/30 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-[#EBD299]/20 dark:bg-[#F5C35C]/20 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-[#EBD299] dark:text-[#F5C35C]" />
                    </div>
                    <Label className="text-sm font-bold text-[#212121] dark:text-slate-100 uppercase tracking-wide">
                      Información Académica
                    </Label>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-[#757575] dark:text-slate-400 mb-1 uppercase tracking-wide">
                        Carrera
                      </p>
                      <p className="text-lg font-bold text-[#212121] dark:text-slate-100">
                        {typeof student.career === 'object'
                          ? student.career.name
                          : 'N/A'}
                      </p>
                    </div>
                    {typeof student.career === 'object' && student.career.code && (
                      <div className="pt-2 border-t border-[#EBD299]/20 dark:border-[#F5C35C]/20">
                        <p className="text-xs font-semibold text-[#757575] dark:text-slate-400 mb-1 uppercase tracking-wide">
                          Código
                        </p>
                        <p className="text-base font-mono font-semibold text-[#212121] dark:text-slate-100">
                          {student.career.code}
                        </p>
                      </div>
                    )}
                    {typeof student.career === 'object' && student.career.description && (
                      <div className="pt-2 border-t border-[#EBD299]/20 dark:border-[#F5C35C]/20">
                        <p className="text-xs font-semibold text-[#757575] dark:text-slate-400 mb-2 uppercase tracking-wide">
                          Descripción
                        </p>
                        <p className="text-sm text-[#757575] dark:text-slate-400 leading-relaxed">
                          {student.career.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {student.dateOfBirth && (
                <div className="p-5 bg-gradient-to-br from-[#FFFFFF] to-[#F5F5F5] dark:from-slate-800 dark:to-slate-900 rounded-lg border border-[#E0E0E0] dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#B1291D]/30 dark:hover:border-[#D64032]/30">
                  <Label className="text-xs font-semibold text-[#757575] dark:text-slate-400 mb-2 block uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-[#B1291D] dark:text-[#D64032]" />
                    Fecha de nacimiento
                  </Label>
                  <p className="text-base font-semibold text-[#212121] dark:text-slate-100">
                    {formatDate(student.dateOfBirth)}
                  </p>
                </div>
              )}
              {student.gender && (
                <div className="p-5 bg-gradient-to-br from-[#FFFFFF] to-[#F5F5F5] dark:from-slate-800 dark:to-slate-900 rounded-lg border border-[#E0E0E0] dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#B1291D]/30 dark:hover:border-[#D64032]/30">
                  <Label className="text-xs font-semibold text-[#757575] dark:text-slate-400 mb-2 block uppercase tracking-wide">
                    Género
                  </Label>
                  <p className="text-base font-semibold text-[#212121] dark:text-slate-100">
                    {student.gender}
                  </p>
                </div>
              )}
              {student.address && (
                <div className="sm:col-span-2 p-5 bg-gradient-to-br from-[#FFFFFF] to-[#F5F5F5] dark:from-slate-800 dark:to-slate-900 rounded-lg border border-[#E0E0E0] dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#B1291D]/30 dark:hover:border-[#D64032]/30">
                  <Label className="text-xs font-semibold text-[#757575] dark:text-slate-400 mb-2 block uppercase tracking-wide flex items-center gap-2">
                    <MapPinIcon className="h-3.5 w-3.5 text-[#B1291D] dark:text-[#D64032]" />
                    Dirección
                  </Label>
                  <p className="text-base font-medium text-[#212121] dark:text-slate-100 wrap-break-word">
                    {student.address}
                  </p>
                </div>
              )}
            </div>

            {(student.socialServiceDocument || student.passedSubjectsDocument) && (
              <div className="pt-6 border-t border-[#E0E0E0] dark:border-slate-700">
                <h3 className="text-base font-semibold text-[#212121] dark:text-slate-100 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#B1291D] dark:text-[#D64032]" />
                  Documentos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {student.socialServiceDocument && (
                    <div className="p-4 bg-[#FFFFFF] dark:bg-slate-800 rounded-lg border border-[#E0E0E0] dark:border-slate-700 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-semibold text-[#757575] dark:text-slate-400 uppercase tracking-wide">
                          Horas Sociales
                        </Label>
                        <Badge
                          variant={student.socialServiceDocument.isValidated ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {student.socialServiceDocument.isValidated ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Validado
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pendiente
                            </>
                          )}
                        </Badge>
                      </div>
                      {student.socialServiceDocument.fileName && (
                        <p className="text-sm text-[#212121] dark:text-slate-100 truncate">
                          {student.socialServiceDocument.fileName}
                        </p>
                      )}
                      {student.socialServiceDocument.validatedAt && (
                        <p className="text-xs text-[#757575] dark:text-slate-400 mt-1">
                          Validado: {formatDate(student.socialServiceDocument.validatedAt)}
                        </p>
                      )}
                    </div>
                  )}
                  {student.passedSubjectsDocument && (
                    <div className="p-4 bg-[#FFFFFF] dark:bg-slate-800 rounded-lg border border-[#E0E0E0] dark:border-slate-700 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-semibold text-[#757575] dark:text-slate-400 uppercase tracking-wide">
                          Materias Aprobadas
                        </Label>
                        <Badge
                          variant={student.passedSubjectsDocument.isValidated ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {student.passedSubjectsDocument.isValidated ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Validado
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pendiente
                            </>
                          )}
                        </Badge>
                      </div>
                      {student.passedSubjectsDocument.fileName && (
                        <p className="text-sm text-[#212121] dark:text-slate-100 truncate">
                          {student.passedSubjectsDocument.fileName}
                        </p>
                      )}
                      {student.passedSubjectsDocument.passedCount !== undefined && (
                        <p className="text-xs text-[#757575] dark:text-slate-400 mt-1">
                          {student.passedSubjectsDocument.passedCount} de{' '}
                          {student.passedSubjectsDocument.totalSubjects || 'N/A'} materias
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-[#E0E0E0] dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold text-[#757575] dark:text-slate-400 mb-2 block uppercase tracking-wide">
                      Estado Académico
                    </Label>
                    <Badge
                      variant={
                        student.status === 'ACTIVO'
                          ? 'default'
                          : student.status === 'GRADUADO'
                            ? 'secondary'
                            : 'outline'
                      }
                      className="text-xs px-3 py-1.5 font-medium"
                    >
                      {student.status === 'ACTIVO' && <CheckCircle2 className="h-3 w-3 mr-1.5" />}
                      {student.status === 'GRADUADO' && <GraduationCap className="h-3 w-3 mr-1.5" />}
                      {student.status === 'INACTIVO' && <XCircle className="h-3 w-3 mr-1.5" />}
                      {student.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-[#757575] dark:text-slate-400 mb-2 block uppercase tracking-wide">
                      Estado de Cuenta
                    </Label>
                    <Badge
                      variant={student.isActive ? 'outline' : 'secondary'}
                      className={`text-xs px-3 py-1.5 font-medium ${
                        student.isActive
                          ? 'border-[#388E3C] text-[#388E3C] dark:border-[#66BB6A] dark:text-[#66BB6A] bg-[#388E3C]/5 dark:bg-[#388E3C]/10'
                          : 'border-[#757575] text-[#757575] dark:border-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {student.isActive ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1.5" />
                          Activa
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1.5" />
                          Inactiva
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {student.createdAt && (
                    <div>
                      <Label className="text-xs font-semibold text-[#757575] dark:text-slate-400 mb-2 block uppercase tracking-wide">
                        Fecha de Registro
                      </Label>
                      <p className="text-sm font-medium text-[#212121] dark:text-slate-100 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#B1291D] dark:text-[#D64032]" />
                        {formatDate(student.createdAt)}
                      </p>
                    </div>
                  )}
                  {student.updatedAt && (
                    <div>
                      <Label className="text-xs font-semibold text-[#757575] dark:text-slate-400 mb-2 block uppercase tracking-wide">
                        Última Actualización
                      </Label>
                      <p className="text-sm font-medium text-[#212121] dark:text-slate-100 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-[#B1291D] dark:text-[#D64032]" />
                        {formatDate(student.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <User className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
              No se pudo cargar el perfil
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              No se pudo obtener la información del estudiante.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

