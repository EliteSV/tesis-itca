import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class PracticeEvaluationDto {
  @ApiProperty({
    description: 'Calidad y Organización del Trabajo (1-5). Mida la eficiencia y precisión en el desarrollo de sus labores. El Alumno realiza su trabajo con precisión, planificación y siempre lo revisa.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  qualityAndOrganization: number;

  @ApiProperty({
    description: 'Conocimiento y Aplicación (1-5). Mida los conocimientos adquiridos y su consecuente aplicación al trabajo que desarrolla. El alumno domina ampliamente y aplica en forma correcta los conocimientos exigibles a su especialidad y nivel.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  knowledgeAndApplication: number;

  @ApiProperty({
    description: 'Capacidad de Aprendizaje (1-5). Califique la rapidez y efectividad con que retiene conocimientos. El alumno aprende con gran facilidad y rapidez.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  learningCapacity: number;

  @ApiProperty({
    description: 'Asistencia y Puntualidad (1-5). El Alumno asiste todos los días a su práctica puntualmente.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  attendanceAndPunctuality: number;

  @ApiProperty({
    description: 'Iniciativa y Criterio (1-5). Mida la capacidad para actuar acertadamente en forma autónoma sin instrucciones concretas. El alumno decide y actúa correctamente, investiga para realizar un trabajo óptimo.',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  initiativeAndJudgment: number;
}
