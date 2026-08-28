import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import IconButton from './IconButton';
import { useNavigation } from '../../context/NavigationContext';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  id?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  id = 'heat-bottom-sheet',
}) => {
  const { accessibilitySettings } = useNavigation();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div id={id} className="fixed inset-0 z-50 flex items-end justify-center sm:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Sheet Container */}
          <motion.div
            initial={accessibilitySettings.reducedMotion ? { opacity: 0 } : { y: '100%' }}
            animate={accessibilitySettings.reducedMotion ? { opacity: 1 } : { y: 0 }}
            exit={accessibilitySettings.reducedMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-h-[85vh] bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Grab Handle */}
            <div className="w-full flex items-center justify-center pt-3 pb-1.5 flex-shrink-0">
              <div className="w-10 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header */}
            {(title || subtitle) && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
                <div>
                  {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
                  {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                </div>
                <IconButton
                  id={`${id}-close-btn`}
                  icon={<X className="w-4 h-4" />}
                  aria-label="Close sheet"
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                />
              </div>
            )}

            {/* Content Body */}
            <div className="p-5 overflow-y-auto overflow-x-hidden flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
