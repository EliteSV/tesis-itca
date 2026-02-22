import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@/modules/auth/schemas/user.schema';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@itca.edu.sv',
  })
  email: string;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Pérez' })
  name: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.ESTUDIANTE,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Indica si el usuario tiene contraseña temporal',
    example: false,
    required: false,
  })
  isTemporaryPassword?: boolean;

  @ApiProperty({
    description: 'Indica si el perfil del estudiante está incompleto',
    example: false,
    required: false,
  })
  isProfileIncomplete?: boolean;

  @ApiProperty({
    description: 'ID de la carrera (solo para coordinadores)',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  careerId?: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Información del usuario',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}
