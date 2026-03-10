import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SendInvitationEmailDto {
  @ApiProperty({
    description: 'Correo electrónico al que se enviará la invitación',
    example: 'empresa@ejemplo.com',
  })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  email: string;

  @ApiProperty({
    description: 'Días de validez de la invitación',
    example: 7,
    default: 7,
    minimum: 1,
    maximum: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  expiresInDays?: number;
}
