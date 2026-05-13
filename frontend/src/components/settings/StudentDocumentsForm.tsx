import { useState, useCallback, useEffect } from 'react';
import { FileText, Loader2, Check } from 'lucide-react';
import { useMyStudent } from '@/hooks/useStudents';
import { useToast } from '@/hooks/useToast';
import { studentsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  SocialServiceStep,
  PassedSubjectsStep,
  EnrollmentProofStep,
  DOCUMENT_STEPS,
  MAX_PDF_SIZE_BYTES,
  ACCEPTED_PDF_TYPE,
} from './StudentDocuments';

const getAxiosMessage = (error: unknown): string =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  'El documento ha sido guardado pero no pasó la validación. Revisa los detalles a continuación.';

export function StudentDocumentsForm() {
  const { data: student, isLoading, refetch } = useMyStudent();
  const { success, error: showError } = useToast();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [uploadingSubjects, setUploadingSubjects] = useState(false);
  const [validatingSubjects, setValidatingSubjects] = useState(false);
  const [selectedSubjectsFile, setSelectedSubjectsFile] = useState<File | null>(null);
  const [previewSubjectsUrl, setPreviewSubjectsUrl] = useState<string | null>(null);

  const [uploadingEnrollment, setUploadingEnrollment] = useState(false);
  const [validatingEnrollment, setValidatingEnrollment] = useState(false);
  const [selectedEnrollmentFile, setSelectedEnrollmentFile] = useState<File | null>(null);
  const [previewEnrollmentUrl, setPreviewEnrollmentUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (previewSubjectsUrl) URL.revokeObjectURL(previewSubjectsUrl);
      if (previewEnrollmentUrl) URL.revokeObjectURL(previewEnrollmentUrl);
    };
  }, [previewUrl, previewSubjectsUrl, previewEnrollmentUrl]);

  const validatePdf = useCallback(
    (file: File) => {
      if (file.type !== ACCEPTED_PDF_TYPE) {
        showError('Error', 'Solo se permiten archivos PDF');
        return false;
      }
      if (file.size > MAX_PDF_SIZE_BYTES) {
        showError('Error', 'El archivo no puede ser mayor a 10MB');
        return false;
      }
      return true;
    },
    [showError]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validatePdf(file)) {
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(file);
        });
        setSelectedFile(file);
      }
      e.target.value = '';
    },
    [validatePdf]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    const input = window.document.getElementById('document-upload');
    if (input && input instanceof HTMLInputElement) input.value = '';
  }, [previewUrl]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      showError('Error', 'Por favor selecciona un archivo');
      return;
    }
    setUploading(true);
    setValidating(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      const result = await studentsApi.uploadSocialServiceDocument(formData);
      await refetch();
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (result.socialServiceDocument?.isValidated) {
        success(
          'Documento validado',
          'Tu solvencia de horas sociales ha sido validada y guardada exitosamente.'
        );
      } else {
        showError(
          'Documento inválido',
          result.socialServiceDocument?.validationErrors?.join('. ') ||
            'El documento no cumple con los requisitos. El archivo ha sido guardado para revisión.'
        );
      }
    } catch (error: unknown) {
      await refetch();
      showError('Documento inválido', getAxiosMessage(error));
    } finally {
      setUploading(false);
      setValidating(false);
    }
  }, [selectedFile, previewUrl, showError, success, refetch]);

  const handleSubjectsFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validatePdf(file)) {
        setPreviewSubjectsUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(file);
        });
        setSelectedSubjectsFile(file);
      }
      e.target.value = '';
    },
    [validatePdf]
  );

  const handleSubjectsClearSelection = useCallback(() => {
    setSelectedSubjectsFile(null);
    if (previewSubjectsUrl) {
      URL.revokeObjectURL(previewSubjectsUrl);
      setPreviewSubjectsUrl(null);
    }
    const input = window.document.getElementById('subjects-document-upload');
    if (input && input instanceof HTMLInputElement) input.value = '';
  }, [previewSubjectsUrl]);

  const handleSubjectsUpload = useCallback(async () => {
    if (!selectedSubjectsFile) {
      showError('Error', 'Por favor selecciona un archivo');
      return;
    }
    setUploadingSubjects(true);
    setValidatingSubjects(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedSubjectsFile);
      await studentsApi.uploadPassedSubjectsDocument(formData);
      await refetch();
      setSelectedSubjectsFile(null);
      if (previewSubjectsUrl) {
        URL.revokeObjectURL(previewSubjectsUrl);
        setPreviewSubjectsUrl(null);
      }
      success(
        'Documento validado',
        'Tu documento de materias ganadas ha sido validado y guardado exitosamente.'
      );
    } catch (error: unknown) {
      await refetch();
      showError('Documento inválido', getAxiosMessage(error));
    } finally {
      setUploadingSubjects(false);
      setValidatingSubjects(false);
    }
  }, [selectedSubjectsFile, previewSubjectsUrl, showError, success, refetch]);

  const handleEnrollmentFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validatePdf(file)) {
        setPreviewEnrollmentUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(file);
        });
        setSelectedEnrollmentFile(file);
      }
      e.target.value = '';
    },
    [validatePdf],
  );

  const handleEnrollmentClearSelection = useCallback(() => {
    setSelectedEnrollmentFile(null);
    if (previewEnrollmentUrl) {
      URL.revokeObjectURL(previewEnrollmentUrl);
      setPreviewEnrollmentUrl(null);
    }
    const input = window.document.getElementById('enrollment-proof-upload');
    if (input && input instanceof HTMLInputElement) input.value = '';
  }, [previewEnrollmentUrl]);

  const handleEnrollmentUpload = useCallback(async () => {
    if (!selectedEnrollmentFile) {
      showError('Error', 'Por favor selecciona un archivo');
      return;
    }
    setUploadingEnrollment(true);
    setValidatingEnrollment(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedEnrollmentFile);
      await studentsApi.uploadEnrollmentProofDocument(formData);
      await refetch();
      setSelectedEnrollmentFile(null);
      if (previewEnrollmentUrl) {
        URL.revokeObjectURL(previewEnrollmentUrl);
        setPreviewEnrollmentUrl(null);
      }
      success(
        'Documento validado',
        'Tu comprobante de inscripción ha sido validado y guardado exitosamente.',
      );
    } catch (error: unknown) {
      await refetch();
      showError('Documento inválido', getAxiosMessage(error));
    } finally {
      setUploadingEnrollment(false);
      setValidatingEnrollment(false);
    }
  }, [selectedEnrollmentFile, previewEnrollmentUrl, showError, success, refetch]);

  if (isLoading) {
    return (
      <Card className="border-2 border-slate-200 dark:border-slate-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const document = student?.socialServiceDocument;
  const hasValidDocument = document?.isValidated === true;
  const showUploadSection = !hasValidDocument || !!selectedFile;

  const subjectsDocument = student?.passedSubjectsDocument;
  const hasValidSubjectsDocument = subjectsDocument?.isValidated === true;
  const showUploadSubjectsSection = !hasValidSubjectsDocument || !!selectedSubjectsFile;

  const enrollmentDocument = student?.enrollmentProofDocument;
  const hasValidEnrollmentDocument = enrollmentDocument?.isValidated === true;
  const showUploadEnrollmentSection =
    !hasValidEnrollmentDocument || !!selectedEnrollmentFile;

  return (
    <Card className="border-2 border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Documentación</CardTitle>
            <CardDescription className="mt-1">
              Completa los pasos para finalizar tu documentación
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            {DOCUMENT_STEPS.map((step, index) => {
              const isActive = activeStep === step.number;
              const isCompleted =
                (step.number === 1 && hasValidDocument) ||
                (step.number === 2 && hasValidSubjectsDocument) ||
                (step.number === 3 && hasValidEnrollmentDocument);
              const isLast = index === DOCUMENT_STEPS.length - 1;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setActiveStep(step.number as 1 | 2 | 3)}
                      className={cn(
                        'relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all cursor-pointer hover:scale-105',
                        isActive
                          ? 'bg-primary border-primary text-white'
                          : isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <span className="text-sm font-semibold">{step.number}</span>
                      )}
                    </button>
                    <div className="mt-2 text-center max-w-[120px]">
                      <p
                        className={cn(
                          'text-xs font-medium',
                          isActive
                            ? 'text-primary'
                            : isCompleted
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-slate-500 dark:text-slate-400'
                        )}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-4 transition-colors',
                        isCompleted ||
                        (step.number === 1 && hasValidDocument && activeStep > step.number) ||
                        (step.number === 2 && hasValidSubjectsDocument && activeStep > step.number) ||
                        isActive
                          ? 'bg-primary'
                          : 'bg-slate-300 dark:bg-slate-600'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-h-[400px]">
          {activeStep === 1 && (
            <SocialServiceStep
              document={document}
              hasValidDocument={hasValidDocument}
              showUploadSection={showUploadSection}
              uploading={uploading}
              validating={validating}
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              onFileSelect={handleFileSelect}
              onClearSelection={handleClearSelection}
              onUpload={handleUpload}
              onRefetch={refetch}
              onSuccess={success}
              onError={showError}
              onStepChange={setActiveStep}
              activeStep={activeStep}
            />
          )}

          {activeStep === 2 && (
            <PassedSubjectsStep
              document={subjectsDocument}
              hasValidDocument={hasValidSubjectsDocument}
              showUploadSection={showUploadSubjectsSection}
              uploading={uploadingSubjects}
              validating={validatingSubjects}
              selectedFile={selectedSubjectsFile}
              previewUrl={previewSubjectsUrl}
              onFileSelect={handleSubjectsFileSelect}
              onClearSelection={handleSubjectsClearSelection}
              onUpload={handleSubjectsUpload}
              onRefetch={refetch}
              onSuccess={success}
              onError={showError}
              onStepChange={setActiveStep}
              activeStep={activeStep}
            />
          )}

          {activeStep === 3 && (
            <EnrollmentProofStep
              document={enrollmentDocument}
              hasValidDocument={hasValidEnrollmentDocument}
              showUploadSection={showUploadEnrollmentSection}
              uploading={uploadingEnrollment}
              validating={validatingEnrollment}
              selectedFile={selectedEnrollmentFile}
              previewUrl={previewEnrollmentUrl}
              onFileSelect={handleEnrollmentFileSelect}
              onClearSelection={handleEnrollmentClearSelection}
              onUpload={handleEnrollmentUpload}
              onRefetch={refetch}
              onSuccess={success}
              onError={showError}
              onStepChange={setActiveStep}
              activeStep={activeStep}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
