import React from 'react';
import { motion } from 'motion/react';
import { useNavigation } from '../../context/NavigationContext';

interface DangerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
  fullWidth?: boolean;
  isLoading?: boolean;
  id: string;
}

export const DangerButton: React.FC<DangerButtonProps> = ({
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
    sm: 'text-xs px-3 py-1.5 min-h-[36px] rounded-lg gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-2 min-h-[44px] rounded-xl gap-2 font-medium',
    lg: 'text-sm sm:text-base px-4 py-2.5 min-h-[48px] rounded-xl gap-2.5 font-semibold',
  };

  const variantClasses = {
    outline: 'bg-rose-50 hover:bg-rose-100/90 active:bg-rose-200 text-rose-800 border border-rose-200/90',
    solid: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-2xs',
  };

  const buttonContent = (
    <>
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-rose-400 border-t-rose-700 rounded-full animate-spin flex-shrink-0" />
      ) : (
        icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>
      )}
      <span className="whitespace-nowrap">{children}</span>
      {!isLoading && icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </>
  );

  const baseClasses = `inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
    fullWidth ? 'w-full' : ''
  } ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (accessibilitySettings?.reducedMotion) {
    return (
      <button id={id} className={baseClasses} disabled={disabled || isLoading} {...props}>
        {buttonContent}
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
      {buttonContent}
    </motion.button>
  );
};

export default DangerButton;
