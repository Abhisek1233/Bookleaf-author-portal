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
        <h1 className="text-2xl font-bold font-serif text-neutral-900">Author Account</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Your verified author profile on BookLeaf Publishing.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {/* Banner */}
        <div className="bg-indigo-950 p-6 sm:p-8 text-white flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white text-indigo-950 font-serif font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AU'}
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif">{user?.name}</h2>
            <p className="text-indigo-200 text-xs mt-0.5">Author Account • {author.id || user?.author_id}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 flex items-center gap-3">
              <Mail className="w-5 h-5 text-indigo-700 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Email</span>
                <span className="text-sm font-medium text-neutral-900 truncate block">{user?.email}</span>
              </div>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 flex items-center gap-3">
              <Phone className="w-5 h-5 text-indigo-700 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Contact Phone</span>
                <span className="text-sm font-medium text-neutral-900 truncate block">{author.phone || '—'}</span>
              </div>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-indigo-700 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">City</span>
                <span className="text-sm font-medium text-neutral-900 truncate block">{author.city || '—'}</span>
              </div>
            </div>

            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-700 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Author Since</span>
                <span className="text-sm font-medium text-neutral-900 truncate block">
                  {author.joined_date ? new Date(author.joined_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Publishing Terms Notice */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/70 text-xs text-neutral-600 space-y-1.5">
            <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Active BookLeaf Publishing Agreement
            </div>
            <p>
              Your publishing catalog is governed by BookLeaf Publishing's standard 80/20 royalty policy. Royalties are calculated quarterly and distributed to your linked bank account for balances exceeding ₹1,000.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end">
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
