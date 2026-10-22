import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, User, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    // Trigger immediate login
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

  const demoAuthors = [
    { name: 'Priya Sharma', email: 'priya.sharma@email.com', role: 'Author (Fiction)' },
    { name: 'Rohit Kapoor', email: 'rohit.kapoor@email.com', role: 'Author (Tech / Business)' },
    { name: 'Ananya Reddy', email: 'ananya.reddy@email.com', role: 'Author (Historical)' },
    { name: 'Sneha Kulkarni', email: 'sneha.kulkarni@email.com', role: 'Author (3 Books)' },
    { name: 'Farhan Sheikh', email: 'farhan.sheikh@email.com', role: 'Author (Poetry)' }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Crest */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-950 flex items-center justify-center text-white font-serif font-bold text-2xl shadow-md mx-auto mb-4">
          B
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900">
          BookLeaf Publishing
        </h1>
        <p className="mt-1.5 text-sm text-neutral-600">
          Author Support & Communication Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-neutral-200 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
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
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@example.com"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:border-indigo-700 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:border-indigo-700 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isSubmitting}
            >
              Sign In to Portal
            </Button>
          </form>

          {/* 1-Click Demo Credentials Helper */}
          <div className="mt-8 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Click Demo Login (Instant Evaluation)
            </div>

            {/* Admin 1-Click */}
            <div className="mb-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@bookleafpub.com', 'AdminPassword123!')}
                className="w-full p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition-all flex items-center justify-between text-left cursor-pointer group"
              >
                <div>
                  <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    Internal Operations Administrator
                  </p>
                  <p className="text-[11px] text-indigo-800">admin@bookleafpub.com</p>
                </div>
                <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded shadow-2xs group-hover:bg-indigo-900 group-hover:text-white transition-colors">
                  Login as Admin →
                </span>
              </button>
            </div>

            {/* Author 1-Click Options */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-neutral-500 font-medium mb-1">Or login as any seeded author (Password: Author123!):</p>
              {demoAuthors.map((auth) => (
                <button
                  key={auth.email}
                  type="button"
                  onClick={() => handleQuickLogin(auth.email, 'Author123!')}
                  className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 flex items-center justify-between text-left text-xs text-neutral-700 transition-colors cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <span className="font-medium text-neutral-900">{auth.name}</span>
                    <span className="text-[10px] text-neutral-500 ml-1.5">({auth.role})</span>
                  </div>
                  <span className="text-[10px] text-indigo-900 shrink-0 font-medium">Use →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
