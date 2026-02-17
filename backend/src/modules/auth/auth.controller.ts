import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '@/modules/auth/auth.service';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { LoginResponseDto } from '@/modules/auth/dto/login-response.dto';
import { UpdateUserProfileDto } from '@/modules/auth/dto/update-user-profile.dto';
import { ChangePasswordDto } from '@/modules/auth/dto/change-password.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UserResponseDto } from '@/modules/auth/dto/login-response.dto';
import type { AuthenticatedRequest } from '@/common/types/request.types';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo estudiante',
    description:
      'Permite a un estudiante crear una cuenta con perfil incompleto',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Registro exitoso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: email o número de identificación ya existe',
  })
  async register(@Body() registerDto: RegisterDto): Promise<LoginResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y retorna un token JWT',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener perfil del usuario actual',
    description: 'Retorna la información del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getProfile(
    @Request() req: AuthenticatedRequest,
  ): Promise<UserResponseDto> {
    return this.authService.getProfile(req.user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar perfil del usuario actual',
    description: 'Actualiza la información del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: El correo electrónico ya está en uso',
  })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateDto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    return this.authService.updateProfile(req.user.id, updateDto);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar contraseña del usuario actual',
    description:
      'Cambia la contraseña del usuario autenticado, requiere la contraseña actual',
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña cambiada exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Contraseña actual incorrecta',
  })
  @ApiResponse({
    status: 400,
    description: 'La nueva contraseña debe ser diferente a la actual',
  })
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<UserResponseDto> {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Get('check-email')
  @ApiOperation({
    summary: 'Verificar disponibilidad de email',
    description: 'Verifica si un email está disponible para registro',
  })
  @ApiResponse({
    status: 200,
    description: 'Email disponible o no disponible',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
      },
    },
  })
  async checkEmail(
    @Query('email') email: string,
  ): Promise<{ available: boolean }> {
    return this.authService.checkEmailAvailability(email);
  }
}
