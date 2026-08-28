import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'elevated' | 'interactive' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  id?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  id,
  className = '',
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]',
    bordered: 'bg-white border border-slate-200 shadow-none',
    muted: 'bg-[#F8F9FA] border border-slate-200/60 shadow-none',
    elevated: 'bg-white border border-slate-200/80 shadow-[0_2px_8px_0_rgba(15,23,42,0.05)]',
    interactive: 'bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:shadow-[0_4px_10px_0_rgba(15,23,42,0.06)] hover:border-blue-300 transition-all duration-200 cursor-pointer',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  };

  return (
    <div
      id={id}
      className={`rounded-xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
