import { PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from '@/modules/students/dto/create-student.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  IsString,
  IsDateString,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StudentStatus } from '@/modules/students/schemas/student.schema';

export class WorkExperienceDto {
  @ApiPropertyOptional({
    description: 'Nombre de la empresa',
    example: 'Tech Solutions S.A.',
  })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({
    description: 'Cargo o posición',
    example: 'Desarrollador Junior',
  })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({
    description: 'Descripción de las responsabilidades',
    example: 'Desarrollo de aplicaciones web usando React y Node.js',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio',
    example: '2023-01-15',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser válida' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de finalización',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha de finalización debe ser válida' })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Indica si es el trabajo actual',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;
}

export class EducationDto {
  @ApiPropertyOptional({
    description: 'Nombre de la institución',
    example: 'Instituto Tecnológico Centroamericano',
  })
  @IsString()
  @IsOptional()
  institution?: string;

  @ApiPropertyOptional({
    description: 'Título o grado obtenido',
    example: 'Técnico en Desarrollo de Software',
  })
  @IsString()
  @IsOptional()
  degree?: string;

  @ApiPropertyOptional({
    description: 'Campo de estudio',
    example: 'Ingeniería en Sistemas',
  })
  @IsString()
  @IsOptional()
  field?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio',
    example: '2020-01-15',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser válida' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de finalización',
    example: '2024-12-15',
  })
  @IsDateString({}, { message: 'La fecha de finalización debe ser válida' })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Indica si está en curso',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @ApiPropertyOptional({
    description: 'Descripción adicional',
    example: 'Enfoque en desarrollo web y móvil',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class LanguageDto {
  @ApiPropertyOptional({
    description: 'Nombre del idioma',
    example: 'Inglés',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Nivel de dominio',
    example: 'Avanzado',
  })
  @IsString()
  @IsOptional()
  level?: string;
}

export class CertificationDto {
  @ApiPropertyOptional({
    description: 'Nombre de la certificación',
    example: 'AWS Certified Developer',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Organización emisora',
    example: 'Amazon Web Services',
  })
  @IsString()
  @IsOptional()
  issuer?: string;

  @ApiPropertyOptional({
    description: 'Fecha de obtención',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha debe ser válida' })
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    description: 'Fecha de expiración',
    example: '2027-01-15',
  })
  @IsDateString({}, { message: 'La fecha de expiración debe ser válida' })
  @IsOptional()
  expiryDate?: string;
}

export class ProjectDto {
  @ApiPropertyOptional({
    description: 'Nombre del proyecto',
    example: 'Sistema de Gestión Escolar',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción del proyecto',
    example: 'Sistema web para gestión de estudiantes y calificaciones',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Tecnologías utilizadas',
    example: ['React', 'Node.js', 'MongoDB'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  technologies?: string[];

  @ApiPropertyOptional({
    description: 'URL del proyecto',
    example: 'https://github.com/usuario/proyecto',
  })
  @IsString()
  @IsOptional()
  url?: string;
}

export class ProfessionalProfileDto {
  @ApiPropertyOptional({
    description: 'Resumen profesional',
    example: 'Desarrollador de software con experiencia en aplicaciones web',
  })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({
    description: 'Idiomas',
    type: [LanguageDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  @IsOptional()
  languages?: LanguageDto[];

  @ApiPropertyOptional({
    description: 'Certificaciones',
    type: [CertificationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  @IsOptional()
  certifications?: CertificationDto[];

  @ApiPropertyOptional({
    description: 'Proyectos',
    type: [ProjectDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  @IsOptional()
  projects?: ProjectDto[];
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({
    description: 'Estado del estudiante',
    enum: StudentStatus,
    example: StudentStatus.ACTIVO,
  })
  @IsEnum(StudentStatus, { message: 'El estado debe ser válido' })
  @IsOptional()
  status?: StudentStatus;

  @ApiPropertyOptional({
    description: 'Estado activo/inactivo del estudiante',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Experiencia laboral',
    type: [WorkExperienceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkExperienceDto)
  @IsOptional()
  workExperience?: WorkExperienceDto[];

  @ApiPropertyOptional({
    description: 'Formación académica',
    type: [EducationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  @IsOptional()
  education?: EducationDto[];

  @ApiPropertyOptional({
    description: 'Habilidades',
    example: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Perfil profesional completo',
    type: ProfessionalProfileDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ProfessionalProfileDto)
  @IsOptional()
  professionalProfile?: ProfessionalProfileDto;
}

