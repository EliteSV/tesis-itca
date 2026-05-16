import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '@/modules/opportunities/schemas/application.schema';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la aplicación',
    enum: ApplicationStatus,
    example: ApplicationStatus.ACCEPTED,
  })
  @IsEnum(ApplicationStatus)
  @IsNotEmpty({ message: 'El estado es requerido' })
  status: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Razón de rechazo (requerido si el estado es rechazada)',
    example: 'No cumple con los requisitos mínimos',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
