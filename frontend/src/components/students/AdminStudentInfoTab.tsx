import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Code,
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
  const formatDateRange = (startDate: string, endDate?: string, isCurrent?: boolean) => {
    const start = formatDate(startDate);
    const end = isCurrent ? 'Presente' : endDate ? formatDate(endDate) : '';
    return `${start} - ${end}`;
  };

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

          <div className="space-y-6">
            {student.professionalProfile?.summary && (
              <section>
                <h4 className="text-lg font-bold text-primary mb-3 pb-2 border-b border-primary/30">
                  Resumen Profesional
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap wrap-break-word leading-relaxed">
                  {student.professionalProfile.summary}
                </p>
              </section>
            )}

            {student.workExperience && student.workExperience.length > 0 && (
              <section>
                <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experiencia Laboral
                </h4>
                <div className="space-y-5">
                  {student.workExperience.map((exp, index) => (
                    <div
                      key={index}
                      className="pl-4 border-l-2 border-primary/20"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-base text-slate-900 dark:text-slate-100">
                            {exp.position}
                          </p>
                          <p className="text-sm font-medium text-primary mt-1">
                            {exp.company}
                          </p>
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                        </p>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {student.education && student.education.length > 0 && (
              <section>
                <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Formación Académica
                </h4>
                <div className="space-y-5">
                  {student.education.map((edu, index) => (
                    <div key={index} className="pl-4 border-l-2 border-primary/20">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-base text-slate-900 dark:text-slate-100">
                            {edu.degree}
                          </p>
                          <p className="text-sm font-medium text-primary mt-1">
                            {edu.institution}
                          </p>
                          {edu.field && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {edu.field}
                            </p>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDateRange(edu.startDate, edu.endDate, edu.isCurrent)}
                        </p>
                      </div>
                      {edu.description && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {student.skills && student.skills.length > 0 && (
              <section>
                <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Habilidades
                </h4>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 rounded-md text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {student.professionalProfile?.languages &&
              student.professionalProfile.languages.length > 0 && (
                <section>
                  <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Idiomas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {student.professionalProfile.languages.map((lang, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm py-2 px-3 bg-slate-50 dark:bg-slate-900/50 rounded"
                      >
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {lang.name}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {lang.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {student.professionalProfile?.certifications &&
              student.professionalProfile.certifications.length > 0 && (
                <section>
                  <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Certificaciones
                  </h4>
                  <div className="space-y-4">
                    {student.professionalProfile.certifications.map((cert, index) => (
                      <div key={index} className="pl-4 border-l-2 border-primary/20">
                        <p className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {cert.name}
                        </p>
                        <p className="text-sm text-primary mt-1">{cert.issuer}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {formatDate(cert.date)}
                          {cert.expiryDate && ` - Expira: ${formatDate(cert.expiryDate)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {student.professionalProfile?.projects &&
              student.professionalProfile.projects.length > 0 && (
                <section>
                  <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Proyectos
                  </h4>
                  <div className="space-y-5">
                    {student.professionalProfile.projects.map((proj, index) => (
                      <div key={index} className="pl-4 border-l-2 border-primary/20">
                        <p className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {proj.name}
                        </p>
                        {proj.description && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                            {proj.description}
                          </p>
                        )}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {proj.technologies.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-2 inline-block cursor-pointer"
                          >
                            {proj.url}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

