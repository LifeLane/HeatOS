import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigation } from '../../context/NavigationContext';

interface MotionWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

export const FadeIn: React.FC<MotionWrapperProps> = ({ children, className = '', delay = 0, id }) => {
  const { accessibilitySettings } = useNavigation();
  if (accessibilitySettings.reducedMotion) {
    return <div id={id} className={className}>{children}</div>;
  }

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, delay, ease: [0.2, 0, 0, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SlideInUp: React.FC<MotionWrapperProps & { offset?: number }> = ({
  children,
  className = '',
  delay = 0,
  offset = 12,
  id,
}) => {
  const { accessibilitySettings } = useNavigation();
  if (accessibilitySettings.reducedMotion) {
    return <div id={id} className={className}>{children}</div>;
  }

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -offset }}
      transition={{ duration: 0.3, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const CardEntrance: React.FC<MotionWrapperProps & { index?: number }> = ({
  children,
  className = '',
  index = 0,
  id,
}) => {
  const { accessibilitySettings } = useNavigation();
  if (accessibilitySettings.reducedMotion) {
    return <div id={id} className={className}>{children}</div>;
  }

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.25,
        delay: Math.min(index * 0.04, 0.25),
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const PageTransition: React.FC<{ children: React.ReactNode; tabKey: string }> = ({
  children,
  tabKey,
}) => {
  const { accessibilitySettings } = useNavigation();
  if (accessibilitySettings.reducedMotion) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export const NumberCounter: React.FC<{
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}> = ({ value, decimals = 0, prefix = '', suffix = '', className = '' }) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const { accessibilitySettings } = useNavigation();

  useEffect(() => {
    if (accessibilitySettings.reducedMotion) {
      setDisplayValue(value);
      return;
    }

    let start = displayValue;
    const end = value;
    if (start === end) return;

    const startTime = performance.now();
    const durationMs = 400;

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic out
      const current = start + (end - start) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [value, accessibilitySettings.reducedMotion]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export const PulseIndicator: React.FC<{ color?: string; size?: string; label?: string }> = ({
  color = 'bg-emerald-500',
  size = 'w-2 h-2',
  label,
}) => {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={label || 'Live status'}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
        <span className={`relative inline-flex rounded-full ${size} ${color}`} />
      </span>
      {label && <span className="text-xs font-semibold tracking-wide uppercase">{label}</span>}
    </span>
  );
};
