import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/schemas/user.schema';
import { PracticeProfessionalService } from './practice-professional.service';
import { PracticeProfessionalResponseDto } from './dto/practice-professional-response.dto';

@ApiTags('Práctica Profesional - Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COORDINADOR)
@Controller('practice-professional/admin')
export class PracticeProfessionalAdminController {
  constructor(
    private readonly practiceProfessionalService: PracticeProfessionalService,
  ) {}

  @Get('students/:studentId')
  @ApiOperation({
    summary: 'Obtener información de práctica profesional de un estudiante',
    description:
      'Retorna la información de práctica profesional de un estudiante específico. Solo para administradores.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'ID del estudiante (userId)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Información de práctica profesional obtenida exitosamente',
    type: PracticeProfessionalResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'El estudiante no tiene una práctica profesional activa',
  })
  async getStudentPracticeProfessional(
    @Param('studentId') studentId: string,
  ): Promise<PracticeProfessionalResponseDto> {
    return this.practiceProfessionalService.getPracticeProfessional(studentId);
  }
}
