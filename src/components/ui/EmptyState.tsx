import React from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  id?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  id,
  className = '',
}) => {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 mb-4 shadow-xs">
        {icon || <HelpCircle className="w-6 h-6 text-slate-400" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <PrimaryButton id={`${id}-action-btn`} size="sm" onClick={onAction}>
              {actionLabel}
            </PrimaryButton>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <SecondaryButton
              id={`${id}-sec-action-btn`}
              size="sm"
              variant="outline"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </SecondaryButton>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
