export interface SocialServiceDocumentData {
  fileData?: string;
  fileName: string;
  isValidated: boolean;
  validatedAt?: string;
  validationErrors?: string[];
  validationWarnings?: string[];
  hasValidStamp?: boolean;
  hasValidFormat?: boolean;
}

export interface SocialServiceStepProps {
  document: SocialServiceDocumentData | undefined;
  hasValidDocument: boolean;
  showUploadSection: boolean;
  uploading: boolean;
  validating: boolean;
  selectedFile: File | null;
  previewUrl: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSelection: () => void;
  onUpload: () => void;
  onRefetch: () => Promise<unknown>;
  onSuccess: (title: string, description: string) => void;
  onError: (title: string, message: string) => void;
  onStepChange: (step: 1 | 2 | 3) => void;
  activeStep: 1 | 2 | 3;
}

export interface PassedSubjectsDocumentData {
  fileData?: string;
  fileName: string;
  isValidated: boolean;
  validatedAt?: string;
  validationErrors?: string[];
  validationWarnings?: string[];
  passedCount?: number;
  totalSubjects?: number;
  validationAccuracyPercent?: number;
  passedSubjects?: Array<{
    cycle: string;
    code: string;
    name?: string;
    subject?: string;
  }>;
}

export interface PassedSubjectsStepProps {
  document: PassedSubjectsDocumentData | undefined;
  hasValidDocument: boolean;
  showUploadSection: boolean;
  uploading: boolean;
  validating: boolean;
  selectedFile: File | null;
  previewUrl: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSelection: () => void;
  onUpload: () => void;
  onRefetch: () => Promise<unknown>;
  onSuccess: (title: string, description: string) => void;
  onError: (title: string, message: string) => void;
  onStepChange: (step: 1 | 2 | 3) => void;
  activeStep: 1 | 2 | 3;
}

export interface EnrollmentProofDocumentData {
  fileData?: string;
  fileName: string;
  isValidated: boolean;
  validatedAt?: string;
  validationErrors?: string[];
  validationWarnings?: string[];
  documentStudentName?: string;
  documentIdentificationNumber?: string;
  cycle?: string;
  enrolledSubjects?: Array<{
    name: string;
    code?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export interface EnrollmentProofStepProps {
  document: EnrollmentProofDocumentData | undefined;
  hasValidDocument: boolean;
  showUploadSection: boolean;
  uploading: boolean;
  validating: boolean;
  selectedFile: File | null;
  previewUrl: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSelection: () => void;
  onUpload: () => void;
  onRefetch: () => Promise<unknown>;
  onSuccess: (title: string, description: string) => void;
  onError: (title: string, message: string) => void;
  onStepChange: (step: 1 | 2 | 3) => void;
  activeStep: 1 | 2 | 3;
}
