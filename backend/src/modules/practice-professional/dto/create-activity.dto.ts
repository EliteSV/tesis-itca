import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({
    description: 'Descripción de la actividad realizada',
    example: 'Desarrollo de funcionalidad de autenticación usando JWT',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @ApiProperty({
    description: 'Fecha en que se realizó la actividad',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha es requerida' })
  activityDate: string;

  @ApiProperty({
    description: 'Número de horas dedicadas a la actividad',
    example: 4,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Las horas deben ser un número' })
  @Min(0, { message: 'Las horas deben ser mayor o igual a 0' })
  @IsNotEmpty({ message: 'Las horas son requeridas' })
  hours: number;

  @ApiProperty({
    description: 'Maquinaria o herramienta utilizada',
    example: 'Visual Studio Code, Node.js, MongoDB',
  })
  @IsString()
  @IsNotEmpty({ message: 'La maquinaria o herramienta es requerida' })
  equipmentOrTool: string;
}
