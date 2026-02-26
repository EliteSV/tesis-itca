import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStatus } from '@/modules/students/schemas/student.schema';

export class StudentResponseDto {
  @ApiProperty({
    description: 'ID del estudiante',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Nombre del estudiante',
    example: 'Juan',
  })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del estudiante',
    example: 'Pérez',
  })
  lastName: string;

  @ApiProperty({
    description: 'Correo electrónico del estudiante',
    example: 'juan.perez@itca.edu.sv',
  })
  email: string;

  @ApiProperty({
    description: 'Número de identificación',
    example: '20240001',
  })
  identificationNumber: string;

  @ApiPropertyOptional({
    description: 'Teléfono del estudiante',
    example: '2222-0000',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Dirección del estudiante',
    example: 'San Salvador, El Salvador',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento',
    example: '2000-01-15T00:00:00.000Z',
  })
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    description: 'Género del estudiante',
    example: 'Masculino',
  })
  gender?: string;

  @ApiProperty({
    description: 'ID de la carrera',
    example: '507f1f77bcf86cd799439011',
  })
  careerId: string;

  @ApiProperty({
    description: 'Estado del estudiante',
    enum: StudentStatus,
    example: StudentStatus.PERFIL_INCOMPLETO,
  })
  status: StudentStatus;

  @ApiProperty({
    description: 'ID del usuario asociado',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: 'Estado activo/inactivo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Experiencia laboral',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        company: { type: 'string' },
        position: { type: 'string' },
        description: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        isCurrent: { type: 'boolean' },
      },
    },
  })
  workExperience?: Array<{
    company: string;
    position: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    isCurrent?: boolean;
  }>;

  @ApiPropertyOptional({
    description: 'Formación académica',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        institution: { type: 'string' },
        degree: { type: 'string' },
        field: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        isCurrent: { type: 'boolean' },
        description: { type: 'string' },
      },
    },
  })
  education?: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate: Date;
    endDate?: Date;
    isCurrent?: boolean;
    description?: string;
  }>;

  @ApiPropertyOptional({
    description: 'Habilidades',
    type: 'array',
    items: { type: 'string' },
    example: ['JavaScript', 'React', 'Node.js'],
  })
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Perfil profesional',
    type: 'object',
    properties: {
      summary: { type: 'string' },
      languages: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            level: { type: 'string' },
          },
        },
      },
      certifications: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            issuer: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            expiryDate: { type: 'string', format: 'date-time' },
          },
        },
      },
      projects: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            technologies: { type: 'array', items: { type: 'string' } },
            url: { type: 'string' },
          },
        },
      },
    },
  })
  professionalProfile?: {
    summary?: string;
    languages?: Array<{
      name: string;
      level: string;
    }>;
    certifications?: Array<{
      name: string;
      issuer: string;
      date: Date;
      expiryDate?: Date;
    }>;
    projects?: Array<{
      name: string;
      description?: string;
      technologies?: string[];
      url?: string;
    }>;
  };
}

export class CreateStudentResponseDto extends StudentResponseDto {
  @ApiProperty({
    description: 'Contraseña generada para el usuario del estudiante',
    example: 'aB3$kL9mN2pQ',
  })
  generatedPassword: string;
}

