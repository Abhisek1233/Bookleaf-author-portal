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
  ExternalLink
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            B
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight block leading-none text-sm">BookLeaf</span>
            <span className="text-[10px] text-indigo-700 font-semibold tracking-wider uppercase">Author Portal</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Desktop Left Sidebar */}
      <aside className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} md:block
        w-full md:w-64 bg-white border-r border-slate-200 shrink-0 md:min-h-screen flex flex-col justify-between z-30
      `}>
        <div>
          {/* Brand Header */}
          <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              B
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-tight">BookLeaf</span>
              <span className="text-[10px] text-indigo-700 font-bold tracking-widest uppercase">Author Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-bold border border-indigo-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
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
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-200">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AU'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
