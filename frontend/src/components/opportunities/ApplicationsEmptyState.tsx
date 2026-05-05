import { Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ApplicationTabType } from './ApplicationsTabNavigation';

interface ApplicationsEmptyStateProps {
  activeTab: ApplicationTabType;
}

const emptyStateMessages: Record<
  ApplicationTabType,
  { title: string; description: string }
> = {
  applied: {
    title: 'No hay solicitudes',
    description: 'Aún no has aplicado a ninguna oportunidad.',
  },
  approved: {
    title: 'No hay solicitudes aprobadas',
    description: 'Aún no tienes solicitudes aprobadas por empresas.',
  },
  accepted: {
    title: 'No hay solicitudes aceptadas',
    description: 'Aún no tienes solicitudes aceptadas.',
  },
  rejected: {
    title: 'No hay solicitudes rechazadas',
    description: 'Aún no tienes solicitudes rechazadas.',
  },
  saved: {
    title: 'No hay oportunidades guardadas',
    description: 'Aún no has guardado ninguna oportunidad.',
  },
};

export function ApplicationsEmptyState({
  activeTab,
}: ApplicationsEmptyStateProps) {
  const messages = emptyStateMessages[activeTab];

  return (
    <Card className="p-12 text-center bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <Briefcase className="h-16 w-16 mx-auto text-slate-400 mb-4" />
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {messages.title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400">{messages.description}</p>
    </Card>
  );
}

