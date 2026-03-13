import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'ID de la oportunidad a la que se aplica',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'El ID de la oportunidad debe ser válido' })
  @IsNotEmpty({ message: 'El ID de la oportunidad es requerido' })
  opportunityId: string;

  @ApiPropertyOptional({
    description: 'Carta de presentación (opcional)',
    example: 'Me interesa mucho esta oportunidad porque...',
  })
  @IsString()
  @IsOptional()
  coverLetter?: string;
}
