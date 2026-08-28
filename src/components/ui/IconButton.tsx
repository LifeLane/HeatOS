import React from 'react';
import { motion } from 'motion/react';
import { useNavigation } from '../../context/NavigationContext';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'subtle' | 'ghost' | 'primary';
  badge?: string | number;
  isLoading?: boolean;
  id: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  'aria-label': ariaLabel,
  size = 'md',
  variant = 'outline',
  badge,
  isLoading = false,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const { accessibilitySettings } = useNavigation();

  const sizeClasses = {
    sm: 'w-8 h-8 min-h-[32px] min-w-[32px] text-sm rounded-lg',
    md: 'w-10 h-10 min-h-[44px] min-w-[44px] text-base rounded-xl',
    lg: 'w-12 h-12 min-h-[48px] min-w-[48px] text-lg rounded-xl',
  };

  const variantClasses = {
    outline: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-xs',
    subtle: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-transparent',
    ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 border border-transparent',
    primary: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-transparent shadow-xs',
  };

  const baseClasses = `relative inline-flex items-center justify-center transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex-shrink-0 ${
    sizeClasses[size]
  } ${variantClasses[variant]} ${className}`;

  const content = (
    <>
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <span className="flex items-center justify-center">{icon}</span>
      )}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#2563EB] text-[10px] font-bold text-white shadow-xs">
          {badge}
        </span>
      )}
    </>
  );

  if (accessibilitySettings.reducedMotion) {
    return (
      <button id={id} aria-label={ariaLabel} className={baseClasses} disabled={disabled || isLoading} {...props}>
        {content}
      </button>
    );
  }

  return (
    <motion.button
      id={id}
      aria-label={ariaLabel}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={baseClasses}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {content}
    </motion.button>
  );
};

export default IconButton;
