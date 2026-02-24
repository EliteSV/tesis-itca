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
import { UsersService } from '@/modules/users/users.service';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import {
  UserResponseDto,
  CreateUserResponseDto,
} from '@/modules/users/dto/user-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/schemas/user.schema';

@ApiTags('Usuarios Administradores')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo usuario administrador' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: CreateUserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Conflicto: email ya existe' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener todos los usuarios administradores' })
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
    description: 'Búsqueda por nombre o email',
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
      'Campo para ordenar (name, email, isActive, createdAt, updatedAt)',
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
    description: 'Lista de usuarios obtenida exitosamente',
    type: [UserResponseDto],
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
    return this.usersService.findAll(
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener un usuario administrador por ID' })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un usuario administrador' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto: email ya existe' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un usuario administrador' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar/desactivar un usuario administrador' })
  @ApiResponse({
    status: 200,
    description: 'Estado del usuario actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }

  @Post(':id/generate-temporary-password')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generar contraseña temporal para un usuario' })
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
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  generateTemporaryPassword(@Param('id') id: string) {
    return this.usersService.generateTemporaryPassword(id);
  }
}
