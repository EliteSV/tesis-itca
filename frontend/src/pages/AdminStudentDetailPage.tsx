import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { generateStudentPDF } from '@/utils/pdf.utils';
import { useToastContext } from '@/contexts/ToastContext';
import { useStudent } from '@/hooks/useStudents';
import { useStudentPracticeProfessionalForAdmin } from '@/hooks/usePracticeProfessional';
import { AdminStudentTabs } from '@/components/students/AdminStudentTabs';
import { AdminStudentInfoTab } from '@/components/students/AdminStudentInfoTab';
import { AdminStudentPracticeTab } from '@/components/students/AdminStudentPracticeTab';

export function AdminStudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToastContext();
  const [activeTab, setActiveTab] = useState<'info' | 'practice'>('info');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: student, isLoading: isLoadingStudent } = useStudent(id || '');
  const {
    data: practiceProfessional,
    isLoading: isLoadingPracticeProfessional,
  } = useStudentPracticeProfessionalForAdmin(student?.userId || null);

  const hasPracticeProfessional = !!practiceProfessional;

  const handleDownloadPDF = useCallback(async () => {
    if (!student) {
      toast.error('Error', 'No se pudo obtener la información del estudiante');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generateStudentPDF(student, student.professionalProfile || {});
      toast.success('Éxito', 'PDF generado correctamente');
    } catch (error: any) {
      toast.error('Error', `No se pudo generar el PDF: ${error.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [student, toast]);

  if (isLoadingStudent) {
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

  if (!student) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] dark:bg-slate-900 -m-4 sm:-m-6 lg:-m-8 w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Estudiante no encontrado
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No se pudo encontrar la información del estudiante.
              </p>
              <Button onClick={() => navigate('/estudiantes')} className="mt-4">
                Volver a Estudiantes
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
        <div className="px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/estudiantes')}
            className="mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Estudiantes
          </Button>
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Student Header */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
              <CardContent className="pt-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {student.firstName} {student.lastName}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {student.email}
                </p>
              </CardContent>
            </Card>

            {/* Tabs */}
            <AdminStudentTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              hasPracticeProfessional={hasPracticeProfessional}
            />

            {/* Tab Content */}
            {activeTab === 'info' ? (
              <AdminStudentInfoTab
                student={student}
                isGeneratingPDF={isGeneratingPDF}
                onDownloadPDF={handleDownloadPDF}
              />
            ) : hasPracticeProfessional && practiceProfessional ? (
              isLoadingPracticeProfessional ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <AdminStudentPracticeTab practiceProfessional={practiceProfessional} />
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

