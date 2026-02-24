import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@/modules/auth/schemas/user.schema';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@itca.edu.sv',
  })
  email: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'ID de la carrera (solo para coordinadores)',
    example: '507f1f77bcf86cd799439011',
  })
  careerId?: string;

  @ApiProperty({
    description: 'Estado activo/inactivo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indica si el usuario tiene contraseña temporal',
    example: false,
  })
  isTemporaryPassword: boolean;

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

export class CreateUserResponseDto extends UserResponseDto {
  @ApiProperty({
    description: 'Contraseña generada para el usuario',
    example: 'aB3$kL9mN2pQ',
  })
  generatedPassword: string;
}
