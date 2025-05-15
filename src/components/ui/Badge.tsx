import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'primary';
  className?: string;
  customColors?: {
    backgroundColor?: string;
    textColor?: string;
  };
}

export function Badge({
  children,
  variant = 'default',
  className = '',
  customColors,
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success:
      'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200',
    warning:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200',
    primary: '', // Will be set through inline style when customColors is provided
  };

  // Apply custom colors if provided
  const style =
    variant === 'primary' && customColors
      ? {
          backgroundColor:
            customColors.backgroundColor || 'rgba(37, 99, 235, 0.1)',
          color: customColors.textColor || '#2563EB',
        }
      : undefined;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
