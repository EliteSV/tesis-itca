import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateInvitationDto {
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
