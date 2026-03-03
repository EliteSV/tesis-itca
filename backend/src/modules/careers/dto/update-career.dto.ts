import { PartialType } from '@nestjs/swagger';
import { CreateCareerDto } from '@/modules/careers/dto/create-career.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCareerDto extends PartialType(CreateCareerDto) {
  @ApiPropertyOptional({
    description: 'Estado activo/inactivo de la carrera',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
