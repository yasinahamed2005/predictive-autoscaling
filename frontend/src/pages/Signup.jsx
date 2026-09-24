import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { Helmet } from '../components/Helmet';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();

  const from = location.state?.from?.pathname || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (phone && !/^\d{10}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const res = await signup({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });

      setLoading(false);

      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch {
      setLoading(false);
      setError('An error occurred during registration. Please try again.');
    }
  };

  return (
    <>
      <Helmet title="Create Account — Dukaan" />
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md card-surface p-8 rounded-2xl border border-ink/10 dark:border-paper/10 shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="bg-brand-50 dark:bg-brand-900/30 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserPlus className="text-brand-500" size={26} />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-ink dark:text-paper mb-1">
              Create your Dukaan Account
            </h1>
            <p className="text-ink/60 dark:text-paper/60 text-xs">
              Join thousands of happy shoppers for exclusive deals & fast delivery
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-4 text-xs font-semibold text-rose-600 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div>
              <label htmlFor="fullName" className="text-xs font-bold text-ink dark:text-paper">Full Name</label>
              <div className="flex items-center gap-2 mt-1 bg-white dark:bg-paper/10 border border-ink/20 dark:border-paper/20 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
                <User size={16} className="text-ink/50 dark:text-paper/50 shrink-0" />
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs sm:text-sm text-ink dark:text-paper font-semibold placeholder:text-ink/40 dark:placeholder:text-paper/40"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-bold text-ink dark:text-paper">Email Address</label>
              <div className="flex items-center gap-2 mt-1 bg-white dark:bg-paper/10 border border-ink/20 dark:border-paper/20 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
                <Mail size={16} className="text-ink/50 dark:text-paper/50 shrink-0" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs sm:text-sm text-ink dark:text-paper font-semibold placeholder:text-ink/40 dark:placeholder:text-paper/40"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="text-xs font-bold text-ink dark:text-paper">Mobile Number</label>
              <div className="flex items-center gap-2 mt-1 bg-white dark:bg-paper/10 border border-ink/20 dark:border-paper/20 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
                <Phone size={16} className="text-ink/50 dark:text-paper/50 shrink-0" />
                <input
                  id="phone"
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs sm:text-sm text-ink dark:text-paper font-mono font-semibold placeholder:text-ink/40 dark:placeholder:text-paper/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="text-xs font-bold text-ink dark:text-paper">Password</label>
                <div className="flex items-center gap-1.5 mt-1 bg-white dark:bg-paper/10 border border-ink/20 dark:border-paper/20 rounded-xl px-2.5 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
                  <Lock size={15} className="text-ink/50 dark:text-paper/50 shrink-0" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent outline-none text-xs text-ink dark:text-paper font-semibold placeholder:text-ink/40 dark:placeholder:text-paper/40"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-xs font-bold text-ink dark:text-paper">Confirm</label>
                <div className="flex items-center gap-1.5 mt-1 bg-white dark:bg-paper/10 border border-ink/20 dark:border-paper/20 rounded-xl px-2.5 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
                  <Lock size={15} className="text-ink/50 dark:text-paper/50 shrink-0" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent outline-none text-xs text-ink dark:text-paper font-semibold placeholder:text-ink/40 dark:placeholder:text-paper/40"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-full transition-colors text-sm shadow-md mt-2 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Customer Account'}
            </button>
          </form>

          <p className="text-center text-xs text-ink/60 dark:text-paper/60 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default Signup;
