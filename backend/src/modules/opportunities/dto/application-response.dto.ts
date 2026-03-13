import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@/modules/opportunities/schemas/application.schema';

export class ApplicationResponseDto {
  @ApiProperty({ description: 'ID de la aplicación' })
  _id: string;

  @ApiProperty({ description: 'ID de la oportunidad' })
  opportunityId: string;

  @ApiProperty({ description: 'ID del estudiante' })
  studentId: string;

  @ApiProperty({ description: 'Información del estudiante' })
  student?: {
    _id: string;
    name: string;
    email: string;
  };

  @ApiPropertyOptional({ description: 'Carta de presentación' })
  coverLetter?: string;

  @ApiProperty({
    description: 'Estado de la aplicación',
    enum: ApplicationStatus,
  })
  status: ApplicationStatus;

  @ApiPropertyOptional({ description: 'Razón de rechazo' })
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'Calificación de match con la oportunidad (1.0 a 5.0)',
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  matchScore?: number;

  @ApiPropertyOptional({
    description: 'Fecha de finalización de la práctica profesional',
    type: Date,
  })
  finalizedAt?: Date;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;
}

