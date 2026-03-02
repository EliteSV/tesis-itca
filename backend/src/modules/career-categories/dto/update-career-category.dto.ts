import { PartialType } from '@nestjs/swagger';
import { CreateCareerCategoryDto } from '@/modules/career-categories/dto/create-career-category.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCareerCategoryDto extends PartialType(
  CreateCareerCategoryDto,
) {
  @ApiPropertyOptional({
    description: 'Estado activo/inactivo de la categoría',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
