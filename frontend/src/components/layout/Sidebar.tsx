import { useMemo } from 'react';
import { LayoutDashboard, Users, Building2, GraduationCap, Settings, ChevronLeft, ChevronRight, FolderTree, Briefcase, FileText, BookOpen, History, BarChart3 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth.types';
import { Button } from '@/components/ui/button';
import { useHasAcceptedApplication } from '@/hooks/useHasAcceptedApplication';
import { useHasActivePractice } from '@/hooks/useHasActivePractice';

interface SidebarProps {
  className?: string;
  collapsed: boolean;
  onToggle: () => void;
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

export function Sidebar({ className, collapsed, onToggle }: SidebarProps) {
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
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 ease-in-out z-40',
        collapsed ? 'w-20' : 'w-64',
        className,
      )}
    >
      <div className="flex flex-col h-full w-full">
        <div className={cn(
          'flex items-center border-b border-slate-200 dark:border-slate-800 transition-all duration-300',
          collapsed ? 'justify-center p-4' : 'justify-between p-4'
        )}>
          {!collapsed && (
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Menú
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn('h-8 w-8', collapsed ? '' : 'ml-auto')}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
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
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative w-full',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                    collapsed ? 'justify-center' : '',
                    isDisabled && 'opacity-50 cursor-not-allowed',
                  )
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', collapsed && 'mx-auto')} />
                {!collapsed && (
                  <span className="transition-opacity duration-300">
                    {item.name}
                  </span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
