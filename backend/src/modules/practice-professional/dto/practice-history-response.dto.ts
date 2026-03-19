import { ApiProperty } from '@nestjs/swagger';
import { PracticeHistoryItemDto } from './practice-history-item.dto';

export class PracticeHistoryResponseDto {
  @ApiProperty({
    description: 'Lista de prácticas profesionales del estudiante',
    type: [PracticeHistoryItemDto],
  })
  data: PracticeHistoryItemDto[];

  @ApiProperty({
    description: 'Total de prácticas',
    example: 3,
  })
  total: number;
}
