import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, CheckCircle2 } from 'lucide-react';
import { Helmet } from '../components/Helmet';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <Helmet title="Reset password — Dukaan" />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md card-surface p-8 text-center">
          {sent ? (
            <>
              <CheckCircle2 className="text-leaf-500 mx-auto mb-4" size={44} />
              <h1 className="text-xl font-display font-bold text-ink dark:text-paper mb-2">Check your inbox</h1>
              <p className="text-ink/60 dark:text-paper/60 text-sm mb-6">
                If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
              </p>
              <Link to="/login" className="text-brand-500 font-semibold text-sm">Back to login</Link>
            </>
          ) : (
            <>
              <div className="bg-brand-50 dark:bg-brand-900/30 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="text-brand-500" size={26} />
              </div>
              <h1 className="text-2xl font-display font-bold text-ink dark:text-paper mb-1">Forgot password?</h1>
              <p className="text-ink/60 dark:text-paper/60 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label htmlFor="email" className="text-xs font-medium text-ink/60 dark:text-paper/60">Email</label>
                  <div className="flex items-center gap-2 mt-1 border border-ink/15 dark:border-paper/20 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-500">
                    <Mail size={16} className="text-ink/40 dark:text-paper/40" />
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-ink dark:text-paper" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-full transition-colors">
                  Send reset link
                </button>
              </form>
              <p className="text-center text-sm text-ink/60 dark:text-paper/60 mt-6">
                Remembered it? <Link to="/login" className="text-brand-500 font-semibold">Sign in</Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;
