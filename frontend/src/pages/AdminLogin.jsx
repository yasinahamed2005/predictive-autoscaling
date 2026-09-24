import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Helmet } from '../components/Helmet';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api/v1';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        const json = await res.json();
        const user = json.data?.user;
        if (user?.role !== 'admin') {
          setError('Access Denied: You do not have Administrator permissions.');
          setLoading(false);
          return;
        }
        login(user, json.data?.accessToken);
        setLoading(false);
        navigate('/admin/dashboard', { replace: true });
        return;
      }
    } catch {
      // Fallback for dev mode
    }

    setLoading(false);

    // Dev admin credentials verification
    if (
      (email.trim().toLowerCase() === 'admin@dukaan.com' || email.trim().toLowerCase() === 'admin@dukaan.example') &&
      password === 'admin@123'
    ) {
      const adminUser = {
        id: 'admin-1',
        _id: 'admin-1',
        name: 'Dukaan Administrator',
        email: email.trim().toLowerCase(),
        role: 'admin',
      };
      login(adminUser);
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Invalid Admin credentials');
    }
  };

  return (
    <>
      <Helmet title="Admin Login — Dukaan Management Portal" />
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-900/5 dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md card-surface p-8 rounded-2xl border border-brand-500/30 shadow-2xl relative overflow-hidden"
        >
          <div className="text-center mb-6">
            <div className="bg-brand-500 text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-ink dark:text-paper mb-1">
              Admin Portal Sign In
            </h1>
            <p className="text-ink/60 dark:text-paper/60 text-xs">
              Restricted management area for Dukaan store administrators
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-4 text-xs font-bold text-rose-600 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="adminEmail" className="text-xs font-semibold text-ink/70 dark:text-paper/70">Admin Email</label>
              <div className="flex items-center gap-2 mt-1 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
                <Mail size={16} className="text-ink/40 dark:text-paper/40 shrink-0" />
                <input
                  id="adminEmail"
                  type="email"
                  required
                  placeholder="admin@dukaan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs sm:text-sm text-ink dark:text-paper"
                />
              </div>
            </div>

            <div>
              <label htmlFor="adminPassword" className="text-xs font-semibold text-ink/70 dark:text-paper/70">Admin Password</label>
              <div className="flex items-center gap-2 mt-1 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
                <Lock size={16} className="text-ink/40 dark:text-paper/40 shrink-0" />
                <input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs sm:text-sm text-ink dark:text-paper"
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
              {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-ink/10 dark:border-paper/10 text-center text-xs text-ink/50 dark:text-paper/50">
            Default dev credentials: <strong className="text-brand-500">admin@dukaan.com / admin@123</strong>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLogin;
