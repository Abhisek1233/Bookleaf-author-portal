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
    <div className="h-screen bg-[#FAF9F5] flex flex-col md:flex-row text-slate-900 font-sans overflow-hidden relative">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#090D16] text-white border-b border-slate-800 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
            B
          </div>
          <div>
            <span className="font-serif font-bold text-white tracking-tight block leading-none text-base">BookLeaf</span>
            <span className="text-[10px] text-indigo-300 font-bold tracking-wider uppercase">Operations Hub</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200 cursor-pointer"
        />
      )}

      {/* Sidebar: Fixed on Desktop, Slide-Over Sheet on Mobile */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-72 md:w-64 bg-[#090D16] text-slate-100 shrink-0 h-screen flex flex-col justify-between border-r border-slate-800/80
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
                <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">Operations Portal</span>
              </div>
            </div>
            {/* Close Button on Mobile Drawer */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real-time Status Badge */}
          <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-950/60">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[11px] font-medium">{isConnected ? 'Live Gateway Sync' : 'Polling Sync Mode'}</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-300 bg-indigo-950/90 px-2 py-0.5 rounded border border-indigo-800/60">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              AI Copilot
            </span>
          </div>

          {/* Navigation */}
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
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'}
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
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Operations Lead'}</p>
              <p className="text-[11px] text-slate-400 truncate font-mono">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/50 rounded-xl transition-colors border border-rose-900/60 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Workspace (Single Clean Scroll Container with Page Enter Animation) */}
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
