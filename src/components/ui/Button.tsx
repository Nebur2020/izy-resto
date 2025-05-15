import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSettings';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  translationKey?: string;
  style?: React.CSSProperties;
  spanClassName?: string;
  spanStyle?: React.CSSProperties;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  translationKey,
  disabled,
  spanClassName = '',
  spanStyle = {},
  style = {},
  ...props
}: ButtonProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const primaryColor = settings?.palette?.primary || '#0ea5e9';
  const secondaryColor = settings?.palette?.secondary || '#4f46e5';

  const baseStyles = `
    relative inline-flex items-center justify-center
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
   text-white !text-white
   shadow-sm
   focus:ring-blue-500/50
 `,
    secondary: `
   bg-white dark:bg-gray-800
   text-gray-700 dark:text-gray-200
   border border-gray-200 dark:border-gray-700
   hover:bg-gray-50 dark:hover:bg-gray-700
   hover:border-gray-300 dark:hover:border-gray-600
   focus:ring-gray-500/50
 `,
    danger: `
   bg-gradient-to-r from-red-600 to-red-500
   hover:from-red-700 hover:to-red-600
   text-white !text-white
   shadow-sm
   focus:ring-red-500/50
   dark:from-red-500 dark:to-red-400 
   dark:hover:from-red-600 dark:hover:to-red-500
 `,
    ghost: `
   hover:bg-gray-100 dark:hover:bg-gray-800
   focus:ring-gray-500/50 
 `,
    custom: '',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5',
  };

  // Determine style based on variant and theme
  let buttonStyle = { ...style };
  let currentTextStyle = { ...spanStyle };

  if (variant === 'primary') {
    // For primary buttons: gradient background with white text
    buttonStyle = {
      ...buttonStyle,
      background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
      transition: 'all 0.3s ease',
      color: '#FFFFFF',
    };
    currentTextStyle = { ...currentTextStyle, color: '#FFFFFF' };
  } else if (variant === 'ghost' && isLightMode) {
    // For ghost buttons in light mode: transparent background with primary color text
    buttonStyle = {
      ...buttonStyle,
      color: primaryColor,
    };
    currentTextStyle = { ...currentTextStyle, color: primaryColor };
  }

  // Enhanced hover effect for buttons with gradient
  const hasGradient = variant === 'primary' || variant === 'danger';
  const hoverOverlay = hasGradient && (
    <span className="absolute inset-0 rounded-xl bg-white/[0.08] opacity-0 group-hover:opacity-100 transition-opacity" />
  );

  // Handle mouse events for gradient switch and ghost buttons
  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary' && e.currentTarget.style) {
      e.currentTarget.style.background = `linear-gradient(to right, ${secondaryColor}, ${primaryColor})`;
      e.currentTarget.style.color = '#FFFFFF';
    } else if (variant === 'ghost' && isLightMode && e.currentTarget.style) {
      // Darken the primary color slightly on hover for ghost buttons
      const darkerPrimary = primaryColor;
      e.currentTarget.style.color = darkerPrimary;
    }
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary' && e.currentTarget.style) {
      e.currentTarget.style.background = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`;
      e.currentTarget.style.color = '#FFFFFF';
    } else if (variant === 'ghost' && isLightMode && e.currentTarget.style) {
      e.currentTarget.style.color = primaryColor;
    }
  };

  const content = translationKey ? t(translationKey) : children;

  // Determine the right span class based on variant
  let spanColorClass = '';
  if (variant === 'primary' || variant === 'danger') {
    spanColorClass = 'text-white';
  } else if (variant === 'ghost' && isLightMode) {
    spanColorClass = ''; // We'll use style for primary color
  }

  return (
    <button
      className={`group ${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
      style={buttonStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {hoverOverlay}
      <span
        className={`relative flex items-center ${spanColorClass} ${spanClassName}`}
        style={currentTextStyle}
      >
        {content}
      </span>
    </button>
  );
}
