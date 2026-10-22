import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
  Sparkles,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle2,
  Users
} from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('author'); // 'author' | 'admin'

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/author/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setIsSubmitting(true);
    login(demoEmail, demoPass)
      .then((user) => {
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/author/dashboard', { replace: true });
        }
      })
      .catch((err) => {
        setError(err.message || 'Quick login failed');
        setIsSubmitting(false);
      });
  };

  const authorPersonas = [
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      genre: 'Fiction & Memoir',
      stats: '2 Titles • ₹3,570 Pending',
      color: 'bg-emerald-600'
    },
    {
      name: 'Rohit Kapoor',
      email: 'rohit.kapoor@email.com',
      genre: 'Tech & Startups',
      stats: '2 Titles • ₹7,744 Pending',
      color: 'bg-blue-600'
    },
    {
      name: 'Ananya Reddy',
      email: 'ananya.reddy@email.com',
      genre: 'Historical Fiction',
      stats: '1 Title • ₹2,546 Pending (Zero Paid)',
      color: 'bg-amber-600'
    },
    {
      name: 'Sneha Kulkarni',
      email: 'sneha.kulkarni@email.com',
      genre: 'Romance & Fiction',
      stats: '3 Titles • 1 in Cover Design',
      color: 'bg-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col lg:flex-row">
      {/* Left Showcase Banner (Editorial Branding) */}
      <div className="lg:w-5/12 bg-gradient-to-br from-[#121033] via-[#1E1B4B] to-[#0F172A] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white text-indigo-950 font-serif font-black text-2xl flex items-center justify-center shadow-lg">
              B
            </div>
            <div>
              <span className="font-serif font-bold text-2xl text-white tracking-tight block">BookLeaf</span>
              <span className="text-[11px] font-semibold tracking-widest text-indigo-300 uppercase">Publishing Portal</span>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-200 text-xs font-medium">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Featured on Shark Tank India Season 4</span>
          </div>

          <div className="mt-8 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white leading-tight">
              Where Authors Build Their Publishing Legacy.
            </h2>
            <p className="text-sm text-indigo-200/90 leading-relaxed max-w-md">
              A transparent, two-sided support ecosystem uniting authors and our Delhi editorial operations team with AI-assisted response workflows.
            </p>
          </div>
        </div>

        {/* Catalog Statistics Grid */}
        <div className="my-10 relative z-10 grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-2xl font-bold font-serif text-white block">22,000+</span>
            <span className="text-xs text-indigo-200/80">Titles in Active Catalog</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-2xl font-bold font-serif text-white block">1,200+</span>
            <span className="text-xs text-indigo-200/80">Books Published Monthly</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-2xl font-bold font-serif text-amber-300 block">80/20</span>
            <span className="text-xs text-indigo-200/80">Net Profit Royalty Split</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-2xl font-bold font-serif text-emerald-400 block">&lt; 48h</span>
            <span className="text-xs text-indigo-200/80">Operational Triage Resolution</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-indigo-300/70 flex items-center justify-between">
          <span>In-House Delhi Printing Hub & Repro India</span>
          <span>India & United States</span>
        </div>
      </div>

      {/* Right Login & Persona Selection Panel */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900">
              Sign In to Your Workspace
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Select your role or choose a demo persona for instant one-click access.
            </p>
          </div>

          {/* Persona Mode Switcher Tabs */}
          <div className="bg-neutral-200/70 p-1 rounded-xl flex gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('author')}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'author'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-700" />
              Author Accounts (10 Seeded)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              Operations Triage (Admin)
            </button>
          </div>

          {/* Quick Persona Cards based on Tab */}
          {activeTab === 'author' ? (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                1-Click Author Access (Real Seed Records):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {authorPersonas.map((auth) => (
                  <button
                    key={auth.email}
                    type="button"
                    onClick={() => handleQuickLogin(auth.email, 'Author123!')}
                    className="p-3 text-left bg-white border border-neutral-200/90 rounded-xl hover:border-indigo-600 hover:shadow-xs transition-all cursor-pointer group flex items-start gap-3"
                  >
                    <div className={`w-8 h-8 rounded-lg ${auth.color} text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs`}>
                      {auth.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 truncate group-hover:text-indigo-950">
                          {auth.name}
                        </span>
                        <ArrowRight className="w-3 h-3 text-neutral-300 group-hover:text-indigo-600 shrink-0" />
                      </div>
                      <span className="text-[11px] text-neutral-500 block truncate">{auth.genre}</span>
                      <span className="text-[10px] text-indigo-700 font-semibold block mt-0.5">{auth.stats}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  Editorial Operations Command Center
                </span>
                <p className="text-xs text-indigo-800">
                  Manage queue, AI classifications, overrides, and grounded replies.
                </p>
                <span className="text-[11px] text-neutral-500 block font-mono">admin@bookleafpub.com</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleQuickLogin('admin@bookleafpub.com', 'AdminPassword123!')}
              >
                1-Click Launch →
              </Button>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-neutral-200 w-full" />
            <span className="bg-[#FAF9F5] px-3 text-xs text-neutral-400 font-medium uppercase tracking-wider absolute">
              Or sign in with email
            </span>
          </div>

          {/* Custom Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              Sign In to BookLeaf Portal
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
