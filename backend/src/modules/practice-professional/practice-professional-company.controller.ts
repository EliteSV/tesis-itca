import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/schemas/user.schema';
import { PracticeProfessionalService } from './practice-professional.service';
import { UpdateActivityStatusDto } from './dto/update-activity-status.dto';
import { ActivitiesResponseDto } from './dto/activities-response.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { FinishPracticeDto } from './dto/finish-practice.dto';

@ApiTags('Práctica Profesional - Empresa')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY)
@Controller('practice-professional/company')
export class PracticeProfessionalCompanyController {
  constructor(
    private readonly practiceProfessionalService: PracticeProfessionalService,
  ) {}

  @Get('students/:studentId/activities')
  @ApiOperation({
    summary: 'Obtener actividades de un estudiante',
    description:
      'Retorna las actividades realizadas por un estudiante específico con paginación. Solo para empresas que tienen acceso a la oportunidad del estudiante.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID del estudiante',
    type: String,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Actividades obtenidas exitosamente',
    type: ActivitiesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'El estudiante no tiene una práctica profesional activa',
  })
  @ApiResponse({
    status: 400,
    description:
      'No tienes permiso para ver las actividades de este estudiante',
  })
  async getStudentActivities(
    @Request() req: { user: { id: string } },
    @Param('studentId') studentId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ActivitiesResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.practiceProfessionalService.getStudentActivities(
      studentId,
      req.user.id,
      pageNum,
      limitNum,
    );
  }

  @Put('activities/:activityId/status')
  @ApiOperation({
    summary: 'Aprobar o rechazar una actividad',
    description:
      'Actualiza el estado de una actividad (aprobada o rechazada). Si se rechaza, se debe proporcionar una razón.',
  })
  @ApiParam({
    name: 'activityId',
    description: 'ID de la actividad',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la actividad actualizado exitosamente',
    type: ActivityResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Actividad no encontrada',
  })
  @ApiResponse({
    status: 400,
    description:
      'No tienes permiso para modificar esta actividad o falta la razón de rechazo',
  })
  async updateActivityStatus(
    @Request() req: { user: { id: string } },
    @Param('activityId') activityId: string,
    @Body() updateDto: UpdateActivityStatusDto,
  ): Promise<ActivityResponseDto> {
    return this.practiceProfessionalService.updateActivityStatus(
      activityId,
      req.user.id,
      updateDto,
    );
  }

  @Get('students/:studentId')
  @ApiOperation({
    summary: 'Obtener información completa de un estudiante',
    description:
      'Retorna la información del estudiante, su aplicación aceptada y la oportunidad asociada. Solo para empresas que tienen acceso a la oportunidad del estudiante.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID del estudiante (puede ser userId o student _id)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Información del estudiante obtenida exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'El estudiante no tiene una práctica profesional activa',
  })
  @ApiResponse({
    status: 400,
    description: 'No tienes permiso para ver la información de este estudiante',
  })
  async getStudentDetail(
    @Request() req: { user: { id: string } },
    @Param('studentId') studentId: string,
  ) {
    return this.practiceProfessionalService.getStudentDetailForCompany(
      studentId,
      req.user.id,
    );
  }

  @Put('students/:studentId/finish')
  @ApiOperation({
    summary: 'Finalizar práctica profesional de un estudiante',
    description:
      'Marca la práctica profesional como finalizada. Si las horas aprobadas son menores a las horas requeridas, se debe proporcionar un motivo de finalización anticipada. Solo puede ser ejecutado por empresas que tienen acceso a la oportunidad del estudiante.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID del estudiante (puede ser userId o student _id)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Práctica profesional finalizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Práctica profesional finalizada exitosamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'El estudiante no tiene una práctica profesional activa',
  })
  @ApiResponse({
    status: 400,
    description:
      'No tienes permiso para finalizar la práctica profesional de este estudiante, la práctica ya está finalizada, o falta el motivo de finalización anticipada',
  })
  async finishPracticeProfessional(
    @Request() req: { user: { id: string } },
    @Param('studentId') studentId: string,
    @Body() finishDto: FinishPracticeDto,
  ): Promise<{ message: string }> {
    const result =
      await this.practiceProfessionalService.finishPracticeProfessional(
        studentId,
        req.user.id,
        finishDto,
      );
    return result;
  }
}
