import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  OpportunityStatus,
  OpportunityModality,
  OpportunityWorkType,
} from '@/modules/opportunities/schemas/opportunity.schema';

export class OpportunityResponseDto {
  @ApiProperty({ description: 'ID de la oportunidad' })
  _id: string;

  @ApiProperty({ description: 'Título de la oportunidad' })
  title: string;

  @ApiPropertyOptional({ description: 'Descripción de la oportunidad' })
  description?: string;

  @ApiPropertyOptional({ description: 'Actividades a realizar' })
  activities?: string;

  @ApiProperty({ description: 'ID de la carrera asociada' })
  careerId: string;

  @ApiProperty({ description: 'Información de la carrera' })
  career?: {
    _id: string;
    name: string;
    code: string;
  };

  @ApiProperty({ description: 'ID de la empresa' })
  companyId: string;

  @ApiProperty({ description: 'Información de la empresa' })
  company?: {
    _id: string;
    name: string;
    logo?: string;
    nit?: string;
    address?: string;
    phone?: string;
    email?: string;
    sector?: string;
    description?: string;
    status?: string;
    isActive?: boolean;
  };

  @ApiPropertyOptional({ description: 'ID del usuario responsable' })
  responsibleUserId?: string;

  @ApiPropertyOptional({ description: 'Información del usuario responsable' })
  responsibleUser?: {
    _id: string;
    name: string;
    email: string;
  };

  @ApiProperty({ description: 'Número total de horas' })
  totalHours: number;

  @ApiProperty({ description: 'Número de vacantes disponibles' })
  availablePositions: number;

  @ApiPropertyOptional({
    description: 'Modalidad de trabajo',
    enum: OpportunityModality,
  })
  modality?: OpportunityModality;

  @ApiPropertyOptional({
    description: 'Tipo de trabajo',
    enum: OpportunityWorkType,
  })
  workType?: OpportunityWorkType;

  @ApiPropertyOptional({ description: 'Fecha de expiración de la oportunidad' })
  expirationDate?: Date;

  @ApiProperty({
    description: 'Estado de la oportunidad',
    enum: OpportunityStatus,
  })
  status: OpportunityStatus;

  @ApiProperty({ description: 'Indica si la oportunidad está activa' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Token para compartir la oportunidad' })
  shareToken?: string;

  @ApiPropertyOptional({ description: 'Enlace para compartir' })
  shareLink?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de actualización' })
  updatedAt: Date;
}
