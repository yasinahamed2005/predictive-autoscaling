import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { Helmet } from '../components/Helmet';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const API_BASE = 'http://localhost:5000/api/v1';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showRegisterLink, setShowRegisterLink] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const showToast = useToast();

  const from = location.state?.from?.pathname || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowRegisterLink(false);
    setLoading(true);

    const normInput = email.trim().toLowerCase();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normInput, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const user = json.data?.user;
        const accessToken = json.data?.accessToken;
        login(user, accessToken);
        setLoading(false);
        navigate(from, { replace: true });
        return;
      }
    } catch {
      // Backend offline or timeout — fallback gracefully
    }

    // Local fallback authentication check (by Email or Phone)
    const users = JSON.parse(localStorage.getItem('dukaan_users') || '[]');
    let user = users.find(
      (u) =>
        (u.email?.toLowerCase() === normInput || u.phone?.trim() === normInput) &&
        u.password === password
    );

    // Development default admin fallback
    if (
      !user &&
      (normInput === 'admin@dukaan.com' || normInput === 'admin@dukaan.example') &&
      password === 'admin@123'
    ) {
      user = {
        id: 'admin-1',
        _id: 'admin-1',
        name: 'Dukaan Admin',
        email: normInput,
        role: 'admin',
      };
    }

    setLoading(false);

    if (user) {
      login(user);
      navigate(from, { replace: true });
    } else {
      setError('Invalid email/mobile or password.');
      setShowRegisterLink(true);
    }
  };

  return (
    <>
      <Helmet title="Login — Dukaan" />
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md card-surface p-8 rounded-2xl border border-ink/10 dark:border-paper/10 shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="bg-brand-50 dark:bg-brand-900/30 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
              <LogIn className="text-brand-500" size={26} />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-ink dark:text-paper mb-1">
              Welcome back to Dukaan
            </h1>
            <p className="text-ink/60 dark:text-paper/60 text-xs">
              Sign in to manage your orders, wishlist & addresses
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-4 text-xs font-semibold text-rose-600 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2.5 rounded-xl space-y-1">
              <p>{error}</p>
              {showRegisterLink && (
                <Link to="/signup" className="inline-flex items-center gap-1 font-bold text-brand-500 hover:underline mt-1">
                  Create new account with this email <ArrowRight size={13} />
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="text-xs font-bold text-ink dark:text-paper">Email Address or Mobile</label>
              <div className="flex items-center gap-2 mt-1 bg-white dark:bg-paper/10 border border-ink/20 dark:border-paper/20 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
                <Mail size={16} className="text-ink/50 dark:text-paper/50 shrink-0" />
                <input
                  id="email"
                  type="text"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com or 10-digit phone"
                  className="w-full bg-transparent outline-none text-xs sm:text-sm text-ink dark:text-paper font-semibold placeholder:text-ink/40 dark:placeholder:text-paper/40"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold text-ink dark:text-paper">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-brand-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="flex items-center gap-2 mt-1 bg-white dark:bg-paper/10 border border-ink/20 dark:border-paper/20 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
                <Lock size={16} className="text-ink/50 dark:text-paper/50 shrink-0" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-xs sm:text-sm text-ink dark:text-paper font-semibold placeholder:text-ink/40 dark:placeholder:text-paper/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-ink/40 dark:text-paper/40 hover:text-ink"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-full transition-colors text-sm shadow-md disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-ink/60 dark:text-paper/60 mt-6 pt-4 border-t border-ink/10 dark:border-paper/10">
            <span>New to Dukaan? <Link to="/signup" className="text-brand-500 font-bold hover:underline">Create account</Link></span>
            <Link to="/admin/login" className="text-xs font-bold text-ink/40 hover:text-brand-500 flex items-center gap-1">
              <ShieldCheck size={13} /> Admin Portal
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
