/**
 * HeatOS Centralized Design Tokens
 * Light-first, calm, intelligent, trustworthy visual foundation
 */

export const designTokens = {
  colors: {
    background: '#FBFBFA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#F4F4F2',
    surfaceSubtle: '#FAFAF8',
    surfaceHover: '#F8F9FA',
    
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    borderFocus: '#2563EB',
    
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    primaryHover: '#1D4ED8',
    
    success: '#16A34A',
    successBg: '#F0FDF4',
    successBorder: '#BBF7D0',
    successText: '#15803D',
    
    warning: '#D97706',
    warningBg: '#FFFBEB',
    warningBorder: '#FDE68A',
    warningText: '#B45309',
    
    critical: '#DC2626',
    criticalBg: '#FEF2F2',
    criticalBorder: '#FECACA',
    criticalText: '#B91C1C',
    
    // Environmental Pillars
    heat: '#EA580C',
    heatBg: '#FFF7ED',
    heatBorder: '#FFEDD5',
    heatText: '#C2410C',
    
    water: '#0284C7',
    waterBg: '#F0F9FF',
    waterBorder: '#BAE6FD',
    waterText: '#0369A1',
    
    nature: '#059669',
    natureBg: '#ECFDF5',
    natureBorder: '#A7F3D0',
    natureText: '#047857',
    
    air: '#0D9488',
    airBg: '#F0FDFA',
    airBorder: '#99F6E4',
    airText: '#0F766E',
    
    solar: '#D97706',
    solarBg: '#FEFCE8',
    solarBorder: '#FEF08A',
    solarText: '#A16207',
    
    fire: '#E11D48',
    fireBg: '#FFF1F2',
    fireBorder: '#FECDD3',
    fireText: '#BE123C',
  },
  
  shadows: {
    none: 'none',
    subtle: '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
    card: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
    cardHover: '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.03)',
    elevated: '0 10px 15px -3px rgba(15, 23, 42, 0.07), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
    modal: '0 20px 25px -5px rgba(15, 23, 42, 0.09), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
    bottomSheet: '0 -10px 25px -5px rgba(15, 23, 42, 0.08)',
  },
  
  radius: {
    none: '0px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    pill: '9999px',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    base: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  
  typography: {
    fonts: {
      sans: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    sizes: {
      display: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
      h1: 'text-2xl sm:text-3xl font-bold tracking-tight',
      h2: 'text-xl sm:text-2xl font-bold tracking-tight',
      h3: 'text-lg sm:text-xl font-semibold',
      body: 'text-base font-normal leading-relaxed',
      small: 'text-sm font-normal text-slate-600',
      caption: 'text-xs font-medium text-slate-500',
      metric: 'text-2xl sm:text-3xl font-bold font-mono tracking-tight',
      label: 'text-xs font-semibold uppercase tracking-wider text-slate-500',
    },
  },
  
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    standard: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export default designTokens;
