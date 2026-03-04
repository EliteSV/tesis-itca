import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateCareerDto {
  @ApiProperty({
    description: 'Código de la carrera',
    example: 'ING-SIS',
  })
  @IsString()
  @IsNotEmpty({ message: 'El código de la carrera es requerido' })
  code: string;

  @ApiProperty({
    description: 'Nombre de la carrera',
    example: 'Ingeniería en Sistemas Informáticos',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la carrera es requerido' })
  name: string;

  @ApiProperty({
    description: 'ID de la categoría de carrera',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'El ID de la categoría debe ser válido' })
  @IsNotEmpty({ message: 'La categoría de carrera es requerida' })
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Descripción de la carrera',
    example: 'Carrera enfocada en el desarrollo de sistemas informáticos',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Duración de la carrera en años',
    example: 5,
  })
  @IsNumber()
  @Min(1, { message: 'La duración debe ser mayor a 0' })
  @IsOptional()
  duration?: number;
}
