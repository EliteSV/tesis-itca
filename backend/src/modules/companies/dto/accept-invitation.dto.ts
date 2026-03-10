import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MinLength,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AcceptInvitationCompanyDto {
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
}

export class AcceptInvitationUserDto {
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
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Datos de la empresa',
    type: AcceptInvitationCompanyDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => AcceptInvitationCompanyDto)
  company: AcceptInvitationCompanyDto;

  @ApiProperty({
    description: 'Datos del usuario',
    type: AcceptInvitationUserDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => AcceptInvitationUserDto)
  user: AcceptInvitationUserDto;
}
