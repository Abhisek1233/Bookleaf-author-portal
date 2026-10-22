import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', to: '/author/dashboard', icon: LayoutDashboard },
    { label: 'My Books', to: '/author/books', icon: BookOpen },
    { label: 'Submit Query', to: '/author/tickets/new', icon: PlusCircle },
    { label: 'My Tickets', to: '/author/tickets', icon: LifeBuoy },
    { label: 'Author Account', to: '/author/profile', icon: User }
  ];

  return (
    <div className="h-screen bg-[#FAF9F5] flex flex-col md:flex-row text-slate-900 font-sans overflow-hidden relative">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
            B
          </div>
          <div>
            <span className="font-serif font-bold text-slate-900 tracking-tight block leading-none text-base">BookLeaf</span>
            <span className="text-[10px] text-indigo-700 font-bold tracking-wider uppercase">Author Portal</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200 cursor-pointer"
        />
      )}

      {/* Sidebar: Fixed on Desktop, Slide-Over Sheet on Mobile */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-72 md:w-64 bg-white border-r border-stone-200 shrink-0 h-screen flex flex-col justify-between
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
                <span className="text-[10px] text-indigo-700 font-bold tracking-widest uppercase">Author Portal</span>
              </div>
            </div>
            {/* Close Button on Mobile Drawer */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Publishing Badge */}
          <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between text-xs text-stone-500 bg-stone-50/50">
            <span className="text-[11px] font-semibold text-stone-600">Self-Publishing Hub</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Verified
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-800 shadow-2xs font-bold border border-indigo-200/90'
                      : 'text-stone-600 hover:text-slate-900 hover:bg-stone-50'}
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-200">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AU'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-stone-500 truncate font-mono">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Workspace (Single Clean Scroll Container with Page Enter Animation) */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
