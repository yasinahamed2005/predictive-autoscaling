import React, { useEffect, useState, useCallback } from 'react';

const getRemaining = (targetDate) => {
  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - Date.now());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { total: diff, days, hours, minutes, seconds };
};

const CountdownTimer = ({ endDate, hoursFromNow, onExpire, className = '' }) => {
  // If endDate is provided, use it; otherwise compute from hoursFromNow
  const [targetDate] = useState(() => {
    if (endDate) return endDate;
    return new Date(Date.now() + (hoursFromNow || 6) * 3600 * 1000);
  });

  const [time, setTime] = useState(() => getRemaining(targetDate));

  const updateTimer = useCallback(() => {
    const remaining = getRemaining(targetDate);
    setTime(remaining);
    if (remaining.total <= 0 && onExpire) {
      onExpire();
    }
  }, [targetDate, onExpire]);

  useEffect(() => {
    updateTimer();
    const id = setInterval(updateTimer, 1000);
    return () => clearInterval(id);
  }, [updateTimer]);

  const pad = (n) => String(n).padStart(2, '0');

  if (time.total <= 0) {
    return (
      <span className="text-rose-500 font-bold text-xs bg-rose-500/10 px-2.5 py-1 rounded-md">
        DEAL EXPIRED
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1 font-mono font-bold text-xs sm:text-sm ${className}`} role="timer" aria-live="off">
      <div className="flex items-center gap-1">
        {time.days > 0 && (
          <>
            <span className="bg-ink text-white dark:bg-paper dark:text-ink px-2 py-1 rounded shadow-sm">
              {pad(time.days)}d
            </span>
            <span>:</span>
          </>
        )}
        <span className="bg-ink text-white dark:bg-paper dark:text-ink px-2 py-1 rounded shadow-sm">
          {pad(time.hours)}h
        </span>
        <span>:</span>
        <span className="bg-ink text-white dark:bg-paper dark:text-ink px-2 py-1 rounded shadow-sm">
          {pad(time.minutes)}m
        </span>
        <span>:</span>
        <span className="bg-ink text-white dark:bg-paper dark:text-ink px-2 py-1 rounded shadow-sm">
          {pad(time.seconds)}s
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;
