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
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col md:flex-row text-neutral-900">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-900 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
            B
          </div>
          <div>
            <span className="font-serif font-bold text-neutral-900 tracking-tight block leading-none">BookLeaf</span>
            <span className="text-[10px] text-indigo-900 font-semibold tracking-wider uppercase">Author Portal</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md text-neutral-700 hover:bg-neutral-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Desktop Left Sidebar */}
      <aside className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} md:block
        w-full md:w-64 bg-white border-r border-neutral-200/90 shrink-0 md:min-h-screen flex flex-col justify-between
      `}>
        <div>
          {/* Brand Header */}
          <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-neutral-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-950 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
              B
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-neutral-950 tracking-tight block leading-tight">BookLeaf</span>
              <span className="text-[11px] text-indigo-900 font-semibold tracking-wider uppercase">Author Portal</span>
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
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-indigo-950 text-white shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'}
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
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-900 font-semibold flex items-center justify-center text-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AU'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</p>
              <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200/60 cursor-pointer"
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
