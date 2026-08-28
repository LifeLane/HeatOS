import React from 'react';

interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  id,
  title,
  subtitle,
  icon,
  badge,
  action,
  children,
  className = '',
  padding = 'md',
  fullWidth = true,
  ...props
}) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  };

  return (
    <div
      id={id}
      className={`rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || icon || badge || action) && (
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-700 flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {title && (
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                    {title}
                  </h3>
                )}
                {badge && <div>{badge}</div>}
              </div>
              {subtitle && (
                <p className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action && <div className="flex items-center gap-1.5 flex-shrink-0">{action}</div>}
        </div>
      )}

      <div className={paddingMap[padding]}>{children}</div>
    </div>
  );
};

export default SectionCard;
