import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { DASHBOARD_HOME } from '../../utils/constants';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import NotificationBell from '../shared/NotificationBell';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-line">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-ink">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 grid place-items-center text-white">
            <Ticket className="w-4 h-4" />
          </span>
          EventForge
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/discover" className="px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink transition-colors">Discover</Link>
          <a href="/#how-it-works" className="px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink transition-colors">How it works</a>
          <a href="/#roles" className="px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink transition-colors">For everyone</a>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <button onClick={() => navigate(DASHBOARD_HOME[user?.role] || '/app/home')} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-violet-50 transition-colors">
                <Avatar name={user?.name} src={user?.avatar} size="sm" />
                <span className="hidden sm:block text-sm font-semibold text-ink">{user?.name?.split(' ')[0]}</span>
              </button>
              <Button size="sm" variant="ghost" onClick={() => { logout(); navigate('/'); }}>Logout</Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('/login')}>Login</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
            </>
          )}
          <button className="md:hidden w-9 h-9 grid place-items-center rounded-lg hover:bg-violet-50" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="md:hidden border-t border-line px-5 py-3 flex flex-col gap-1 bg-surface">
          <Link to="/discover" onClick={() => setOpen(false)} className="py-2 text-sm font-semibold text-ink-soft">Discover</Link>
          <a href="/#how-it-works" onClick={() => setOpen(false)} className="py-2 text-sm font-semibold text-ink-soft">How it works</a>
          <a href="/#roles" onClick={() => setOpen(false)} className="py-2 text-sm font-semibold text-ink-soft">For everyone</a>
        </motion.div>
      )}
    </header>
  );
}
