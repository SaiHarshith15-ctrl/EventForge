import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Ticket, LogOut, X } from 'lucide-react';
import { NAV_BY_ROLE } from '../../utils/constants';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, closeSidebar } = useUiStore();
  const navigate = useNavigate();
  const items = NAV_BY_ROLE[user?.role] || [];

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 bg-ink/40 z-40 lg:hidden" onClick={closeSidebar} />}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-surface border-r border-line z-50 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-line shrink-0">
          <div className="flex items-center gap-2 font-display font-bold text-ink">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 grid place-items-center text-white">
              <Ticket className="w-4 h-4" />
            </span>
            EventForge
          </div>
          <button className="lg:hidden" onClick={closeSidebar}><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
          {items.map((item) => {
            const Icon = Icons[item.icon] || Icons.Circle;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'text-violet-700' : 'text-ink-soft hover:bg-violet-50 hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span layoutId="sidebar-active" className="absolute inset-0 bg-violet-50 rounded-xl" transition={{ type: 'spring', damping: 24, stiffness: 260 }} />
                    )}
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-line shrink-0">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-ink-soft hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
