import { ApiProperty } from '@nestjs/swagger';

export class InvitationResponseDto {
  @ApiProperty({
    description: 'ID de la invitación',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Token único de la invitación',
    example: 'abc123def456ghi789',
  })
  token: string;

  @ApiProperty({
    description: 'Enlace completo de invitación',
    example: 'http://localhost:5173/invitation/abc123def456ghi789',
  })
  invitationLink: string;

  @ApiProperty({
    description: 'Fecha de expiración',
    example: '2024-12-31T23:59:59.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Indica si la invitación ha sido usada',
    example: false,
  })
  isUsed: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
