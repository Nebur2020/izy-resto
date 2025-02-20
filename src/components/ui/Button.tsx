import React from 'react';
import { useTranslation } from 'react-i18next';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  translationKey?: string;
  spanClassName?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  translationKey,
  disabled,
  spanClassName = '',
  ...props
}: ButtonProps) {
  const { t } = useTranslation();
  const baseStyles = `
    relative inline-flex items-center justify-center
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
   bg-gradient-to-r from-blue-100 to-blue-200
   hover:from-blue-300 hover:to-blue-200
   text-gray-900
   shadow-sm
   focus:ring-blue-500/50
   dark:from-blue-500 dark:to-blue-400
   dark:hover:from-blue-600 dark:hover:to-blue-500
 `,
    secondary: `
   bg-white dark:bg-gray-800
   text-gray-700 dark:text-gray-200
   border border-gray-200 dark:border-gray-700
   hover:bg-gray-50 dark:hover:bg-gray-700
   hover:border-gray-300 dark:hover:border-gray-600
   focus:ring-gray-500/50
   shadow-sm text-gray-900
 `,
    danger: `
   bg-gradient-to-r from-red-600 to-red-500
   hover:from-red-700 hover:to-red-600
   text-gray-900
   shadow-sm
   focus:ring-red-500/50
   dark:from-red-500 dark:to-red-400 
   dark:hover:from-red-600 dark:hover:to-red-500 text-gray-900
 `,
    ghost: `
   text-gray-600 hover:text-gray-900
   dark:text-gray-400 dark:hover:text-gray-100
   hover:bg-gray-100 dark:hover:bg-gray-800
   focus:ring-gray-500/50 text-gray-900
 `,
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5',
  };

  const hasGradient = variant === 'primary' || variant === 'danger';
  const hoverOverlay = hasGradient && (
    <span className="absolute inset-0 rounded-xl bg-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity" />
  );

  const content = translationKey ? t(translationKey) : children;
  return (
    <button
      className={`group ${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {hoverOverlay}
      <section className={`relative flex items-center ${spanClassName}`}>
        {content}
      </section>
    </button>
  );
}
