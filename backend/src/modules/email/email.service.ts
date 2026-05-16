import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('resend.apiKey');
    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY no está configurado en las variables de entorno',
      );
    }
    this.resend = new Resend(apiKey);
  }

  async sendCompanyInvitation(
    email: string,
    invitationLink: string,
    expiresInDays: number,
  ): Promise<void> {
    const fromEmail = this.configService.get<string>('resend.emailFrom');
    const fromName = this.configService.get<string>('resend.emailFromName');

    const emailHtml = this.getInvitationEmailTemplate(
      invitationLink,
      expiresInDays,
    );

    try {
      const result = await this.resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [email],
        subject:
          'Invitación para registrarse en Prácticas Profesionales ITCA-FEPADE',
        html: emailHtml,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Error al enviar el correo');
      }
    } catch (error: any) {
      console.error('Error al enviar correo electrónico:', error);

      if (
        error?.message?.includes('Invalid API key') ||
        error?.status === 401
      ) {
        throw new InternalServerErrorException(
          'La API key de Resend no es válida. Por favor, verifica la configuración de RESEND_API_KEY en el archivo .env',
        );
      }

      if (error?.message?.includes('Invalid email') || error?.status === 422) {
        throw new BadRequestException(
          `El correo electrónico "${email}" no es válido. Por favor, verifica el correo e intenta de nuevo.`,
        );
      }

      if (error?.message?.includes('rate limit') || error?.status === 429) {
        throw new InternalServerErrorException(
          'Se excedió el límite de envíos de correo. Por favor, intenta de nuevo más tarde.',
        );
      }

      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        'Error desconocido al enviar el correo electrónico';

      throw new InternalServerErrorException(
        `Error al enviar el correo electrónico: ${errorMessage}`,
      );
    }
  }

  private getInvitationEmailTemplate(
    invitationLink: string,
    expiresInDays: number,
  ): string {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expiresInDays);
    const formattedDate = expirationDate.toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación - Prácticas Profesionales ITCA-FEPADE</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Prácticas Profesionales
              </h1>
              <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                ITCA-FEPADE
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                ¡Has sido invitado a unirte!
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Te invitamos a formar parte del sistema de gestión de prácticas profesionales de ITCA-FEPADE. 
                Esta invitación te permitirá registrarte como empresa y comenzar a gestionar tus prácticas profesionales.
              </p>
              
              <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 6px;">
                <p style="margin: 0 0 12px 0; color: #2d3748; font-size: 14px; font-weight: 600;">
                  📋 ¿Qué puedes hacer?
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px; line-height: 1.8;">
                  <li>Completar el registro de tu empresa</li>
                  <li>Gestionar prácticas profesionales</li>
                  <li>Publicar oportunidades de prácticas</li>
                  <li>Colaborar con estudiantes de ITCA-FEPADE</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${invitationLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Aceptar Invitación
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Link fallback -->
              <p style="margin: 20px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6; text-align: center;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${invitationLink}" style="color: #667eea; word-break: break-all; text-decoration: none;">
                  ${invitationLink}
                </a>
              </p>
              
              <!-- Expiration notice -->
              <div style="margin-top: 30px; padding: 16px; background-color: #fff5e6; border-radius: 6px; border: 1px solid #ffd89b;">
                <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.5;">
                  <strong>⏰ Importante:</strong> Esta invitación expirará el <strong>${formattedDate}</strong> 
                  (en ${expiresInDays} día${expiresInDays !== 1 ? 's' : ''}). 
                  Asegúrate de completar tu registro antes de esa fecha.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px 0; color: #718096; font-size: 13px; line-height: 1.6; text-align: center;">
                Este correo fue enviado automáticamente por el sistema de Prácticas Profesionales ITCA-FEPADE.
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">
                Si no solicitaste esta invitación, puedes ignorar este correo de forma segura.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
