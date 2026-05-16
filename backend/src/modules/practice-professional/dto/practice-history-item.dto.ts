import { ApiProperty } from '@nestjs/swagger';
import { PracticeStatus } from '../schemas/practice-professional.schema';
export { PracticeStatus };

export class PracticeHistoryItemDto {
  @ApiProperty({
    description: 'ID de la aplicación',
    example: '507f1f77bcf86cd799439011',
  })
  applicationId: string;

  @ApiProperty({
    description: 'ID de la oportunidad',
    example: '507f1f77bcf86cd799439012',
  })
  opportunityId: string;

  @ApiProperty({
    description: 'Título de la oportunidad',
    example: 'Desarrollador Full Stack',
  })
  opportunityTitle: string;

  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Tech Solutions S.A.',
  })
  companyName: string;

  @ApiProperty({
    description: 'Logo de la empresa (opcional)',
    example: '/uploads/logos/company.png',
    required: false,
  })
  companyLogo?: string;

  @ApiProperty({
    description: 'Fecha de inicio de la práctica',
    example: '2025-01-15T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de fin de la práctica (última actividad aprobada)',
    example: '2025-06-15T00:00:00.000Z',
    required: false,
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Total de horas trabajadas',
    example: 240,
  })
  totalHours: number;

  @ApiProperty({
    description: 'Total de horas aprobadas',
    example: 220,
  })
  approvedHours: number;

  @ApiProperty({
    description: 'Horas requeridas para completar la práctica',
    example: 240,
  })
  requiredHours: number;

  @ApiProperty({
    description: 'Estado de la práctica',
    enum: PracticeStatus,
    example: PracticeStatus.EN_CURSO,
  })
  status: PracticeStatus;
}
