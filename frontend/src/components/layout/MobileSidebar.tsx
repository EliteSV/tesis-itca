import { useMemo } from 'react';
import { X, LayoutDashboard, Users, Building2, GraduationCap, Settings, FolderTree, Briefcase, FileText, BookOpen, BarChart3, History } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth.types';
import { Button } from '@/components/ui/button';
import { useHasAcceptedApplication } from '@/hooks/useHasAcceptedApplication';
import { useHasActivePractice } from '@/hooks/useHasActivePractice';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: [UserRole.ADMIN, UserRole.COMPANY, UserRole.ESTUDIANTE, UserRole.COORDINADOR],
      },
      {
        name: 'Oportunidades',
        href: '/oportunidades',
        icon: Briefcase,
        roles: [UserRole.COMPANY],
      },
      {
        name: 'Solicitudes',
        href: '/solicitudes',
        icon: FileText,
        roles: [UserRole.COMPANY],
      },
      {
        name: 'Oportunidades',
        href: '/admin/opportunities',
        icon: Briefcase,
        roles: [UserRole.ADMIN, UserRole.COORDINADOR],
      },
      {
        name: 'Oportunidades Disponibles',
        href: '/oportunidades-disponibles',
        icon: Briefcase,
        roles: [UserRole.ESTUDIANTE],
      },
      {
        name: 'Mis Solicitudes',
        href: '/mis-solicitudes',
        icon: Briefcase,
        roles: [UserRole.ESTUDIANTE],
      },
      {
        name: 'Solicitudes',
        href: '/solicitudes-coordinador',
        icon: FileText,
        roles: [UserRole.COORDINADOR],
      },
      {
        name: 'Estudiantes',
        href: '/estudiantes',
        icon: GraduationCap,
        roles: [UserRole.ADMIN, UserRole.COMPANY, UserRole.COORDINADOR],
      },
      {
        name: 'Empresas',
        href: '/companies',
        icon: Building2,
        roles: [UserRole.ADMIN],
      },
      {
        name: 'Categorías de Carrera',
        href: '/career-categories',
        icon: FolderTree,
        roles: [UserRole.ADMIN],
      },
      {
        name: 'Carreras',
        href: '/careers',
        icon: GraduationCap,
        roles: [UserRole.ADMIN],
      },
      {
        name: 'Usuarios',
        href: '/users',
        icon: Users,
        roles: [UserRole.ADMIN],
      },
      {
        name: 'Reportes',
        href: '/reports',
        icon: BarChart3,
        roles: [UserRole.ADMIN],
      },
      {
        name: 'Configuración',
        href: '/settings',
        icon: Settings,
        roles: [UserRole.ADMIN, UserRole.COMPANY, UserRole.ESTUDIANTE, UserRole.COORDINADOR],
      },
    ];

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { hasAnyRole, user } = useAuth();
  const hasAcceptedApplication = useHasAcceptedApplication();
  const hasActivePractice = useHasActivePractice();

  const filteredNavigation = navigation.filter((item) => {
    if (!hasAnyRole(item.roles)) {
      return false;
    }
    if (
      item.name === 'Dashboard' &&
      user?.role === UserRole.ESTUDIANTE &&
      hasActivePractice
    ) {
      return false;
    }
    return true;
  });

  // Agregar "Mi Práctica Profesional" e "Historial de Prácticas" si el estudiante tiene una solicitud aceptada
  const navigationWithPractice = useMemo(() => {
    if (user?.role === UserRole.ESTUDIANTE && hasAcceptedApplication) {
      const practiceIndex = filteredNavigation.findIndex(
        (item) => item.name === 'Mis Solicitudes',
      );
      if (practiceIndex !== -1) {
        const newNavigation = [...filteredNavigation];
        newNavigation.splice(practiceIndex + 1, 0, {
          name: 'Mi Práctica Profesional',
          href: '/mi-practica-profesional',
          icon: BookOpen,
          roles: [UserRole.ESTUDIANTE],
        });
        newNavigation.splice(practiceIndex + 2, 0, {
          name: 'Historial de Prácticas',
          href: '/historial-practicas',
          icon: History,
          roles: [UserRole.ESTUDIANTE],
        });
        return newNavigation;
      }
    }
    return filteredNavigation;
  }, [filteredNavigation, user?.role, hasAcceptedApplication]);

  const requiresPasswordChange =
    user?.isTemporaryPassword && user?.role === 'estudiante';
  const hasIncompleteProfile =
    user?.isProfileIncomplete && user?.role === 'estudiante';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transform transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4">
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Menú
          </span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar menú</span>
          </Button>
        </div>
        <nav className="p-4 space-y-1">
          {navigationWithPractice.map((item) => {
            const Icon = item.icon;
            const isDisabled =
              (requiresPasswordChange && item.href !== '/settings') ||
              (hasIncompleteProfile && item.href !== '/settings');
            const disabledHref = requiresPasswordChange
              ? '/settings?changePassword=true'
              : '/settings';
            return (
              <NavLink
                key={item.name}
                to={isDisabled ? disabledHref : item.href}
                onClick={(e) => {
                  if (isDisabled) {
                    e.preventDefault();
                  } else {
                    onClose();
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                    isDisabled && 'opacity-50 cursor-not-allowed',
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

