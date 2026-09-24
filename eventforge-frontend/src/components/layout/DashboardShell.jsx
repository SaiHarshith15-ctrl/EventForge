import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationBell from '../shared/NotificationBell';
import Avatar from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import PageTransition from './PageTransition';

export default function DashboardShell() {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUiStore();

  return (
    <div className="min-h-screen bg-paper">
      <Sidebar />
      <div className="lg:pl-64">
        <header className="h-16 sticky top-0 z-30 glass border-b border-line flex items-center justify-between px-5">
          <button className="lg:hidden w-9 h-9 grid place-items-center rounded-lg hover:bg-violet-50" onClick={toggleSidebar}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block text-sm font-semibold text-ink-soft">
            Welcome back, <span className="text-ink">{user?.name?.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
          </div>
        </header>
        <main className="p-5 lg:p-8 max-w-7xl mx-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
