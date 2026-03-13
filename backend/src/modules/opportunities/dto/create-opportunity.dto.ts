import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  IsDateString,
} from 'class-validator';
import {
  OpportunityStatus,
  OpportunityModality,
  OpportunityWorkType,
} from '@/modules/opportunities/schemas/opportunity.schema';

export class CreateOpportunityDto {
  @ApiProperty({
    description: 'Título de la oportunidad',
    example: 'Desarrollador Full Stack',
  })
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  title: string;

  @ApiProperty({
    description: 'Descripción de la oportunidad',
    example: 'Buscamos un desarrollador con experiencia en React y Node.js',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @ApiProperty({
    description: 'ID de la carrera asociada',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty({ message: 'La carrera es requerida' })
  careerId: string;

  @ApiProperty({
    description: 'Número total de horas',
    example: 480,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'El número de horas debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El número de horas es requerido' })
  totalHours: number;

  @ApiProperty({
    description: 'Actividades a realizar',
    example: '• Desarrollo de aplicaciones web\n• Mantenimiento de sistemas',
  })
  @IsString()
  @IsNotEmpty({ message: 'Las actividades son requeridas' })
  activities: string;

  @ApiProperty({
    description: 'ID del usuario responsable del proceso de entrevista',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty({ message: 'El responsable es requerido' })
  responsibleUserId: string;

  @ApiProperty({
    description: 'Número de vacantes disponibles',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1, { message: 'El número de vacantes debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El número de vacantes es requerido' })
  availablePositions: number;

  @ApiProperty({
    description: 'Modalidad de trabajo',
    enum: OpportunityModality,
    example: OpportunityModality.PRESENCIAL,
  })
  @IsEnum(OpportunityModality, {
    message: 'La modalidad debe ser presencial o remoto',
  })
  @IsNotEmpty({ message: 'La modalidad es requerida' })
  modality: OpportunityModality;

  @ApiProperty({
    description: 'Tipo de trabajo',
    enum: OpportunityWorkType,
    example: OpportunityWorkType.FULL_TIME,
  })
  @IsEnum(OpportunityWorkType, {
    message: 'El tipo de trabajo debe ser part-time o full-time',
  })
  @IsNotEmpty({ message: 'El tipo de trabajo es requerido' })
  workType: OpportunityWorkType;

  @ApiProperty({
    description: 'Fecha de expiración de la oportunidad',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsNotEmpty({ message: 'La fecha de expiración es requerida' })
  expirationDate: string;

  @ApiPropertyOptional({
    description: 'Estado de la oportunidad',
    enum: OpportunityStatus,
    default: OpportunityStatus.ACTIVE,
  })
  @IsEnum(OpportunityStatus)
  @IsOptional()
  status?: OpportunityStatus;
}
