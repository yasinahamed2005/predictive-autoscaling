import React from 'react';

const variants = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-pop',
  marigold: 'bg-marigold-500 hover:bg-marigold-600 text-ink',
  outline: 'border border-ink/15 dark:border-paper/20 hover:bg-ink/5 dark:hover:bg-paper/10 text-ink dark:text-paper',
  ghost: 'hover:bg-ink/5 dark:hover:bg-paper/10 text-ink dark:text-paper',
  danger: 'bg-rose-500 hover:bg-rose-600 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = React.forwardRef(({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => (
  <button
    ref={ref}
    className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
));
Button.displayName = 'Button';

export default Button;
