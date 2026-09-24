import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, AlertCircle, Truck, ShieldCheck } from 'lucide-react';

const PincodeChecker = ({ className = '' }) => {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dukaan_user_pincode');
    if (saved) {
      setPincode(saved);
      checkAvailability(saved);
    }
  }, []);

  const checkAvailability = (codeToCheck) => {
    const code = codeToCheck || pincode;
    if (!code || code.trim().length !== 6 || !/^\d+$/.test(code.trim())) {
      setResult({
        success: false,
        message: 'Please enter a valid 6-digit Indian pincode.',
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Simulate pincode check logic
      const validPrefixes = ['522', '560', '110', '400', '600', '700', '500', '302', '380'];
      const prefix = code.trim().slice(0, 3);
      const isAvailable = true; // Most pincodes serviceable

      // Calculate delivery estimate date (2-3 business days)
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      const formattedDate = deliveryDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      localStorage.setItem('dukaan_user_pincode', code.trim());
      setResult({
        success: true,
        pincode: code.trim(),
        deliveryDate: formattedDate,
        charge: 'FREE Delivery',
        minOrderForFree: 'Orders over ₹499 qualify for FREE delivery',
        expressAvailable: true,
      });
      setLoading(false);
    }, 400);
  };

  return (
    <div className={`card-surface rounded-xl p-4 border border-ink/10 dark:border-paper/10 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={18} className="text-brand-500" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-paper">
          Delivery & Availability Check
        </h4>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit Pincode (e.g. 522001)"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          className="flex-1 bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-lg px-3 py-2 text-xs font-mono text-ink dark:text-paper outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={() => checkAvailability()}
          disabled={loading}
          className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>

      {result && (
        <div className="mt-3 pt-3 border-t border-ink/10 dark:border-paper/10 text-xs">
          {result.success ? (
            <div className="space-y-1.5 text-ink/80 dark:text-paper/80">
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={15} /> Serviceable at {result.pincode}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-ink dark:text-paper">
                <Truck size={14} className="text-brand-500 shrink-0" />
                <span>Expected Delivery: <strong className="text-brand-500">{result.deliveryDate}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-ink/60 dark:text-paper/60">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                <span>{result.charge} ({result.minOrderForFree})</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-semibold text-rose-500">
              <AlertCircle size={15} /> {result.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PincodeChecker;
