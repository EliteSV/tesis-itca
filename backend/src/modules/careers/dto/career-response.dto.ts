import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CareerResponseDto {
  @ApiProperty({
    description: 'ID de la carrera',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Código de la carrera',
    example: 'ING-SIS',
  })
  code: string;

  @ApiProperty({
    description: 'Nombre de la carrera',
    example: 'Ingeniería en Sistemas Informáticos',
  })
  name: string;

  @ApiProperty({
    description: 'ID de la categoría de carrera',
    example: '507f1f77bcf86cd799439011',
  })
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Descripción de la carrera',
    example: 'Carrera enfocada en el desarrollo de sistemas informáticos',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Duración de la carrera en años',
    example: 5,
  })
  duration?: number;

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
