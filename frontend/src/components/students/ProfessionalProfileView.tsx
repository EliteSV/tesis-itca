import { Briefcase, GraduationCap, Code, FileText } from 'lucide-react';
import { formatDate } from '@/utils/date.utils';
import type { ProfessionalProfile } from '@/types/student.types';

interface ProfessionalProfileViewProps {
  profile: ProfessionalProfile;
  studentName?: string;
  studentEmail?: string;
}

export function ProfessionalProfileView({
  profile,
  studentName,
  studentEmail,
}: ProfessionalProfileViewProps) {
  const isEmpty =
    !profile.summary &&
    !profile.workExperience?.length &&
    !profile.education?.length &&
    !profile.skills?.length &&
    !profile.languages?.length &&
    !profile.certifications?.length &&
    !profile.projects?.length;

  return (
    <div className="space-y-6">
      {(studentName || studentEmail) && (
        <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
          {studentName && (
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {studentName}
            </h2>
          )}
          {studentEmail && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {studentEmail}
            </p>
          )}
        </div>
      )}

      {isEmpty ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay información en el perfil profesional.</p>
        </div>
      ) : (
        <>
          {profile.summary && (
            <section>
              <h4 className="text-lg font-bold text-primary mb-3 pb-2 border-b border-primary/30">
                Resumen Profesional
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {profile.summary}
              </p>
            </section>
          )}

          {profile.workExperience && profile.workExperience.length > 0 && (
            <section>
              <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Experiencia Laboral
              </h4>
              <div className="space-y-5">
                {profile.workExperience.map((exp, index) => (
                  <div key={index} className="pl-4 border-l-2 border-primary/20">
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
                        {formatDate(exp.startDate)} -{' '}
                        {exp.isCurrent
                          ? 'Presente'
                          : exp.endDate
                            ? formatDate(exp.endDate)
                            : ''}
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

          {profile.education && profile.education.length > 0 && (
            <section>
              <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Formación Académica
              </h4>
              <div className="space-y-5">
                {profile.education.map((edu, index) => (
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
                        {formatDate(edu.startDate)} -{' '}
                        {edu.isCurrent
                          ? 'Presente'
                          : edu.endDate
                            ? formatDate(edu.endDate)
                            : ''}
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

          {profile.skills && profile.skills.length > 0 && (
            <section>
              <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                <Code className="h-5 w-5" />
                Habilidades
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
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

          {profile.languages && profile.languages.length > 0 && (
            <section>
              <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Idiomas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.languages.map((lang, index) => (
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

          {profile.certifications && profile.certifications.length > 0 && (
            <section>
              <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Certificaciones
              </h4>
              <div className="space-y-4">
                {profile.certifications.map((cert, index) => (
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

          {profile.projects && profile.projects.length > 0 && (
            <section>
              <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b border-primary/30 flex items-center gap-2">
                <Code className="h-5 w-5" />
                Proyectos
              </h4>
              <div className="space-y-5">
                {profile.projects.map((proj, index) => (
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
        </>
      )}
    </div>
  );
}
