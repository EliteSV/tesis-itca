import { XCircle, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Application } from '@/types/opportunity.types';

interface RejectApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  rejectionReason: string;
  onRejectionReasonChange: (reason: string) => void;
  isPending: boolean;
  onConfirm: () => void;
}

export function RejectApplicationDialog({
  open,
  onOpenChange,
  application,
  rejectionReason,
  onRejectionReasonChange,
  isPending,
  onConfirm,
}: RejectApplicationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-[#C62828]" />
            ¿Rechazar aplicación?
          </DialogTitle>
          <DialogDescription className="pt-2">
            ¿Estás seguro de rechazar la aplicación de{' '}
            <strong>{application?.student?.name}</strong>? Por favor, proporciona
            una razón para el rechazo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">
              Razón de rechazo <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => onRejectionReasonChange(e.target.value)}
              placeholder="Ej: No cumple con los requisitos mínimos, falta de experiencia en las tecnologías requeridas..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-300 dark:border-slate-600"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!rejectionReason.trim() || isPending}
            className="bg-[#C62828] hover:bg-[#B71C1C] text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Rechazando...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Confirmar Rechazo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

