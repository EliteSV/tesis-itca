import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsMongoId,
  IsDateString,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Nombre del estudiante',
    example: 'Juan',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del estudiante',
    example: 'Pérez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  lastName: string;

  @ApiProperty({
    description: 'Correo electrónico del estudiante',
    example: 'juan.perez@itca.edu.sv',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Número de identificación (carnet, DUI, etc.)',
    example: '20240001',
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de identificación es requerido' })
  identificationNumber: string;

  @ApiPropertyOptional({
    description: 'Teléfono del estudiante',
    example: '2222-0000',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Dirección del estudiante',
    example: 'San Salvador, El Salvador',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento',
    example: '2000-01-15',
  })
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser válida' })
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Género del estudiante',
    example: 'Masculino',
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({
    description: 'ID de la carrera',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'El ID de la carrera debe ser válido' })
  @IsNotEmpty({ message: 'La carrera es requerida' })
  careerId: string;
}
