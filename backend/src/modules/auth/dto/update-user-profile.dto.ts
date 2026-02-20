import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@itca.edu.sv',
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
