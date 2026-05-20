import { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMyCompany } from '@/hooks/useMyCompany';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site.config';
import { getRoleLabel } from '@/utils/role.utils';
import { UserRole } from '@/types/auth.types';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { data: company } = useMyCompany({
    enabled: user?.role === UserRole.COMPANY,
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const userAvatar = user?.role === UserRole.COMPANY && company?.logo
    ? company.logo
    : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <img
              src={siteConfig.logo.main}
              alt={siteConfig.organization.name}
              className="h-8 max-w-[140px] object-contain hidden sm:block"
              loading="lazy"
            />
            <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              {siteConfig.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium">{user?.name}</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span>{user?.role ? getRoleLabel(user.role) : ''}</span>
          </div>

          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="relative"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={user?.name || 'Usuario'}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="sr-only">Menú de usuario</span>
            </Button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
                    {user?.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.role ? getRoleLabel(user.role) : ''}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors mt-2"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

