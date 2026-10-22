import React, { useState } from 'react';
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
  ShieldCheck,
  Radio
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Operations Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Support Queue & Triage', to: '/admin/tickets', icon: Inbox }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row text-neutral-900">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-neutral-900 text-white border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-serif font-bold text-base">
            B
          </div>
          <div>
            <span className="font-serif font-bold text-white tracking-tight block leading-none">BookLeaf</span>
            <span className="text-[10px] text-indigo-300 font-semibold tracking-wider uppercase">Ops & AI Triage</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md text-neutral-300 hover:bg-neutral-800"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Desktop Left Sidebar (Darker Slate / Ops aesthetic) */}
      <aside className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} md:block
        w-full md:w-64 bg-neutral-900 text-neutral-100 shrink-0 md:min-h-screen flex flex-col justify-between border-r border-neutral-800
      `}>
        <div>
          {/* Brand Header */}
          <div className="hidden md:flex items-center justify-between px-6 py-6 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
                B
              </div>
              <div>
                <span className="font-serif font-bold text-base text-white tracking-tight block leading-tight">BookLeaf</span>
                <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Operations Portal</span>
              </div>
            </div>
          </div>

          {/* Real-time Status Badge */}
          <div className="px-6 py-3 border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isConnected ? 'Live Gateway Connected' : 'Polling Sync Mode'}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              AI Active
            </span>
          </div>

          {/* Navigation */}
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
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}
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
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-neutral-800 text-indigo-300 font-semibold flex items-center justify-center text-xs shrink-0 border border-neutral-700">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-200 truncate">{user?.name || 'Operations Lead'}</p>
              <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
