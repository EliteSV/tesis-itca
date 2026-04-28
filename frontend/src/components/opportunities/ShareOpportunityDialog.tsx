import { useState, useCallback } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
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
import { useToastContext } from '@/contexts/ToastContext';
import type { Opportunity } from '@/types/opportunity.types';

interface ShareOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: Opportunity;
}

export function ShareOpportunityDialog({
  open,
  onOpenChange,
  opportunity,
}: ShareOpportunityDialogProps) {
  const [copied, setCopied] = useState(false);
  const toast = useToastContext();

  const shareLink =
    opportunity.shareLink ||
    `${window.location.origin}/opportunities/${opportunity.shareToken || opportunity._id}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Enlace copiado', 'El enlace ha sido copiado al portapapeles.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error al copiar', 'No se pudo copiar el enlace al portapapeles.');
    }
  }, [shareLink, toast]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: opportunity.title,
          text: opportunity.description || '',
          url: shareLink,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Error al compartir', 'No se pudo compartir el enlace.');
        }
      }
    } else {
      handleCopy();
    }
  }, [opportunity, shareLink, handleCopy, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir Oportunidad
          </DialogTitle>
          <DialogDescription>
            Comparte este enlace para que los estudiantes puedan aplicar a esta oportunidad.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shareLink">Enlace de la oportunidad</Label>
            <div className="flex gap-2">
              <Input
                id="shareLink"
                value={shareLink}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            {typeof navigator.share !== 'undefined' && (
              <Button
                type="button"
                variant="default"
                className="flex-1"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Enlace
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

