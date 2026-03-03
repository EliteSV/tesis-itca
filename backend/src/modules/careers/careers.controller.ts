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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CareersService } from '@/modules/careers/careers.service';
import { CreateCareerDto } from '@/modules/careers/dto/create-career.dto';
import { UpdateCareerDto } from '@/modules/careers/dto/update-career.dto';
import { CareerResponseDto } from '@/modules/careers/dto/career-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { UserRole } from '@/modules/auth/schemas/user.schema';

@ApiTags('Carreras')
@Controller('careers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva carrera' })
  @ApiResponse({
    status: 201,
    description: 'Carrera creada exitosamente',
    type: CareerResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Conflicto: código ya existe' })
  @ApiResponse({
    status: 404,
    description: 'Categoría de carrera no encontrada',
  })
  create(@Body() createCareerDto: CreateCareerDto) {
    return this.careersService.create(createCareerDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Obtener todas las carreras (público)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de carreras obtenida exitosamente',
    type: [CareerResponseDto],
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
    description: 'Búsqueda por nombre o código',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filtrar por categoría',
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
      'Campo para ordenar (name, code, duration, isActive, createdAt, updatedAt)',
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
    description:       'Fecha de fin para filtrar por fecha de creación (YYYY-MM-DD)',
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const isActiveFilter =
      isActive !== undefined ? isActive === 'true' : undefined;
    return this.careersService.findAll(
      pageNum,
      limitNum,
      search,
      categoryId,
      isActiveFilter,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY, UserRole.ESTUDIANTE)
  @ApiOperation({ summary: 'Obtener una carrera por ID' })
  @ApiResponse({
    status: 200,
    description: 'Carrera obtenida exitosamente',
    type: CareerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  findOne(@Param('id') id: string) {
    return this.careersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una carrera' })
  @ApiResponse({
    status: 200,
    description: 'Carrera actualizada exitosamente',
    type: CareerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  @ApiResponse({ status: 409, description: 'Conflicto: código ya existe' })
  update(@Param('id') id: string, @Body() updateCareerDto: UpdateCareerDto) {
    return this.careersService.update(id, updateCareerDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una carrera' })
  @ApiResponse({
    status: 200,
    description: 'Carrera eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  remove(@Param('id') id: string) {
    return this.careersService.remove(id);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar/desactivar una carrera' })
  @ApiResponse({
    status: 200,
    description: 'Estado de la carrera actualizado exitosamente',
    type: CareerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Carrera no encontrada' })
  toggleStatus(@Param('id') id: string) {
    return this.careersService.toggleStatus(id);
  }
}
