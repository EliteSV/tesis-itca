import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CareerCategoryResponseDto {
  @ApiProperty({
    description: 'ID de la categoría',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Ingeniería',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Carreras relacionadas con ingeniería y tecnología',
  })
  description?: string;

  @ApiProperty({
    description: 'Horas profesionales requeridas',
    example: 160,
    default: 0,
  })
  requiredProfessionalHours: number;

  @ApiProperty({
    description: 'Estado activo/inactivo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

