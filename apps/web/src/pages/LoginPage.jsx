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
  ShieldCheck,
  Award,
  ArrowRight,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoOpen, setDemoOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [activeDemoTab, setActiveDemoTab] = useState('author'); // 'author' | 'admin'

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your email address and password.');
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
      setError(err.message || 'Invalid email or password. Please try again.');
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
        setError(err.message || 'Quick demo login failed.');
        setIsSubmitting(false);
      });
  };

  const authorPersonas = [
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      genre: 'Fiction & Memoir',
      titlesCount: 2,
      badgeColor: 'bg-emerald-600'
    },
    {
      name: 'Rohit Kapoor',
      email: 'rohit.kapoor@email.com',
      genre: 'Tech & Startups',
      titlesCount: 2,
      badgeColor: 'bg-indigo-600'
    },
    {
      name: 'Ananya Reddy',
      email: 'ananya.reddy@email.com',
      genre: 'Historical Fiction',
      titlesCount: 1,
      badgeColor: 'bg-amber-600'
    },
    {
      name: 'Sneha Kulkarni',
      email: 'sneha.kulkarni@email.com',
      genre: 'Poetry & Romance',
      titlesCount: 3,
      badgeColor: 'bg-purple-600'
    }
  ];

  return (
    <div className="min-h-dvh bg-[#FAF9F5] flex flex-col lg:flex-row">
      {/* Brand Showcase Banner: Compact on Mobile, Full-Height on Desktop (lg+) */}
      <div className="lg:w-5/12 bg-gradient-to-br from-[#121033] via-[#1E1B4B] to-[#0F172A] text-white p-6 sm:p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        {/* Header Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white text-indigo-950 font-serif font-black text-xl lg:text-2xl flex items-center justify-center shadow-lg">
              B
            </div>
            <div>
              <span className="font-serif font-bold text-xl lg:text-2xl text-white tracking-tight block">BookLeaf</span>
              <span className="text-xs font-semibold tracking-widest text-indigo-300 uppercase">Author Portal</span>
            </div>
          </div>

          <div className="mt-3 lg:mt-5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-200 text-xs font-medium">
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Featured on Shark Tank India Season 4</span>
          </div>

          <div className="hidden lg:block mt-8 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white leading-tight">
              Where Authors Build Their Publishing Legacy.
            </h2>
            <p className="text-sm text-indigo-200/90 leading-relaxed max-w-md">
              A transparent publishing portal connecting authors with our Delhi editorial operations team and AI-assisted support workflows.
            </p>
          </div>
        </div>

        {/* Catalog Highlights: Desktop only */}
        <div className="hidden lg:grid grid-cols-2 gap-4 my-10 relative z-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
            <span className="text-2xl font-bold font-serif text-white block">22,000+</span>
            <span className="text-xs text-indigo-200/80">Titles in Active Catalog</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
            <span className="text-2xl font-bold font-serif text-white block">1,200+</span>
            <span className="text-xs text-indigo-200/80">Books Published Monthly</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
            <span className="text-2xl font-bold font-serif text-amber-300 block">80/20</span>
            <span className="text-xs text-indigo-200/80">Net Profit Royalty Split</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
            <span className="text-2xl font-bold font-serif text-emerald-400 block">&lt; 48h</span>
            <span className="text-xs text-indigo-200/80">Typical First Response</span>
          </div>
        </div>

        {/* Footer Meta: Desktop only */}
        <div className="hidden lg:flex relative z-10 pt-6 border-t border-white/15 text-xs text-indigo-200 items-center justify-between font-sans">
          <span>In-House Delhi Hub & Repro India</span>
          <span>India & Global Distribution</span>
        </div>
      </div>

      {/* Main Form & Access Panel */}
      <div className="lg:w-7/12 flex-1 flex items-center justify-center p-5 sm:p-10 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Enter your credentials to access your author dashboard or operations desk.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Sign-In Form (Immediately visible on 375x667 mobile) */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-800 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@example.com"
                  className="w-full pl-10 pr-3 min-h-[44px] text-sm text-slate-900 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white shadow-2xs transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 min-h-[44px] text-sm text-slate-900 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-700 bg-white shadow-2xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full min-h-[44px]"
              isLoading={isSubmitting}
            >
              Sign In to Portal
            </Button>
          </form>

          {/* Quick Demo Access (Collapsible, placed cleanly BELOW the form) */}
          <div className="pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setDemoOpen(!demoOpen)}
              className="w-full flex items-center justify-between py-2 text-sm font-semibold text-indigo-900 hover:text-indigo-950 cursor-pointer group"
              aria-expanded={demoOpen}
            >
              <span className="flex items-center gap-2">
                <span>Quick demo access</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium">1-Click</span>
              </span>
              {demoOpen ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
            </button>

            {demoOpen && (
              <div className="mt-3 space-y-3 animate-in fade-in duration-200">
                {/* Persona Mode Switcher */}
                <div className="bg-stone-100 p-1 rounded-xl flex gap-1 text-xs font-semibold border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setActiveDemoTab('author')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeDemoTab === 'author'
                        ? 'bg-white text-indigo-950 shadow-2xs font-bold border border-stone-200/60'
                        : 'text-stone-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-700" />
                    Author Accounts
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDemoTab('admin')}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeDemoTab === 'admin'
                        ? 'bg-white text-indigo-950 shadow-2xs font-bold border border-stone-200/60'
                        : 'text-stone-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                    Staff Operations
                  </button>
                </div>

                {activeDemoTab === 'author' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {authorPersonas.map((auth) => (
                      <button
                        key={auth.email}
                        type="button"
                        onClick={() => handleQuickLogin(auth.email, 'Author123!')}
                        className="p-3 text-left bg-white border border-stone-200 rounded-xl hover:border-indigo-600 hover:shadow-xs transition-all cursor-pointer group flex items-start gap-2.5 min-h-[44px]"
                      >
                        <div className={`w-7 h-7 rounded-lg ${auth.badgeColor} text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5`}>
                          {auth.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-950">
                              {auth.name}
                            </span>
                            <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-indigo-600 shrink-0" />
                          </div>
                          <span className="text-xs text-stone-600 block truncate">{auth.genre}</span>
                          <span className="text-xs text-indigo-800 font-medium block mt-0.5 font-sans">
                            {auth.titlesCount} {auth.titlesCount === 1 ? 'Title' : 'Titles'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-indigo-50/90 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                        Editorial Operations Desk
                      </span>
                      <p className="text-xs text-indigo-900 leading-snug">
                        Full queue triage, AI classification overrides & draft responses.
                      </p>
                      <span className="text-xs text-stone-600 block font-mono">admin@bookleafpub.com</span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="shrink-0 min-h-[40px]"
                      onClick={() => handleQuickLogin('admin@bookleafpub.com', 'AdminPassword123!')}
                    >
                      Launch Admin →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
