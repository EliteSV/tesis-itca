import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { CompanyStatus } from '@/modules/companies/schemas/company.schema';

export class CreateInitialUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del usuario es requerido' })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@empresa.com',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email del usuario es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Password123!',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Empresa Ejemplo S.A. de C.V.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la empresa es requerido' })
  name: string;

  @ApiProperty({
    description: 'NIT de la empresa',
    example: '0614-123456-101-5',
  })
  @IsString()
  @IsNotEmpty({ message: 'El NIT de la empresa es requerido' })
  nit: string;

  @ApiPropertyOptional({
    description: 'Dirección de la empresa',
    example: 'Av. Las Palmas, San Salvador',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+503 2234-5678',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico de contacto',
    example: 'contacto@empresa.com',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Sector de la empresa',
    example: 'Tecnología',
  })
  @IsString()
  @IsOptional()
  sector?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la empresa',
    example: 'Empresa dedicada al desarrollo de software',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Estado de la empresa',
    enum: CompanyStatus,
    default: CompanyStatus.ACTIVE,
  })
  @IsEnum(CompanyStatus)
  @IsOptional()
  status?: CompanyStatus;

  @ApiPropertyOptional({
    description: 'Logo de la empresa en formato Base64 (data URL)',
    example: 'data:image/png;base64,...',
  })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({
    description: 'Datos del usuario inicial (opcional)',
    type: CreateInitialUserDto,
  })
  @IsOptional()
  initialUser?: CreateInitialUserDto;
}
