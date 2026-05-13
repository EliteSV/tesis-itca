import { useMyStudentProfile } from '@/hooks/useStudents';
import { Card } from '@/components/ui/card';
import { GraduationCap, BookOpen, Hash, Clock, Loader2 } from 'lucide-react';

export function StudentCareerInfo() {
  const { data: student, isLoading, error } = useMyStudentProfile();

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </Card>
    );
  }

  if (error || !student) {
    return (
      <Card className="p-8">
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No se pudo cargar la información
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            No se encontró información de tu perfil de estudiante.
          </p>
        </div>
      </Card>
    );
  }

  // El backend puede devolver la carrera en 'career' o en 'careerId' como objeto
  const career = student.career || 
    (typeof student.careerId === 'object' && student.careerId !== null && !Array.isArray(student.careerId)
      ? student.careerId 
      : null);

  if (!career) {
    return (
      <Card className="p-8">
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Sin carrera asignada
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            No tienes una carrera asignada en tu perfil.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Career Header Card */}
      <Card className="overflow-hidden border-2 border-blue-100 dark:border-blue-900 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
        <div className="p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {career.name}
                </h2>
                {career.code && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono">{career.code}</span>
                  </div>
                )}
              </div>
              {career.description && (
                <p className="text-slate-700 dark:text-slate-300 mt-3 leading-relaxed">
                  {career.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Career Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Career Code */}
        {career.code && (
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <Hash className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Código de Carrera
                </h3>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-mono">
                  {career.code}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Career Duration */}
        {career.duration && (
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Duración
                </h3>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {career.duration} {career.duration === 1 ? 'año' : 'años'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Career Name */}
        <Card className="p-6 hover:shadow-md transition-shadow md:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Nombre Completo
              </h3>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {career.name}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Student Status Info */}
      <Card className="p-6 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Estás inscrito en esta carrera. Esta información es de solo lectura y no puede ser modificada.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

