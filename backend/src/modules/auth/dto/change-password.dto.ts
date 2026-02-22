import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual del usuario',
    example: 'PasswordActual123!',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 8 caracteres)',
    example: 'NuevaPassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

