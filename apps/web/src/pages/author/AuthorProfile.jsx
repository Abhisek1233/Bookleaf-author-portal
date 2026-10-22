import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  ShieldCheck,
  Building
} from 'lucide-react';

export function AuthorProfile() {
  const { user, logout } = useAuth();
  const author = user?.author || {};

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Profile & Security
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
          Author Account
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Your verified author record on BookLeaf Publishing.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AU'}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{user?.name}</h2>
            <p className="text-slate-400 text-xs mt-0.5">Author Account • ID: {author.id || user?.author_id}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
              <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                <span className="text-xs font-semibold text-slate-900 truncate block mt-0.5">{user?.email}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
              <Phone className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                <span className="text-xs font-semibold text-slate-900 truncate block mt-0.5">{author.phone || '—'}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">City</span>
                <span className="text-xs font-semibold text-slate-900 truncate block mt-0.5">{author.city || '—'}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Author Since</span>
                <span className="text-xs font-semibold text-slate-900 truncate block mt-0.5">
                  {author.joined_date ? new Date(author.joined_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Publishing Terms Notice */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Active BookLeaf Publishing Agreement
            </div>
            <p className="leading-relaxed">
              Your titles are published under BookLeaf's standard 80/20 royalty policy. Royalties are calculated quarterly and distributed to your verified bank account for balances exceeding ₹1,000.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              variant="outline"
              onClick={logout}
              icon={LogOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
