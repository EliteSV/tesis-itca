import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ActivityStatus } from '../schemas/practice-activity.schema';

export class UpdateActivityStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la actividad',
    enum: ActivityStatus,
    example: ActivityStatus.APPROVED,
  })
  @IsEnum(ActivityStatus, {
    message: 'El estado debe ser uno de: aprobada, rechazada',
  })
  status: ActivityStatus;

  @ApiProperty({
    description: 'Razón de rechazo (requerida si el estado es rechazada)',
    example: 'Las horas reportadas no coinciden con las actividades descritas',
    required: false,
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
