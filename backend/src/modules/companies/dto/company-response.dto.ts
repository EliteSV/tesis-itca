import { ApiProperty } from '@nestjs/swagger';
import { CompanyStatus } from '@/modules/companies/schemas/company.schema';

export class CompanyResponseDto {
  @ApiProperty({
    description: 'ID de la empresa',
    example: '60d0fe4f5e36760015e0a0a0',
  })
  _id: string;

  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Empresa Ejemplo S.A. de C.V.',
  })
  name: string;

  @ApiProperty({
    description: 'NIT de la empresa',
    example: '0614-123456-101-5',
  })
  nit: string;

  @ApiProperty({
    description: 'Dirección de la empresa',
    example: 'Av. Las Palmas, San Salvador',
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '+503 2234-5678',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Correo electrónico de contacto',
    example: 'contacto@empresa.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Sector de la empresa',
    example: 'Tecnología',
    required: false,
  })
  sector?: string;

  @ApiProperty({
    description: 'Descripción de la empresa',
    example: 'Empresa dedicada al desarrollo de software',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Estado de la empresa',
    enum: CompanyStatus,
    example: CompanyStatus.ACTIVE,
  })
  status: CompanyStatus;

  @ApiProperty({
    description: 'Indica si la empresa está activa',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación de la empresa',
    example: '2023-01-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización de la empresa',
    example: '2023-01-01T11:00:00.000Z',
  })
  updatedAt: Date;
}
