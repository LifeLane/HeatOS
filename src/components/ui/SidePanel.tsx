import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import IconButton from './IconButton';
import { useNavigation } from '../../context/NavigationContext';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'md',
  id = 'heat-side-panel',
}) => {
  const { accessibilitySettings } = useNavigation();

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scroll
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

  const widthClasses = {
    sm: 'sm:w-80',
    md: 'sm:w-96 md:w-[440px]',
    lg: 'sm:w-[480px] md:w-[540px]',
    xl: 'sm:w-[600px] md:w-[680px]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id={id} className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={accessibilitySettings.reducedMotion ? { opacity: 0 } : { x: '100%' }}
            animate={accessibilitySettings.reducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={accessibilitySettings.reducedMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className={`relative z-10 w-full h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col ${widthClasses[width]}`}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-[#FBFBFA]/60">
              <div>
                {title && <h3 className="text-base sm:text-lg font-bold text-slate-900">{title}</h3>}
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
              <IconButton
                id={`${id}-close-btn`}
                icon={<X className="w-4 h-4" />}
                aria-label="Close panel"
                size="sm"
                variant="ghost"
                onClick={onClose}
              />
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto overflow-x-hidden flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SidePanel;
