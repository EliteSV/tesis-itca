import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Eye, Upload, Loader2, X, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { studentsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { PassedSubjectsStepProps } from './types';

function base64ToBlobUrl(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
}

export function PassedSubjectsStep({
  document: subjectsDoc,
  hasValidDocument,
  showUploadSection,
  uploading,
  validating,
  selectedFile,
  previewUrl,
  onFileSelect,
  onClearSelection,
  onUpload,
  onRefetch,
  onSuccess,
  onError,
  onStepChange,
  activeStep,
}: PassedSubjectsStepProps) {
  const [storedDocumentUrl, setStoredDocumentUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    if (subjectsDoc?.fileData) {
      const url = base64ToBlobUrl(subjectsDoc.fileData);
      blobUrlRef.current = url;
      setStoredDocumentUrl(url);
    } else {
      setStoredDocumentUrl(null);
    }
  }, [subjectsDoc?.fileData]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento y todas sus validaciones?')) return;
    try {
      await studentsApi.deletePassedSubjectsDocument();
      await onRefetch();
      onSuccess('Documento eliminado', 'El documento de materias ganadas ha sido eliminado exitosamente.');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al eliminar el documento';
      onError('Error', message);
    }
  };

  const activeDocumentUrl = previewUrl && selectedFile ? previewUrl : storedDocumentUrl;

  return (
    <div className="space-y-6">
      {subjectsDoc && (
        <div className="space-y-3">
          {hasValidDocument ? (
            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-800 dark:text-green-200">Documento validado</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Tu documento de materias ganadas ha sido validado exitosamente. Todas las materias del plan aparecen como aprobadas.
                    {subjectsDoc.validatedAt && (
                      <span className="block mt-1 text-xs">
                        Validado el: {new Date(subjectsDoc.validatedAt).toLocaleString('es')}
                      </span>
                    )}
                  </AlertDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          ) : (
            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertTitle className="text-red-800 dark:text-red-200">Documento no válido</AlertTitle>
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    El documento fue guardado pero no pasó la validación.
                    {subjectsDoc.validatedAt && (
                      <span className="block mt-1 text-xs">
                        Validado el: {new Date(subjectsDoc.validatedAt).toLocaleString('es')}
                      </span>
                    )}
                    {typeof subjectsDoc.passedCount === 'number' &&
                      typeof subjectsDoc.totalSubjects === 'number' &&
                      subjectsDoc.passedCount < subjectsDoc.totalSubjects - 1 && (
                        <span className="block mt-2 text-sm font-medium">
                          {subjectsDoc.passedCount} de {subjectsDoc.totalSubjects} materias aparecen como aprobadas. Todas deben estarlo (la última es opcional).
                        </span>
                      )}
                  </AlertDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          )}

          {subjectsDoc.validationErrors && subjectsDoc.validationErrors.length > 0 && (
            <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-200">Errores de validación</AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-300">
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {subjectsDoc.validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {showUploadSection && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="subjects-document-upload"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Documento de Materias Ganadas (PDF)
              </label>
              {hasValidDocument && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = window.document.getElementById('subjects-document-upload');
                    if (input && input instanceof HTMLInputElement) input.click();
                  }}
                  disabled={uploading || validating}
                >
                  Reemplazar documento
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  id="subjects-document-upload"
                  type="file"
                  accept=".pdf"
                  onChange={onFileSelect}
                  className="hidden"
                  disabled={uploading || validating}
                />
                <label
                  htmlFor="subjects-document-upload"
                  className={cn(
                    'flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                    uploading || validating
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800',
                    selectedFile ? 'border-primary bg-primary/5' : 'border-slate-300 dark:border-slate-700'
                  )}
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : 'Seleccionar archivo PDF'}
                  </span>
                </label>
              </div>
              {selectedFile && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearSelection}
                    disabled={uploading || validating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={onUpload}
                    disabled={uploading || validating}
                    className="flex-shrink-0"
                  >
                    {uploading || validating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {validating ? 'Validando...' : 'Subiendo...'}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir y validar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              El documento debe ser un PDF con el formato oficial de materias ganadas del ITCA. Tamaño máximo: 10MB
            </p>
          </div>
        </div>
      )}

      {activeDocumentUrl && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Previsualización del documento
          </label>
          <div className="border-2 border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
            <object
              key={activeDocumentUrl}
              data={activeDocumentUrl}
              type="application/pdf"
              className="w-full h-[600px]"
              aria-label="Previsualización del documento"
            >
              <iframe
                src={activeDocumentUrl}
                title="Previsualización del documento"
                className="w-full h-[600px]"
              />
            </object>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          variant="outline"
          onClick={() => onStepChange(1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </Button>
        {activeStep < 3 && (
          <Button onClick={() => onStepChange(3)} className="flex items-center gap-2">
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
