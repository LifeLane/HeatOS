/**
 * Centralized, bulletproof date, time, and numerical formatters for HeatOS.
 * Guarantees zero "Invalid Date", "NaN", "undefined", or "[object Object]" artifacts in the UI.
 */

export function parseSafeDate(input: unknown): Date | null {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === 'string') {
    // If it's a numeric string timestamp
    if (/^\d+$/.test(input.trim())) {
      const num = parseInt(input.trim(), 10);
      const d = new Date(num);
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(input);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

export function safeFormatTime(
  timestamp?: unknown,
  fallback = 'Just now',
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
): string {
  const date = parseSafeDate(timestamp);
  if (!date) return fallback;
  try {
    return date.toLocaleTimeString([], options);
  } catch {
    return fallback;
  }
}

export function safeFormatShortTime(
  timestamp?: unknown,
  fallback = 'Now'
): string {
  const date = parseSafeDate(timestamp);
  if (!date) return fallback;
  try {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return fallback;
  }
}

export function safeFormatDate(
  timestamp?: unknown,
  fallback = 'Today',
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string {
  const date = parseSafeDate(timestamp);
  if (!date) return fallback;
  try {
    return date.toLocaleDateString([], options);
  } catch {
    return fallback;
  }
}

export function safeFormatDateTime(
  timestamp?: unknown,
  fallback = 'Live Stream'
): string {
  const date = parseSafeDate(timestamp);
  if (!date) return fallback;
  try {
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  } catch {
    return fallback;
  }
}

export function safeFormatRelativeTime(
  timestamp?: unknown,
  fallback = 'Just now'
): string {
  const date = parseSafeDate(timestamp);
  if (!date) return fallback;
  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export function safeNumber(
  value: unknown,
  fallback = '—',
  decimals?: number
): string {
  if (value === null || value === undefined || value === '') return fallback;
  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num)) return fallback;
  if (decimals !== undefined) {
    return num.toFixed(decimals);
  }
  return num.toLocaleString();
}

export function formatTempWithUnit(
  valCelsius: number | null | undefined,
  unit: 'C' | 'F' = 'C',
  showPlusSign = false
): string {
  if (valCelsius === null || valCelsius === undefined || isNaN(valCelsius)) {
    return '—°' + unit;
  }
  const displayVal = unit === 'F' ? (valCelsius * 9) / 5 + 32 : valCelsius;
  const rounded = displayVal.toFixed(1);
  const prefix = showPlusSign && displayVal > 0 ? '+' : '';
  return `${prefix}${rounded}°${unit}`;
}
