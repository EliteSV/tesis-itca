import { ApiProperty } from '@nestjs/swagger';

export class ValidateInvitationResponseDto {
  @ApiProperty({
    description: 'Indica si el token es válido',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo',
    example: 'Invitación válida',
  })
  message: string;
}
