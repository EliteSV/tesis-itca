import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar
          className="hidden lg:flex"
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
        <MobileSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main
          className={cn(
            'flex-1 min-h-[calc(100vh-4rem)] pt-16 transition-all duration-300 ease-in-out min-w-0 overflow-x-hidden',
            sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64',
          )}
        >
          <div className="p-4 sm:p-6 lg:p-8 w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

