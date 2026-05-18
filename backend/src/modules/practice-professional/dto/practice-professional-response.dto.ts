import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationResponseDto } from '@/modules/opportunities/dto/application-response.dto';
import { OpportunityResponseDto } from '@/modules/opportunities/dto/opportunity-response.dto';
import { ActivityResponseDto } from './activity-response.dto';
import { PracticeStatus } from './practice-history-item.dto';

export class PracticeEvaluationResponseDto {
  @ApiProperty({ example: 4 })
  qualityAndOrganization: number;

  @ApiProperty({ example: 4 })
  knowledgeAndApplication: number;

  @ApiProperty({ example: 4 })
  learningCapacity: number;

  @ApiProperty({ example: 4 })
  attendanceAndPunctuality: number;

  @ApiProperty({ example: 4 })
  initiativeAndJudgment: number;
}

export class PracticeProfessionalResponseDto {
  @ApiProperty({
    description: 'Aplicación aceptada del estudiante',
    type: ApplicationResponseDto,
  })
  application: ApplicationResponseDto;

  @ApiProperty({
    description: 'Oportunidad asociada a la práctica profesional',
    type: OpportunityResponseDto,
  })
  opportunity: OpportunityResponseDto;

  @ApiProperty({
    description: 'Lista de actividades realizadas',
    type: [ActivityResponseDto],
  })
  activities: ActivityResponseDto[];

  @ApiProperty({
    description: 'Total de horas registradas',
    example: 120,
  })
  totalHours: number;

  @ApiProperty({
    description: 'Total de horas aprobadas',
    example: 100,
  })
  approvedHours: number;

  @ApiProperty({
    description: 'Estado de la práctica profesional',
    enum: PracticeStatus,
    example: PracticeStatus.EN_CURSO,
  })
  status: PracticeStatus;

  @ApiPropertyOptional({
    description: 'Evaluación final de la práctica profesional',
    type: PracticeEvaluationResponseDto,
  })
  practiceEvaluation?: PracticeEvaluationResponseDto;
}
