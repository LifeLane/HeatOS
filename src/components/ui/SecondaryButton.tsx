import React from 'react';
import { motion } from 'motion/react';
import { useNavigation } from '../../context/NavigationContext';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'subtle' | 'ghost';
  fullWidth?: boolean;
  isLoading?: boolean;
  id: string;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  icon,
  iconPosition = 'left',
  size = 'md',
  variant = 'outline',
  fullWidth = false,
  isLoading = false,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const { accessibilitySettings } = useNavigation();

  const sizeClasses = {
    sm: 'text-xs px-3 py-2 min-h-[36px] rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] rounded-xl gap-2 font-medium',
    lg: 'text-base px-5 py-3 min-h-[48px] rounded-xl gap-2.5 font-medium',
  };

  const variantClasses = {
    outline: 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-xs',
    subtle: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-transparent',
    ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-transparent',
  };

  const baseClasses = `inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
    fullWidth ? 'w-full' : ''
  } ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  const content = (
    <>
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin flex-shrink-0" />
      ) : (
        icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>
      )}
      <span className="whitespace-nowrap">{children}</span>
      {!isLoading && icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </>
  );

  if (accessibilitySettings.reducedMotion) {
    return (
      <button id={id} className={baseClasses} disabled={disabled || isLoading} {...props}>
        {content}
      </button>
    );
  }

  return (
    <motion.button
      id={id}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={baseClasses}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {content}
    </motion.button>
  );
};

export default SecondaryButton;
