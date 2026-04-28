import { CheckCircle2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Application } from '@/types/opportunity.types';

interface AcceptApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  isClosed: boolean;
  canAcceptMore: boolean;
  acceptedCount: number;
  availablePositions: number;
  remainingPositions: number;
  isPending: boolean;
  onConfirm: () => void;
}

export function AcceptApplicationDialog({
  open,
  onOpenChange,
  application,
  isClosed,
  canAcceptMore,
  acceptedCount,
  availablePositions,
  remainingPositions,
  isPending,
  onConfirm,
}: AcceptApplicationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#388E3C]" />
            ¿Aceptar aplicación?
          </DialogTitle>
          <DialogDescription className="pt-2">
            ¿Estás seguro de aceptar la aplicación de{' '}
            <strong>{application?.student?.name}</strong>?
            {isClosed && (
              <span className="block mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 font-medium">
                Esta oportunidad está cerrada. No se pueden aceptar más aplicaciones.
              </span>
            )}
            {!canAcceptMore && !isClosed && (
              <span className="block mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 font-medium">
                Ya se han aceptado todas las vacantes disponibles ({acceptedCount}/{availablePositions}).
              </span>
            )}
            {canAcceptMore && (
              <span className="block mt-3 p-3 bg-[#388E3C]/10 dark:bg-[#388E3C]/20 border border-[#388E3C]/30 dark:border-[#388E3C]/30 rounded-lg text-[#388E3C] dark:text-[#66BB6A]">
                Quedan {remainingPositions} vacante{remainingPositions !== 1 ? 's' : ''} disponible{remainingPositions !== 1 ? 's' : ''}.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
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
            disabled={!canAcceptMore || isPending}
            className="bg-[#388E3C] hover:bg-[#2E7D32] text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Aceptando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Aceptación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

