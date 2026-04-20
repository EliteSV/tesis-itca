import { useState, useCallback } from 'react';
import { Mail, Copy, Check, Loader2, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreateCompanyInvitation,
  useSendCompanyInvitationEmail,
} from '@/hooks/useCompanies';
import { useToastContext } from '@/contexts/ToastContext';

interface InvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type InvitationMode = 'link' | 'email';

export function InvitationDialog({
  open,
  onOpenChange,
}: InvitationDialogProps) {
  const [invitationLink, setInvitationLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const [mode, setMode] = useState<InvitationMode>('link');
  const [email, setEmail] = useState<string>('');
  const [emailSent, setEmailSent] = useState(false);
  const createInvitationMutation = useCreateCompanyInvitation();
  const sendEmailMutation = useSendCompanyInvitationEmail();
  const toast = useToastContext();

  const handleGenerate = useCallback(async () => {
    try {
      const result = await createInvitationMutation.mutateAsync({
        expiresInDays,
      });
      setInvitationLink(result.invitationLink);
      toast.success(
        'Invitación generada',
        'El enlace de invitación ha sido generado exitosamente',
      );
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'No se pudo generar la invitación';
      toast.error('Error', errorMessage);
    }
  }, [expiresInDays, createInvitationMutation, toast]);

  const handleSendEmail = useCallback(async () => {
    if (!email || !email.includes('@')) {
      toast.error('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    try {
      const result = await sendEmailMutation.mutateAsync({
        email,
        expiresInDays,
      });
      setEmailSent(true);
      setInvitationLink(result.invitationLink);
      toast.success(
        'Invitación enviada',
        `La invitación ha sido enviada exitosamente a ${email}`,
      );
    } catch (err: unknown) {
      let errorMessage = 'No se pudo enviar la invitación por correo';
      
      if (err && typeof err === 'object') {
        const error = err as {
          response?: {
            data?: {
              message?: string;
              error?: string;
            };
            status?: number;
          };
          message?: string;
        };
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      toast.error('Error al enviar correo', errorMessage);
    }
  }, [email, expiresInDays, sendEmailMutation, toast]);

  const handleCopy = useCallback(async () => {
    if (!invitationLink) return;

    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast.success('Copiado', 'El enlace ha sido copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error', 'No se pudo copiar el enlace');
    }
  }, [invitationLink, toast]);

  const handleClose = useCallback(() => {
    setInvitationLink('');
    setCopied(false);
    setExpiresInDays(7);
    setMode('link');
    setEmail('');
    setEmailSent(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const isLoading =
    createInvitationMutation.isPending || sendEmailMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Generar Invitación
          </DialogTitle>
          <DialogDescription>
            Genera un enlace de invitación para que una nueva empresa se registre en el sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!invitationLink && !emailSent ? (
            <>
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setMode('link')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'link'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Generar Enlace
                </button>
                <button
                  type="button"
                  onClick={() => setMode('email')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'email'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Enviar por Correo
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresInDays">
                  Días de validez (1-30 días)
                </Label>
                <Input
                  id="expiresInDays"
                  type="number"
                  min={1}
                  max={30}
                  value={expiresInDays}
                  onChange={(e) =>
                    setExpiresInDays(parseInt(e.target.value, 10) || 7)
                  }
                  disabled={isLoading}
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  El enlace de invitación expirará en {expiresInDays} día
                  {expiresInDays !== 1 ? 's' : ''}
                </p>
              </div>

              {mode === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Correo electrónico de la empresa
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="empresa@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    La invitación será enviada a este correo electrónico
                  </p>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>¿Qué hace este enlace?</strong>
                </p>
                <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Permite a la empresa completar su información</li>
                  <li>Crea un usuario con rol empresa asociado a la empresa</li>
                  <li>El enlace es único y solo puede usarse una vez</li>
                  <li>Expira después del tiempo especificado</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={mode === 'email' ? handleSendEmail : handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === 'email' ? 'Enviando...' : 'Generando...'}
                    </>
                  ) : mode === 'email' ? (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Invitación
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Generar Invitación
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {emailSent ? (
                <>
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                    <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                      ✓ Invitación enviada exitosamente
                    </p>
                    <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                      La invitación ha sido enviada por correo electrónico a{' '}
                      <strong>{email}</strong>. El enlace expirará en{' '}
                      {expiresInDays} día{expiresInDays !== 1 ? 's' : ''}.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Enlace de Invitación (para referencia)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={invitationLink}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleCopy}
                        title="Copiar enlace"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Enlace de Invitación</Label>
                    <div className="flex gap-2">
                      <Input
                        value={invitationLink}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleCopy}
                        title="Copiar enlace"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Copia este enlace y envíalo por correo electrónico a la
                      empresa. El enlace expirará en {expiresInDays} día
                      {expiresInDays !== 1 ? 's' : ''}.
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                    <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                      ✓ Invitación generada exitosamente
                    </p>
                    <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                      El enlace está listo para ser compartido. Asegúrate de
                      enviarlo por correo electrónico a la empresa.
                    </p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setInvitationLink('');
                    setEmailSent(false);
                    setMode('link');
                    setEmail('');
                    setExpiresInDays(7);
                  }}
                >
                  Generar Otra
                </Button>
                <Button type="button" onClick={handleClose}>
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

