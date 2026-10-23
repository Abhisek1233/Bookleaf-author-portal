import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  BookOpen,
  LayoutDashboard,
  LifeBuoy,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export function AuthorLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    { label: 'Overview', to: '/author/dashboard', icon: LayoutDashboard },
    { label: 'My Books', to: '/author/books', icon: BookOpen },
    { label: 'Submit Query', to: '/author/tickets/new', icon: PlusCircle },
    { label: 'My Tickets', to: '/author/tickets', icon: LifeBuoy },
    { label: 'Author Account', to: '/author/profile', icon: User }
  ];

  return (
    <div className="h-dvh bg-[#FAF9F5] flex flex-col md:flex-row text-slate-900 font-sans overflow-hidden relative">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
            B
          </div>
          <div>
            <span className="font-serif font-bold text-slate-900 tracking-tight block leading-none text-base">BookLeaf</span>
            <span className="text-xs text-indigo-800 font-bold tracking-wider uppercase">Author Portal</span>
          </div>
        </div>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200 cursor-pointer w-full h-full border-0 p-0 text-left"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        ref={drawerRef}
        role={mobileMenuOpen ? 'dialog' : undefined}
        aria-modal={mobileMenuOpen ? 'true' : undefined}
        aria-label="Author Navigation"
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-72 md:w-64 bg-white border-r border-stone-200 shrink-0 h-dvh flex flex-col justify-between
          custom-scrollbar overflow-y-auto transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-700 flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs">
                B
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-slate-900 tracking-tight block leading-tight">BookLeaf</span>
                <span className="text-xs text-indigo-800 font-bold tracking-widest uppercase">Author Portal</span>
              </div>
            </div>
            {/* Close Button on Mobile Drawer */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              className="md:hidden p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Publishing Badge */}
          <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between text-xs text-stone-600 bg-stone-50/50">
            <span className="font-semibold text-stone-700">Self-Publishing Hub</span>
            <span className="inline-flex items-center gap-1 font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-indigo-700" />
              Verified
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1.5" aria-label="Main menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isNewTicketPage = location.pathname.startsWith('/author/tickets/new');
              const isItemActive = (isActive) => {
                if (item.to === '/author/tickets') {
                  return isActive && !isNewTicketPage;
                }
                return isActive;
              };

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => {
                    const active = isItemActive(isActive);
                    return `
                      flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px]
                      ${active
                        ? 'bg-indigo-50 text-indigo-950 shadow-2xs font-bold border-l-4 border-indigo-700'
                        : 'text-stone-700 hover:text-slate-950 hover:bg-stone-50'}
                    `;
                  }}
                  aria-current={isItemActive(location.pathname === item.to) ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/80">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-900 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-200">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AU'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate" title={user?.name}>{user?.name}</p>
              <p className="text-xs text-stone-600 truncate font-mono" title={user?.email}>{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-rose-800 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 cursor-pointer min-h-[44px]"
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
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
