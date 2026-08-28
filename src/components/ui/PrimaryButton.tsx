import React from 'react';
import { motion } from 'motion/react';
import { useNavigation } from '../../context/NavigationContext';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  id: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  icon,
  iconPosition = 'left',
  size = 'md',
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
    lg: 'text-base px-5 py-3 min-h-[48px] rounded-xl gap-2.5 font-semibold',
  };

  const buttonContent = (
    <>
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>
      )}
      <span className="whitespace-nowrap">{children}</span>
      {!isLoading && icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </>
  );

  const baseClasses = `inline-flex items-center justify-center font-medium bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white shadow-sm hover:shadow transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${
    fullWidth ? 'w-full' : ''
  } ${sizeClasses[size]} ${className}`;

  if (accessibilitySettings.reducedMotion) {
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

export default PrimaryButton;
