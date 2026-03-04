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
import { CareerCategoriesService } from '@/modules/career-categories/career-categories.service';
import { CreateCareerCategoryDto } from '@/modules/career-categories/dto/create-career-category.dto';
import { UpdateCareerCategoryDto } from '@/modules/career-categories/dto/update-career-category.dto';
import { CareerCategoryResponseDto } from '@/modules/career-categories/dto/career-category-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/schemas/user.schema';

@ApiTags('Categorías de Carrera')
@ApiBearerAuth()
@Controller('career-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CareerCategoriesController {
  constructor(
    private readonly careerCategoriesService: CareerCategoriesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva categoría de carrera' })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
    type: CareerCategoryResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Conflicto: nombre ya existe' })
  create(@Body() createCareerCategoryDto: CreateCareerCategoryDto) {
    return this.careerCategoriesService.create(createCareerCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías de carrera' })
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
    description: 'Búsqueda por nombre',
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
    description: 'Campo para ordenar (name, isActive, createdAt, updatedAt)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Orden de clasificación (asc, desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías obtenida exitosamente',
    type: [CareerCategoryResponseDto],
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
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
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
    return this.careerCategoriesService.findAll(
      pageNum,
      limitNum,
      search,
      isActiveFilter,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiResponse({
    status: 200,
    description: 'Categoría obtenida exitosamente',
    type: CareerCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  findOne(@Param('id') id: string) {
    return this.careerCategoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una categoría' })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
    type: CareerCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({ status: 409, description: 'Conflicto: nombre ya existe' })
  update(
    @Param('id') id: string,
    @Body() updateCareerCategoryDto: UpdateCareerCategoryDto,
  ) {
    return this.careerCategoriesService.update(id, updateCareerCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una categoría' })
  @ApiResponse({
    status: 200,
    description: 'Categoría eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  remove(@Param('id') id: string) {
    return this.careerCategoriesService.remove(id);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Activar/desactivar una categoría' })
  @ApiResponse({
    status: 200,
    description: 'Estado de la categoría actualizado exitosamente',
    type: CareerCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  toggleStatus(@Param('id') id: string) {
    return this.careerCategoriesService.toggleStatus(id);
  }
}
