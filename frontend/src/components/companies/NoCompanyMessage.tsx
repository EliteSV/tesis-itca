import { Building2, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NoCompanyMessageProps {
  showActionButton?: boolean;
  actionButtonText?: string;
  onActionClick?: () => void;
  title?: string;
  description?: string;
  message?: string;
}

export function NoCompanyMessage({
  showActionButton = false,
  actionButtonText = 'Ir a Configuración',
  onActionClick,
  title = 'Empresa Requerida',
  description = 'Necesitas crear tu empresa para continuar',
  message = 'Para poder gestionar oportunidades y estudiantes, primero debes crear y configurar tu empresa. Completa la información de tu empresa a continuación.',
}: NoCompanyMessageProps) {
  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
        {showActionButton && (
          <Button
            onClick={onActionClick || (() => (window.location.href = '/settings'))}
            className="w-full sm:w-auto"
          >
            <Building2 className="mr-2 h-4 w-4" />
            {actionButtonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}


