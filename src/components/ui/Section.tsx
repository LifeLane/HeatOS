import React from 'react';

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const Section: React.FC<SectionProps> = ({
  id,
  title,
  subtitle,
  action,
  badge,
  children,
  className = '',
  headerClassName = '',
}) => {
  return (
    <section id={id} className={`w-full mb-8 sm:mb-10 ${className}`}>
      {(title || subtitle || action || badge) && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 ${headerClassName}`}>
          <div className="flex items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                {title && (
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                    {title}
                  </h2>
                )}
                {badge && <div>{badge}</div>}
              </div>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl font-normal leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="w-full">{children}</div>
    </section>
  );
};

export default Section;
