import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InvitationsService } from '@/modules/invitations/invitations.service';
import { AcceptInvitationDto } from '@/modules/companies/dto/accept-invitation.dto';
import { ValidateInvitationResponseDto } from '@/modules/companies/dto/validate-invitation-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Invitaciones')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get('validate/:token')
  @ApiOperation({ summary: 'Validar un token de invitación' })
  @ApiParam({
    name: 'token',
    description: 'Token de invitación',
    example: 'abc123def456ghi789',
  })
  @ApiResponse({
    status: 200,
    description: 'Validación exitosa',
    type: ValidateInvitationResponseDto,
  })
  async validateInvitation(@Param('token') token: string) {
    return this.invitationsService.validateInvitation(token);
  }

  @Post('accept/:token')
  @ApiOperation({ summary: 'Aceptar una invitación y crear empresa + usuario' })
  @ApiParam({
    name: 'token',
    description: 'Token de invitación',
    example: 'abc123def456ghi789',
  })
  @ApiBody({ type: AcceptInvitationDto })
  @ApiResponse({
    status: 200,
    description: 'Invitación aceptada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Invitación inválida, expirada o ya utilizada',
  })
  @ApiResponse({
    status: 404,
    description: 'Token de invitación no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: NIT o email ya existe',
  })
  async acceptInvitation(
    @Param('token') token: string,
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ) {
    return this.invitationsService.acceptInvitation(token, acceptInvitationDto);
  }
}
