import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateCareerCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría de carrera',
    example: 'Ingeniería',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la categoría es requerido' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Carreras relacionadas con ingeniería y tecnología',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Horas profesionales requeridas',
    example: 160,
    default: 0,
  })
  @IsNumber({}, { message: 'Las horas profesionales deben ser un número' })
  @Min(0, { message: 'Las horas profesionales no pueden ser negativas' })
  @IsOptional()
  requiredProfessionalHours?: number;
}
