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
  BadRequestException,
} from '@nestjs/common';
import { OpportunitiesService } from '@/modules/opportunities/opportunities.service';
import { CreateOpportunityDto } from '@/modules/opportunities/dto/create-opportunity.dto';
import { UpdateOpportunityDto } from '@/modules/opportunities/dto/update-opportunity.dto';
import { UpdateApplicationStatusDto } from '@/modules/opportunities/dto/update-application-status.dto';
import { CreateApplicationDto } from '@/modules/opportunities/dto/create-application.dto';
import { ApplicationStatus } from '@/modules/opportunities/schemas/application.schema';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/schemas/user.schema';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { OpportunityResponseDto } from '@/modules/opportunities/dto/opportunity-response.dto';
import { ApplicationResponseDto } from '@/modules/opportunities/dto/application-response.dto';

@ApiTags('Oportunidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Crear una nueva oportunidad laboral',
    description:
      'Permite a un usuario COMPANY crear una nueva oportunidad de prácticas profesionales',
  })
  @ApiResponse({
    status: 201,
    description: 'Oportunidad creada exitosamente',
    type: OpportunityResponseDto,
  })
  create(
    @Request() req: { user: { id: string } },
    @Body() createOpportunityDto: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.create(createOpportunityDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Obtener todas las oportunidades de mi empresa',
    description:
      'Retorna todas las oportunidades creadas por la empresa del usuario autenticado',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
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
    description: 'Búsqueda por título o descripción',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filtrar por estado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de oportunidades obtenida exitosamente',
  })
  findAll(
    @Request() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.opportunitiesService.findAll(
      req.user.id,
      pageNum,
      limitNum,
      search,
      status,
    );
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Obtener todas las oportunidades (Admin/Coordinador)',
    description:
      'Retorna todas las oportunidades. Para administradores muestra todas, para coordinadores solo las de su carrera.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
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
    description: 'Búsqueda por título o descripción',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filtrar por estado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de oportunidades obtenida exitosamente',
  })
  findAllForAdmin(
    @Request() req: { user: { id: string; role: string; careerId?: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.opportunitiesService.findAllForAdmin(
      pageNum,
      limitNum,
      search,
      status, 
    );
  }

  @Get('share/:shareToken')
  @ApiOperation({
    summary: 'Obtener oportunidad por token de compartir',
    description:
      'Permite obtener información de una oportunidad usando su token de compartir (público)',
  })
  @ApiResponse({
    status: 200,
    description: 'Oportunidad obtenida exitosamente',
    type: OpportunityResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Oportunidad no encontrada o no disponible',
  })
  findByShareToken(@Param('shareToken') shareToken: string) {
    return this.opportunitiesService.findByShareToken(shareToken);
  }

  @Get('available')
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener oportunidades disponibles',
    description:
      'Retorna todas las oportunidades laborales activas disponibles. Opcionalmente se puede filtrar por carrera.',
  })
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
    description: 'Búsqueda por título o descripción',
  })
  @ApiQuery({
    name: 'careerId',
    required: false,
    type: String,
    description: 'ID de la carrera para filtrar oportunidades',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de oportunidades obtenida exitosamente',
  })
  getAvailableOpportunities(
    @Request() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('careerId') careerId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.opportunitiesService.getAvailableOpportunitiesForStudent(
      req.user.id,
      pageNum,
      limitNum,
      search,
      careerId,
    );
  }

  @Get(':id')
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Obtener una oportunidad por ID',
    description:
      'Retorna los detalles de una oportunidad específica de la empresa del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Oportunidad obtenida exitosamente',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  findOne(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.opportunitiesService.findOne(id, req.user.id);
  }

  @Get('admin/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtener una oportunidad por ID (Admin)',
    description:
      'Retorna los detalles de una oportunidad específica. Solo disponible para administradores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Oportunidad obtenida exitosamente',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  findOneForAdmin(@Param('id') id: string) {
    return this.opportunitiesService.findOneForAdmin(id);
  }

  @Get('applications/company')
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary:
      'Obtener todas las aplicaciones de las oportunidades de la empresa',
    description:
      'Retorna todas las aplicaciones recibidas para todas las oportunidades de la empresa en sesión, con paginación y filtro por oportunidad y nombre de estudiante',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicaciones obtenidas exitosamente',
  })
  getCompanyApplications(
    @Request() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('opportunityId') opportunityId?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    return this.opportunitiesService.getCompanyApplications(
      req.user.id,
      pageNumber,
      limitNumber,
      opportunityId,
      search,
    );
  }

  @Get('applications/coordinator')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({
    summary:
      'Obtener todas las aplicaciones de los estudiantes de la carrera del coordinador',
    description:
      'Retorna todas las aplicaciones de los estudiantes de la carrera asignada al coordinador, incluyendo solicitudes a oportunidades de otras carreras. Incluye paginación y filtro por oportunidad y nombre de estudiante',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicaciones obtenidas exitosamente',
  })
  getCoordinatorApplications(
    @Request() req: { user: { id: string; role: string; careerId?: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('opportunityId') opportunityId?: string,
    @Query('search') search?: string,
  ) {
    if (!req.user.careerId) {
      throw new BadRequestException(
        'El coordinador no tiene una carrera asignada',
      );
    }
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    return this.opportunitiesService.getCoordinatorApplications(
      req.user.careerId,
      pageNumber,
      limitNumber,
      opportunityId,
      search,
    );
  }

  @Patch('applications/:applicationId/accept')
  @Roles(UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Aceptar una solicitud (Coordinador)',
    description:
      'Permite al coordinador aceptar una solicitud que esté en estado aprobada, cambiándola a aceptada. Solo se pueden aceptar hasta el número de vacantes disponibles. Un estudiante solo puede tener una solicitud aceptada a la vez.',
  })
  @ApiParam({
    name: 'applicationId',
    description: 'ID de la aplicación',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud aceptada exitosamente',
    type: ApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Aplicación no encontrada' })
  @ApiResponse({
    status: 400,
    description:
      'Ya se han aceptado todas las vacantes, la solicitud no está en estado aprobada, o el estudiante ya tiene otra solicitud aceptada',
  })
  acceptApplicationByCoordinator(
    @Request() req: { user: { id: string; role: string; careerId?: string } },
    @Param('applicationId') applicationId: string,
  ) {
    if (!req.user.careerId) {
      throw new BadRequestException(
        'El coordinador no tiene una carrera asignada',
      );
    }
    return this.opportunitiesService.acceptApplicationByCoordinator(
      applicationId,
      req.user.id,
      req.user.careerId,
    );
  }

  @Get(':id/applications')
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Obtener aplicaciones de una oportunidad',
    description:
      'Retorna todas las aplicaciones recibidas para una oportunidad específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicaciones obtenidas exitosamente',
    type: [ApplicationResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  getApplications(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.opportunitiesService.getApplicationsByOpportunity(
      id,
      req.user.id,
    );
  }

  @Get('admin/:id/applications')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtener aplicaciones de una oportunidad (Admin)',
    description:
      'Retorna todas las aplicaciones recibidas para una oportunidad específica. Solo disponible para administradores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicaciones obtenidas exitosamente',
    type: [ApplicationResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  getApplicationsForAdmin(@Param('id') id: string) {
    return this.opportunitiesService.getApplicationsByOpportunityForAdmin(id);
  }

  @Patch(':id')
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Actualizar una oportunidad',
    description:
      'Permite actualizar los datos de una oportunidad de la empresa del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Oportunidad actualizada exitosamente',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.update(
      id,
      updateOpportunityDto,
      req.user.id,
    );
  }

  @Patch('applications/:applicationId/status')
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Actualizar estado de una aplicación',
    description:
      'Permite aceptar o rechazar una aplicación. Solo se pueden aceptar hasta el número de vacantes disponibles. Un estudiante solo puede tener una solicitud aprobada a la vez.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de aplicación actualizado exitosamente',
    type: ApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Aplicación no encontrada' })
  @ApiResponse({
    status: 400,
    description:
      'Ya se han aceptado todas las vacantes, falta razón de rechazo, o el estudiante ya tiene otra solicitud aprobada',
  })
  updateApplicationStatus(
    @Request() req: { user: { id: string } },
    @Param('applicationId') applicationId: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.opportunitiesService.updateApplicationStatus(
      applicationId,
      updateStatusDto,
      req.user.id,
    );
  }

  @Post('applications/:applicationId/evaluate')
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Evaluar match del perfil del estudiante con la oportunidad',
    description:
      'Evalúa qué tan bien coincide el perfil profesional del estudiante con los requisitos de la oportunidad usando OpenAI. Retorna una calificación de 1 a 5 (puede incluir .5).',
  })
  @ApiParam({
    name: 'applicationId',
    description: 'ID de la aplicación',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluación completada exitosamente',
    type: ApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Aplicación no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'La aplicación ya tiene una calificación o no se pudo evaluar',
  })
  async evaluateApplication(
    @Request() req: { user: { id: string } },
    @Param('applicationId') applicationId: string,
  ) {
    return this.opportunitiesService.evaluateApplicationMatch(
      applicationId,
      req.user.id,
    );
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Activar/desactivar una oportunidad',
    description:
      'Permite activar o desactivar una oportunidad. Las oportunidades desactivadas no se mostrarán públicamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la oportunidad actualizado exitosamente',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  toggleActiveStatus(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.opportunitiesService.toggleActiveStatus(id, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Eliminar una oportunidad',
    description:
      'Elimina una oportunidad. Solo se puede eliminar si no tiene aplicaciones asociadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Oportunidad eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar: tiene aplicaciones asociadas',
  })
  remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.opportunitiesService.remove(id, req.user.id);
  }

  @Post('applications')
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Aplicar a una oportunidad laboral',
    description: 'Permite a un estudiante aplicar a una oportunidad laboral',
  })
  @ApiResponse({
    status: 201,
    description: 'Aplicación creada exitosamente',
    type: ApplicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  @ApiResponse({
    status: 400,
    description:
      'La oportunidad no está disponible, ya aplicaste, no hay vacantes, o ya tienes una solicitud aprobada',
  })
  createApplication(
    @Request() req: { user: { id: string } },
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return this.opportunitiesService.createApplication(
      createApplicationDto,
      req.user.id,
    );
  }

  @Post('saved/:opportunityId')
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Guardar una oportunidad',
    description:
      'Permite a un estudiante guardar una oportunidad para verla después',
  })
  @ApiResponse({
    status: 201,
    description: 'Oportunidad guardada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Ya has guardado esta oportunidad',
  })
  saveOpportunity(
    @Request() req: { user: { id: string } },
    @Param('opportunityId') opportunityId: string,
  ) {
    return this.opportunitiesService.saveOpportunity(
      opportunityId,
      req.user.id,
    );
  }

  @Delete('saved/:opportunityId')
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Eliminar oportunidad guardada',
    description: 'Elimina una oportunidad de las guardadas por el estudiante',
  })
  @ApiResponse({
    status: 200,
    description: 'Oportunidad eliminada de guardadas',
  })
  @ApiResponse({
    status: 404,
    description: 'Oportunidad guardada no encontrada',
  })
  unsaveOpportunity(
    @Request() req: { user: { id: string } },
    @Param('opportunityId') opportunityId: string,
  ) {
    return this.opportunitiesService.unsaveOpportunity(
      opportunityId,
      req.user.id,
    );
  }

  @Get('saved')
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener oportunidades guardadas',
    description: 'Obtiene todas las oportunidades guardadas por el estudiante',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Lista de oportunidades guardadas',
  })
  getSavedOpportunities(
    @Request() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.opportunitiesService.getSavedOpportunities(
      req.user.id,
      pageNum,
      limitNum,
      search,
    );
  }

  @Get('saved/ids')
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener IDs de oportunidades guardadas',
    description:
      'Obtiene los IDs de todas las oportunidades guardadas por el estudiante',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de IDs de oportunidades guardadas',
  })
  getSavedOpportunityIds(@Request() req: { user: { id: string } }) {
    return this.opportunitiesService.getSavedOpportunityIds(req.user.id);
  }

  @Get('applications/my-applications')
  @Roles(UserRole.ESTUDIANTE)
  @ApiOperation({
    summary: 'Obtener mis aplicaciones',
    description:
      'Obtiene todas las aplicaciones realizadas por el estudiante autenticado',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pendiente', 'aceptada', 'rechazada'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de aplicaciones del estudiante',
  })
  getMyApplications(
    @Request() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.opportunitiesService.getStudentApplications(
      req.user.id,
      pageNum,
      limitNum,
      search,
      status as ApplicationStatus | undefined,
    );
  }
}
