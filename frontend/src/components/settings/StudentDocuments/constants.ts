export const DOCUMENT_STEPS = [
  {
    number: 1 as const,
    title: 'Solvencia de horas sociales',
    description: 'Sube tu solvencia de horas sociales para validación',
  },
  {
    number: 2 as const,
    title: 'Validación de materias',
    description: 'Sube tu documento de materias ganadas para validación',
  },
  {
    number: 3 as const,
    title: 'Comprobante de inscripción',
    description: 'Próximamente',
  },
] as const;

export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_PDF_TYPE = 'application/pdf';
