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
} from '@nestjs/common';
import { CompaniesService } from '@/modules/companies/companies.service';
import { CreateCompanyDto } from '@/modules/companies/dto/create-company.dto';
import { UpdateCompanyDto } from '@/modules/companies/dto/update-company.dto';
import { CreateInvitationDto } from '@/modules/companies/dto/create-invitation.dto';
import { SendInvitationEmailDto } from '@/modules/companies/dto/send-invitation-email.dto';
import { InvitationResponseDto } from '@/modules/companies/dto/invitation-response.dto';
import { CreateCompanyUserDto } from '@/modules/companies/dto/create-company-user.dto';
import { UpdateCompanyUserDto } from '@/modules/companies/dto/update-company-user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/auth/schemas/user.schema';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CompanyResponseDto } from '@/modules/companies/dto/company-response.dto';

@ApiTags('Empresas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva empresa' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: 201,
    description: 'La empresa ha sido creada exitosamente',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: NIT o email de usuario ya existe',
  })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Obtener todas las empresas' })
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
    description: 'Búsqueda por nombre, NIT o email',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filtrar por estado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas obtenida exitosamente',
    type: [CompanyResponseDto],
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.companiesService.findAll(pageNum, limitNum, search, status);
  }

  @Get('my-company/users')
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Obtener usuarios de mi empresa',
    description:
      'Retorna los usuarios de la empresa del usuario COMPANY autenticado, incluyendo al usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuarios obtenidos exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada o usuario sin empresa asociada',
  })
  async findMyCompanyUsers(@Request() req: { user: { id: string } }) {
    const company = await this.companiesService.getCompanyByUserId(req.user.id);
    return this.companiesService.findUsersByCompany(
      company._id.toString(),
      req.user.id,
    );
  }

  @Get(':id/users')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener usuarios asociados a una empresa' })
  @ApiResponse({
    status: 200,
    description: 'Usuarios obtenidos exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  async findUsersByCompany(@Param('id') id: string) {
    await this.companiesService.findOne(id);
    return this.companiesService.findUsersByCompany(id);
  }

  @Post(':id/users')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un usuario asociado a una empresa' })
  @ApiBody({ type: CreateCompanyUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: Email ya existe',
  })
  async createCompanyUser(
    @Param('id') id: string,
    @Body() createUserDto: CreateCompanyUserDto,
  ) {
    return this.companiesService.createCompanyUser(id, createUserDto);
  }

  @Patch(':id/users/:userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un usuario asociado a una empresa' })
  @ApiBody({ type: UpdateCompanyUserDto })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Empresa o usuario no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: Email ya existe',
  })
  async updateCompanyUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateCompanyUserDto,
  ) {
    return this.companiesService.updateCompanyUser(id, userId, updateUserDto);
  }

  @Delete(':id/users/:userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un usuario asociado a una empresa' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Empresa o usuario no encontrado' })
  async removeCompanyUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.companiesService.removeCompanyUser(id, userId);
  }

  @Get('my-company')
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Obtener información de mi empresa',
    description:
      'Retorna la información de la empresa asociada al usuario COMPANY autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de la empresa obtenida exitosamente',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada o usuario sin empresa asociada',
  })
  getMyCompany(@Request() req: { user: { id: string } }) {
    return this.companiesService.getCompanyByUserId(req.user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener una empresa por ID' })
  @ApiResponse({
    status: 200,
    description: 'Empresa obtenida exitosamente',
    type: CompanyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Post('my-company')
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Crear mi empresa',
    description:
      'Permite al usuario COMPANY autenticado crear su propia empresa y asociarla a su cuenta',
  })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: 201,
    description: 'Empresa creada exitosamente',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: NIT ya existe o usuario ya tiene empresa asociada',
  })
  createMyCompany(
    @Request() req: { user: { id: string } },
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    return this.companiesService.createCompanyForUser(
      req.user.id,
      createCompanyDto,
    );
  }

  @Patch('my-company')
  @Roles(UserRole.COMPANY)
  @ApiOperation({
    summary: 'Actualizar información de mi empresa',
    description:
      'Actualiza la información de la empresa asociada al usuario COMPANY autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa actualizada exitosamente',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa no encontrada o usuario sin empresa asociada',
  })
  @ApiResponse({ status: 409, description: 'Conflicto: NIT ya existe' })
  updateMyCompany(
    @Request() req: { user: { id: string } },
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.updateCompanyByUserId(
      req.user.id,
      updateCompanyDto,
    );
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una empresa' })
  @ApiResponse({
    status: 200,
    description: 'Empresa actualizada exitosamente',
    type: CompanyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  @ApiResponse({ status: 409, description: 'Conflicto: NIT ya existe' })
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una empresa' })
  @ApiResponse({
    status: 200,
    description: 'Empresa eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar: tiene usuarios asociados',
  })
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar/desactivar una empresa' })
  @ApiResponse({
    status: 200,
    description: 'Estado de la empresa actualizado exitosamente',
    type: CompanyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  toggleStatus(@Param('id') id: string) {
    return this.companiesService.toggleStatus(id);
  }

  @Post('invitations')
  @ApiOperation({
    summary: 'Generar un enlace de invitación para crear una nueva empresa',
  })
  @ApiBody({ type: CreateInvitationDto })
  @ApiResponse({
    status: 201,
    description: 'Invitación generada exitosamente',
    type: InvitationResponseDto,
  })
  createInvitation(@Body() createInvitationDto: CreateInvitationDto) {
    return this.companiesService.createInvitation(createInvitationDto);
  }

  @Post('invitations/send-email')
  @ApiOperation({
    summary: 'Enviar invitación por correo electrónico a una empresa',
  })
  @ApiBody({ type: SendInvitationEmailDto })
  @ApiResponse({
    status: 201,
    description: 'Invitación enviada exitosamente por correo electrónico',
    type: InvitationResponseDto,
  })
  sendInvitationEmail(@Body() sendInvitationEmailDto: SendInvitationEmailDto) {
    return this.companiesService.sendInvitationEmail(sendInvitationEmailDto);
  }
}
