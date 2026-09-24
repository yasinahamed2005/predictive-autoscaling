import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Helmet } from '../components/Helmet';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const OTP_LENGTH = 6;
const MOCK_OTP = '123456'; // Demo-only. A real backend issues & verifies this server-side.

const OTPVerification = () => {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(30);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const { login } = useAuth();
  const showToast = useToast();

  const pendingUser = JSON.parse(sessionStorage.getItem('pendingUser') || 'null');

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  if (!pendingUser) return <Navigate to="/signup" replace />;

  const handleChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < OTP_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code !== MOCK_OTP) {
      setError('Incorrect code. Try 123456 for this demo.');
      return;
    }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(pendingUser);
    localStorage.setItem('users', JSON.stringify(users));
    sessionStorage.removeItem('pendingUser');
    login(pendingUser);
    navigate('/profile');
  };

  const resend = () => {
    setResendIn(30);
    showToast(`OTP resent to ${pendingUser.phone || pendingUser.email}`);
  };

  return (
    <>
      <Helmet title="Verify OTP — Dukaan" />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md card-surface p-8 text-center">
          <div className="bg-brand-50 dark:bg-brand-900/30 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-brand-500" size={26} />
          </div>
          <h1 className="text-2xl font-display font-bold text-ink dark:text-paper mb-1">Verify your number</h1>
          <p className="text-ink/60 dark:text-paper/60 text-sm mb-6">
            Enter the 6-digit code sent to {pendingUser.phone ? `+91 ${pendingUser.phone}` : pendingUser.email}
            <br /><span className="text-xs">(demo code: 123456)</span>
          </p>

          {error && <div role="alert" className="mb-4 text-sm text-rose-600 bg-rose-500/10 px-3 py-2 rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-6" role="group" aria-label="One-time password">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                  className="w-11 h-12 text-center text-lg font-mono font-bold border border-ink/15 dark:border-paper/20 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-transparent text-ink dark:text-paper"
                />
              ))}
            </div>
            <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-full transition-colors">
              Verify & continue
            </button>
          </form>

          <button
            onClick={resend}
            disabled={resendIn > 0}
            className="mt-4 text-sm font-semibold text-brand-500 disabled:text-ink/30 dark:disabled:text-paper/30"
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
          </button>
        </motion.div>
      </div>
    </>
  );
};

export default OTPVerification;
