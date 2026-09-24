import React, { useState, useEffect } from 'react';

const checkIsAdminUser = () => {
  if (window.location.pathname.startsWith('/admin')) return true;
  try {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      const user = JSON.parse(saved);
      if (user && (user.email === 'admin@dukaan.com' || user.role === 'admin')) {
        return true;
      }
    }
  } catch (e) {}
  try {
    const role = localStorage.getItem('user_role');
    if (role === 'admin') return true;
  } catch (e) {}
  return false;
};

export const SystemHealthGuard = ({ children }) => {
  const [healthState, setHealthState] = useState({
    isOverloaded: false,
    activeUsers: 10,
    currentPods: 1,
    requiredPods: 1,
    currentRps: 1.5
  });

  const [isAdmin, setIsAdmin] = useState(checkIsAdminUser);

  useEffect(() => {
    const checkHealth = async () => {
      setIsAdmin(checkIsAdminUser());

      // 1. Fetch from Backend API
      try {
        const res = await fetch('http://localhost:5000/api/v1/system-status');
        const json = await res.json();
        
        if (res.status === 503 || (json && json.data && json.data.isOverloaded)) {
          setHealthState(json.data || { isOverloaded: true, activeUsers: 500, currentPods: 1, requiredPods: 10, currentRps: 75.0 });
          return;
        } else if (res.ok && json.data) {
          setHealthState(json.data);
          return;
        }
      } catch (err) {}

      // 2. LocalStorage fallback
      try {
        const raw = localStorage.getItem('dukaan_system_health');
        if (raw) {
          const parsed = JSON.parse(raw);
          setHealthState(parsed);
        }
      } catch (err) {}
    };

    checkHealth();
    const interval = setInterval(checkHealth, 250);
    window.addEventListener('storage', checkHealth);

    let bc = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('dukaan_system_channel');
      bc.onmessage = (event) => {
        if (event.data) {
          setHealthState(event.data);
        }
      };
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkHealth);
      if (bc) bc.close();
    };
  }, []);

  if (healthState.isOverloaded) {
    // ----------------------------------------------------
    // USER ACCOUNTS / REGULAR CUSTOMERS (Image 2 View)
    // Pure clean white page - No buttons, no dark mode card
    // ----------------------------------------------------
    if (!isAdmin) {
      return (
        <div className="fixed inset-0 z-[99999] bg-white text-slate-900 font-serif flex flex-col p-8 md:p-16 border-2 border-slate-300 select-none overflow-auto">
          <div className="max-w-4xl space-y-6 pt-6">
            <h1 className="text-4xl font-bold font-serif text-slate-900 tracking-tight">
              503 Service Temporarily Unavailable
            </h1>
            <p className="text-slate-800 text-lg leading-relaxed font-serif max-w-3xl">
              The server is temporarily unable to service your request due maintenance downtime or capacity problems. Please try again later.
            </p>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // ADMIN ACCOUNT ONLY (admin@dukaan.com / Image 1 View)
    // Detailed Technical Infrastructure Card - No manual switch buttons
    // ----------------------------------------------------
    return (
      <div className="fixed inset-0 z-[99999] bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full bg-slate-900 border border-rose-500/60 rounded-3xl p-8 md:p-10 shadow-2xl text-center space-y-6">
          
          {/* Warning Icon */}
          <div className="w-20 h-20 bg-rose-500/10 text-rose-400 rounded-3xl flex items-center justify-center mx-auto text-4xl border border-rose-500/30">
            ⚠️
          </div>

          {/* Main Status Header */}
          <div className="space-y-2">
            <span className="px-3.5 py-1.5 bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-wider rounded-full border border-rose-500/30">
              HTTP 503 SERVICE UNAVAILABLE (ADMIN DIAGNOSTICS)
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Service Temporarily Unavailable</h1>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto pt-1">
              Our servers are currently experiencing <strong>very high traffic ({healthState.activeUsers} simulated users)</strong>. Current system capacity has been exceeded.
            </p>
          </div>

          {/* System Overload Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-950/80 border border-rose-800/80 rounded-2xl text-rose-300 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            Status: 🔴 APPLICATION OVERLOADED ({healthState.currentRps} req/s vs {healthState.currentPods * 15} req/s capacity)
          </div>

          {/* Technical Detail Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left font-mono text-xs space-y-1.5 text-slate-400">
            <div className="text-slate-500">// Infrastructure Diagnostics</div>
            <div>• Active Backend Pods: <span className="text-rose-400 font-bold">{healthState.currentPods} Pod</span> (Max 15 req/s)</div>
            <div>• Incoming Traffic Load: <span className="text-amber-400 font-bold">{healthState.currentRps} req/s ({healthState.activeUsers} Users)</span></div>
            <div>• Required Capacity: <span className="text-emerald-400 font-bold">{healthState.requiredPods} Pods</span></div>
          </div>

          {/* Mentor Info Footer */}
          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
            <p>💡 <em>To restore this application: Enable <strong>Predictive Autoscaling</strong> on the Control Center dashboard (Port 8090).</em></p>
          </div>

        </div>
      </div>
    );
  }

  return children;
};
