import { ApiProperty } from '@nestjs/swagger';
import { StudentResponseDto } from '@/modules/students/dto/student-response.dto';
import { Opportunity } from '@/modules/opportunities/schemas/opportunity.schema';
import { Application } from '@/modules/opportunities/schemas/application.schema';

export class StudentDetailResponseDto {
  @ApiProperty({ description: 'Información del estudiante' })
  student: StudentResponseDto;

  @ApiProperty({ description: 'Aplicación aceptada del estudiante' })
  application: Application;

  @ApiProperty({ description: 'Oportunidad asociada a la aplicación' })
  opportunity: Opportunity;

  @ApiProperty({
    description: 'Total de horas aprobadas',
    example: 100,
  })
  approvedHours: number;
}

