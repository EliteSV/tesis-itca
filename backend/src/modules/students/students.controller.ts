import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { MulterFile } from '@/common/types/multer.types';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { StudentsService } from '@/modules/students/students.service';
import { CreateStudentDto } from '@/modules/students/dto/create-student.dto';
import { UpdateStudentDto } from '@/modules/students/dto/update-student.dto';
import {
  StudentResponseDto,
  CreateStudentResponseDto,
} from '@/modules/students/dto/student-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { StudentOwnershipGuard } from '@/common/guards/student-ownership.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/schemas/user.schema';

@ApiTags('Estudiantes')
@ApiBearerAuth()
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo estudiante' })
  @ApiResponse({
    status: 201,
    description: 'Estudiante creado exitosamente',
    type: CreateStudentResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: email o número de identificación ya existe',
  })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get('my-profile')
  @Roles(UserRole.ESTUDIANTE)
  @UseGuards(StudentOwnershipGuard)
  @ApiOperation({
    summary: 'Obtener información de mi perfil de estudiante',
    description:
      'Retorna la información del estudiante asociado al usuario ESTUDIANTE autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del estudiante obtenida exitosamente',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description:
      'Acceso denegado - Solo estudiantes pueden acceder a su propio perfil',
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante no encontrado o usuario sin estudiante asociado',
  })
  getMyProfile(@Request() req: { user: { id: string } }) {
    return this.studentsService.findByUserId(req.user.id);
  }

  @Patch('my-profile')
  @Roles(UserRole.ESTUDIANTE)
  @UseGuards(StudentOwnershipGuard)
  @ApiOperation({
    summary: 'Actualizar información de mi perfil de estudiante',
    description:
      'Permite al estudiante autenticado actualizar su propia información',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del estudiante actualizada exitosamente',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description:
      'Acceso denegado - Solo estudiantes pueden actualizar su propio perfil',
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: email o número de identificación ya existe',
  })
  updateMyProfile(
    @Request() req: { user: { id: string } },
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.updateMyProfile(req.user.id, updateStudentDto);
  }

  @Post('my-profile/social-service-document')
  @Roles(UserRole.ESTUDIANTE)
  @UseGuards(StudentOwnershipGuard)
  @UseInterceptors(
    FileInterceptor('document', {
      storage: memoryStorage(),
      fileFilter: (
        _req: unknown,
        file: { mimetype?: string },
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se permiten archivos PDF'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @ApiOperation({
    summary: 'Subir y validar solvencia de horas sociales',
    description:
      'Permite al estudiante subir su solvencia de horas sociales para validación automática. El documento siempre se guarda, incluso si no pasa la validación. La respuesta incluye el estado de validación completo.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Documento subido y guardado exitosamente. Incluye el estado de validación completo.',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'El documento fue guardado pero no pasó la validación. El estado de validación se incluye en la respuesta.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo estudiantes pueden subir documentos',
  })
  async uploadSocialServiceDocument(
    @Request() req: { user: { id: string } },
    @UploadedFile() file?: MulterFile,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    return this.studentsService.uploadSocialServiceDocument(req.user.id, file);
  }

  @Post('my-profile/passed-subjects-document')
  @Roles(UserRole.ESTUDIANTE)
  @UseGuards(StudentOwnershipGuard)
  @UseInterceptors(
    FileInterceptor('document', {
      storage: memoryStorage(),
      fileFilter: (
        _req: unknown,
        file: { mimetype?: string },
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se permiten archivos PDF'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @ApiOperation({
    summary: 'Subir y validar documento de materias ganadas',
    description:
      'Permite al estudiante subir su documento de materias ganadas para validación automática. El documento siempre se guarda, incluso si no pasa la validación. La respuesta incluye el estado de validación completo y la lista de materias ganadas extraídas.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Documento subido y guardado exitosamente. Incluye el estado de validación completo y las materias ganadas.',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'El documento fue guardado pero no pasó la validación. El estado de validación se incluye en la respuesta.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo estudiantes pueden subir documentos',
  })
  async uploadPassedSubjectsDocument(
    @Request() req: { user: { id: string } },
    @UploadedFile() file?: MulterFile,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    return this.studentsService.uploadPassedSubjectsDocument(req.user.id, file);
  }

  @Delete('my-profile/social-service-document')
  @Roles(UserRole.ESTUDIANTE)
  @UseGuards(StudentOwnershipGuard)
  @ApiOperation({
    summary: 'Eliminar documento de solvencia de horas sociales',
    description:
      'Elimina el documento de solvencia de horas sociales y limpia todas las validaciones asociadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Documento eliminado exitosamente',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description:
      'Acceso denegado - Solo estudiantes pueden eliminar sus propios documentos',
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  deleteSocialServiceDocument(@Request() req: { user: { id: string } }) {
    return this.studentsService.deleteSocialServiceDocument(req.user.id);
  }

  @Delete('my-profile/passed-subjects-document')
  @Roles(UserRole.ESTUDIANTE)
  @UseGuards(StudentOwnershipGuard)
  @ApiOperation({
    summary: 'Eliminar documento de materias ganadas',
    description:
      'Elimina el documento de materias ganadas y limpia todas las validaciones asociadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Documento eliminado exitosamente',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description:
      'Acceso denegado - Solo estudiantes pueden eliminar sus propios documentos',
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  deletePassedSubjectsDocument(@Request() req: { user: { id: string } }) {
    return this.studentsService.deletePassedSubjectsDocument(req.user.id);
  }

  @Post('my-profile/enrollment-proof-document')
  @Roles(UserRole.ESTUDIANTE)
  @UseGuards(StudentOwnershipGuard)
  @UseInterceptors(
    FileInterceptor('document', {
      storage: memoryStorage(),
      fileFilter: (
        _req: unknown,
        file: { mimetype?: string },
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se permiten archivos PDF'), false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiOperation({
    summary: 'Subir y validar comprobante de inscripción',
    description:
      'Permite al estudiante subir su comprobante de inscripción de asignaturas para validación. Se verifica nombre, carnet y formato.',
  })
  @ApiResponse({
    status: 200,
    description: 'Documento subido y validado exitosamente',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El documento no pasó la validación',
  })
  async uploadEnrollmentProofDocument(
    @Request() req: { user: { id: string } },
    @UploadedFile() file?: MulterFile,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.studentsService.uploadEnrollmentProofDocument(
      req.user.id,
      file,
    );
  }

  @Delete('my-profile/enrollment-proof-document')
  @Roles(UserRole.ESTUDIANTE)
  @UseGuards(StudentOwnershipGuard)
  @ApiOperation({
    summary: 'Eliminar comprobante de inscripción',
    description: 'Elimina el comprobante de inscripción y sus validaciones.',
  })
  @ApiResponse({
    status: 200,
    description: 'Documento eliminado exitosamente',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 403,
    description:
      'Acceso denegado - Solo estudiantes pueden eliminar sus propios documentos',
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  deleteEnrollmentProofDocument(@Request() req: { user: { id: string } }) {
    return this.studentsService.deleteEnrollmentProofDocument(req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.COMPANY)
  @ApiOperation({ summary: 'Obtener todos los estudiantes' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de elementos por página',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description:
      'Búsqueda por nombre, apellido, email o número de identificación',
  })
  @ApiQuery({
    name: 'careerId',
    required: false,
    type: String,
    description: 'Filtrar por carrera',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo/inactivo',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description:
      'Campo para ordenar (firstName, lastName, email, createdAt, updatedAt)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Orden de clasificación (asc, desc)',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description:
      'Fecha de inicio para filtrar por fecha de creación (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'Fecha de fin para filtrar por fecha de creación (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes obtenida exitosamente',
    type: [StudentResponseDto],
  })
  findAll(
    @Request()
    req: {
      user: {
        id: string;
        role: UserRole;
        careerId?: string;
        companyId?: string;
      };
    },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('careerId') careerId?: string,
    @Query('status') status?: string,
    @Query('isActive') isActive?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('practiceStatus') practiceStatus?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    if (req.user.role === UserRole.COMPANY) {
      return this.studentsService.findAllForCompany(
        req.user.companyId!,
        pageNum,
        limitNum,
        search,
      );
    }

    const isActiveFilter =
      isActive !== undefined ? isActive === 'true' : undefined;

    // Si es coordinador, usar su careerId asignado (ignorar el parámetro careerId del query)
    const finalCareerId =
      req.user.role === UserRole.COORDINADOR ? req.user.careerId : careerId;

    return this.studentsService.findAll(
      pageNum,
      limitNum,
      search,
      finalCareerId,
      status,
      isActiveFilter,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
      practiceStatus,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Obtener un estudiante por ID',
    description:
      'Permite a administradores, empresas y coordinadores obtener información de un estudiante. Las empresas pueden ver estudiantes que han aplicado a sus oportunidades. Los coordinadores solo pueden ver estudiantes de su carrera.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estudiante obtenido exitosamente',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - No tienes permiso para ver este estudiante',
  })
  findOne(
    @Request() req: { user: { id: string; role: string; careerId?: string } },
    @Param('id') id: string,
  ) {
    return this.studentsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un estudiante' })
  @ApiResponse({
    status: 200,
    description: 'Estudiante actualizado exitosamente',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: email o número de identificación ya existe',
  })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un estudiante' })
  @ApiResponse({
    status: 200,
    description: 'Estudiante eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar/desactivar un estudiante' })
  @ApiResponse({
    status: 200,
    description: 'Estado del estudiante actualizado exitosamente',
    type: StudentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  toggleStatus(@Param('id') id: string) {
    return this.studentsService.toggleStatus(id);
  }

  @Post(':id/generate-temporary-password')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generar contraseña temporal para un estudiante' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña temporal generada exitosamente',
    schema: {
      type: 'object',
      properties: {
        generatedPassword: {
          type: 'string',
          example: 'aB3$kL9mN2pQ',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  generateTemporaryPassword(@Param('id') id: string) {
    return this.studentsService.generateTemporaryPassword(id);
  }
}
