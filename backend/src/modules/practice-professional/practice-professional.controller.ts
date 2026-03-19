import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/schemas/user.schema';
import { PracticeProfessionalService } from './practice-professional.service';
import { HolidaysService } from './holidays.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { PracticeProfessionalResponseDto } from './dto/practice-professional-response.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { ActivitiesResponseDto } from './dto/activities-response.dto';
import { PracticeHistoryResponseDto } from './dto/practice-history-response.dto';

@ApiTags('Práctica Profesional')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ESTUDIANTE)
@Controller('practice-professional')
export class PracticeProfessionalController {
  constructor(
    private readonly practiceProfessionalService: PracticeProfessionalService,
    private readonly holidaysService: HolidaysService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener información de la práctica profesional del estudiante',
    description:
      'Retorna la aplicación aceptada, la oportunidad asociada y todas las actividades realizadas',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de la práctica profesional obtenida exitosamente',
    type: PracticeProfessionalResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró una práctica profesional activa',
  })
  async getPracticeProfessional(
    @Request() req: { user: { id: string } },
  ): Promise<PracticeProfessionalResponseDto> {
    return this.practiceProfessionalService.getPracticeProfessional(
      req.user.id,
    );
  }

  @Get('activities')
  @ApiOperation({
    summary: 'Obtener actividades de la práctica profesional',
    description:
      'Retorna las actividades realizadas por el estudiante con paginación',
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
    description: 'No se encontró una práctica profesional activa',
  })
  async getActivities(
    @Request() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ActivitiesResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.practiceProfessionalService.getActivities(
      req.user.id,
      pageNum,
      limitNum,
    );
  }

  @Post('activities')
  @ApiOperation({
    summary: 'Crear una nueva actividad',
    description:
      'Crea una nueva actividad para la práctica profesional. El estado inicial será "pendiente de aprobación"',
  })
  @ApiResponse({
    status: 201,
    description: 'Actividad creada exitosamente',
    type: ActivityResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o fecha futura',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró una práctica profesional activa',
  })
  async createActivity(
    @Request() req: { user: { id: string } },
    @Body() createActivityDto: CreateActivityDto,
  ): Promise<ActivityResponseDto> {
    return this.practiceProfessionalService.createActivity(
      req.user.id,
      createActivityDto,
    );
  }

  @Get('history')
  @ApiOperation({
    summary: 'Obtener historial de prácticas profesionales del estudiante',
    description:
      'Retorna todas las prácticas profesionales (aplicaciones aceptadas) del estudiante con información resumida',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial obtenido exitosamente',
    type: PracticeHistoryResponseDto,
  })
  async getPracticeHistory(
    @Request() req: { user: { id: string } },
  ): Promise<PracticeHistoryResponseDto> {
    return this.practiceProfessionalService.getPracticeHistory(req.user.id);
  }

  @Get('history/:applicationId')
  @ApiOperation({
    summary: 'Obtener detalle de una práctica profesional específica',
    description:
      'Retorna el detalle completo de una práctica profesional del historial',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle de práctica profesional obtenido exitosamente',
    type: PracticeProfessionalResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Práctica profesional no encontrada',
  })
  async getPracticeProfessionalByApplicationId(
    @Request() req: { user: { id: string } },
    @Param('applicationId') applicationId: string,
  ): Promise<PracticeProfessionalResponseDto> {
    return this.practiceProfessionalService.getPracticeProfessionalByApplicationId(
      applicationId,
      req.user.id,
    );
  }

  @Get('holidays')
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiOperation({
    summary: 'Obtener días festivos de El Salvador',
    description:
      'Retorna la lista de días festivos oficiales de El Salvador para el año especificado o el año actual',
  })
  @ApiResponse({
    status: 200,
    description: 'Días festivos obtenidos exitosamente',
  })
  async getHolidays(@Query('year') year?: string): Promise<string[]> {
    const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.holidaysService.getHolidaysForYear(yearNum);
  }
}
