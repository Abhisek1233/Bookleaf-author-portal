import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import {
  LayoutDashboard,
  Inbox,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close mobile drawer on Escape and trap focus
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const drawer = drawerRef.current;
    if (drawer) {
      const focusable = drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
          menuButtonRef.current?.focus();
        }
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Operations Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Support Queue & Triage', to: '/admin/tickets', icon: Inbox }
  ];

  return (
    <div className="h-dvh bg-[#FAF9F5] flex flex-col md:flex-row text-slate-900 font-sans overflow-hidden relative">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#090D16] text-white border-b border-slate-800 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
            B
          </div>
          <div>
            <span className="font-serif font-bold text-white tracking-tight block leading-none text-base">BookLeaf</span>
            <span className="text-xs text-indigo-300 font-bold tracking-wider uppercase">Operations Hub</span>
          </div>
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2.5 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            menuButtonRef.current?.focus();
          }}
          aria-label="Close navigation overlay"
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200 cursor-pointer w-full h-full border-0 p-0 text-left"
        />
      )}

      {/* Sidebar: Fixed on Desktop, Slide-Over Sheet on Mobile */}
      <aside
        ref={drawerRef}
        role={mobileMenuOpen ? 'dialog' : undefined}
        aria-modal={mobileMenuOpen ? 'true' : undefined}
        aria-label="Operations Navigation"
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-72 md:w-64 bg-[#090D16] text-slate-100 shrink-0 h-dvh flex flex-col justify-between border-r border-slate-800/80
          dark-scrollbar overflow-y-auto transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm">
                B
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-white tracking-tight block leading-tight">BookLeaf</span>
                <span className="text-xs text-indigo-400 font-bold tracking-widest uppercase">Operations Portal</span>
              </div>
            </div>
            {/* Close Button on Mobile Drawer */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real-time Status Badge */}
          <div
            className="px-5 py-2.5 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs bg-slate-950/60"
            title={isConnected ? 'WebSocket Gateway Connected (Real-time updates enabled)' : 'HTTP Polling Fallback Mode'}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} aria-hidden="true" />
              <span className="font-medium text-slate-300 truncate">
                {isConnected ? 'Live Gateway' : 'Polling Sync'}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-xs text-indigo-300 bg-indigo-950/90 px-2.5 py-0.5 rounded-md border border-indigo-800/60 shrink-0">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              AI Copilot
            </span>
          </div>

          {/* Navigation */}
          <nav className="p-3.5 space-y-1.5" aria-label="Operations menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px]
                    ${isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-bold border-l-4 border-indigo-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border-l-4 border-transparent'}
                  `}
                  aria-current={location.pathname.startsWith(item.to) ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-100 truncate" title={user?.name || 'Operations Lead'}>
                {user?.name || 'Operations Lead'}
              </p>
              <p className="text-xs text-slate-400 truncate font-mono" title={user?.email}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-rose-200 hover:text-white hover:bg-rose-950/80 rounded-xl transition-colors border border-rose-800 hover:border-rose-600 cursor-pointer min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main
        id="main-content"
        tabIndex="-1"
        className="flex-1 h-dvh overflow-y-auto custom-scrollbar focus:outline-none"
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
