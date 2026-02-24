import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Estado activo/inactivo del usuario',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
