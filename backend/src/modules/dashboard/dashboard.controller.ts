import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/schemas/user.schema';
import { DashboardService } from '@/modules/dashboard/dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.ESTUDIANTE, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Obtener datos del dashboard',
    description: 'Retorna información del dashboard del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del dashboard obtenidos exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Rol no permitido',
  })
  async getDashboard(@Request() req: { user: { id: string; role: string; careerId?: string } }) {
    return await this.dashboardService.getStats(req.user.id, req.user.role, req.user.careerId);
  }

  @Get('reports')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtener reportes administrativos',
    description: 'Retorna datos agregados para análisis y reportes del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Reportes obtenidos exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores',
  })
  async getReports() {
    return await this.dashboardService.getAdminReports();
  }
}
