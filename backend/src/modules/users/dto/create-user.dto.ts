import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, IsMongoId, ValidateIf } from 'class-validator';
import { UserRole } from '@/modules/auth/schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@itca.edu.sv',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole, { message: 'El rol debe ser válido' })
  @IsNotEmpty({ message: 'El rol es requerido' })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'ID de la carrera (requerido si el rol es coordinador)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'El ID de carrera debe ser válido' })
  @ValidateIf((o) => o.role === UserRole.COORDINADOR)
  @IsNotEmpty({ message: 'La carrera es requerida para coordinadores' })
  careerId?: string;
}
