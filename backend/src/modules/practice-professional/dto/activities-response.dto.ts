import { ApiProperty } from '@nestjs/swagger';
import { ActivityResponseDto } from './activity-response.dto';

export class ActivitiesResponseDto {
  @ApiProperty({
    description: 'Lista de actividades',
    type: [ActivityResponseDto],
  })
  data: ActivityResponseDto[];

  @ApiProperty({ description: 'Total de actividades' })
  total: number;

  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Límite de resultados por página' })
  limit: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages: number;
}

