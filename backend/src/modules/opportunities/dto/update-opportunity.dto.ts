import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import {
  OpportunityStatus,
  OpportunityModality,
  OpportunityWorkType,
} from '@/modules/opportunities/schemas/opportunity.schema';

export class UpdateOpportunityDto {
  @ApiPropertyOptional({
    description: 'Título de la oportunidad',
    example: 'Desarrollador Full Stack',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la oportunidad',
    example: 'Buscamos un desarrollador con experiencia en React y Node.js',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'ID de la carrera asociada',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsOptional()
  careerId?: string;

  @ApiPropertyOptional({
    description: 'Número total de horas',
    example: 480,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'El número de horas debe ser mayor a 0' })
  @IsOptional()
  totalHours?: number;

  @ApiPropertyOptional({
    description: 'Actividades a realizar',
    example: '• Desarrollo de aplicaciones web\n• Mantenimiento de sistemas',
  })
  @IsString()
  @IsOptional()
  activities?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario responsable del proceso de entrevista',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsOptional()
  responsibleUserId?: string;

  @ApiPropertyOptional({
    description: 'Número de vacantes disponibles',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'El número de vacantes debe ser mayor a 0' })
  @IsOptional()
  availablePositions?: number;

  @ApiPropertyOptional({
    description: 'Modalidad de trabajo',
    enum: OpportunityModality,
    example: OpportunityModality.PRESENCIAL,
  })
  @IsEnum(OpportunityModality)
  @IsOptional()
  modality?: OpportunityModality;

  @ApiPropertyOptional({
    description: 'Tipo de trabajo',
    enum: OpportunityWorkType,
    example: OpportunityWorkType.FULL_TIME,
  })
  @IsEnum(OpportunityWorkType)
  @IsOptional()
  workType?: OpportunityWorkType;

  @ApiPropertyOptional({
    description: 'Fecha de expiración de la oportunidad',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @ApiPropertyOptional({
    description: 'Estado de la oportunidad',
    enum: OpportunityStatus,
  })
  @IsEnum(OpportunityStatus)
  @IsOptional()
  status?: OpportunityStatus;

  @ApiPropertyOptional({
    description: 'Indica si la oportunidad está activa',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
