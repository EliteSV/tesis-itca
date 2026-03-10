import { PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from '@/modules/companies/dto/create-company.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @ApiPropertyOptional({
    description: 'Estado activo/inactivo de la empresa',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
