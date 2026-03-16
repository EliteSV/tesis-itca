import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { PracticeEvaluationDto } from './practice-evaluation.dto';

export class FinishPracticeDto {
  @ApiProperty({
    description: 'Motivo de finalización anticipada (requerido si las horas aprobadas son menores a las horas requeridas)',
    example: 'El estudiante ha completado los objetivos principales de la práctica antes del tiempo estimado.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(10, {
    message: 'El motivo debe tener al menos 10 caracteres',
  })
  earlyTerminationReason?: string;

  @ApiProperty({
    description: 'Evaluación del trabajo realizado por el estudiante (requerida)',
    type: PracticeEvaluationDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => PracticeEvaluationDto)
  evaluation: PracticeEvaluationDto;
}
