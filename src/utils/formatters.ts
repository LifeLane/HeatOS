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
    if (isNaN(input) || !isFinite(input)) return null;
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed || trimmed === 'Invalid Date' || trimmed === 'NaN' || trimmed === 'null' || trimmed === 'undefined') {
      return null;
    }
    
    // If it's a numeric string timestamp (e.g. "1724283921000")
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      const d = new Date(num);
      if (!isNaN(d.getTime())) return d;
    }

    // If it's a time-only string (e.g. "11:19:02", "11:19", "11:19:02 AM", "11:19 PM")
    const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      const meridiem = timeMatch[4] ? timeMatch[4].toUpperCase() : null;

      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      const now = new Date();
      now.setHours(hours, minutes, seconds, 0);
      if (!isNaN(now.getTime())) return now;
    }

    // If it's a date string with space instead of 'T' or UTC notation (e.g. "2026-08-19 23:09:14 UTC")
    const normalizedIso = trimmed.replace(' UTC', 'Z').replace(' ', 'T');
    const dIso = new Date(normalizedIso);
    if (!isNaN(dIso.getTime())) return dIso;

    // Standard date constructor
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

export function safeFormatTime(
  timestamp?: unknown,
  fallback = 'Just now',
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
): string {
  if (typeof timestamp === 'string') {
    const trimmed = timestamp.trim();
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      return trimmed;
    }
  }
  const date = parseSafeDate(timestamp);
  if (!date) return fallback;
  try {
    const formatted = date.toLocaleTimeString([], options);
    return formatted === 'Invalid Date' ? fallback : formatted;
  } catch {
    return fallback;
  }
}

export function safeFormatShortTime(
  timestamp?: unknown,
  fallback = 'Now'
): string {
  if (typeof timestamp === 'string') {
    const trimmed = timestamp.trim();
    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(trimmed)) {
      return trimmed.slice(0, 5);
    }
  }
  const date = parseSafeDate(timestamp);
  if (!date) return fallback;
  try {
    const formatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return formatted === 'Invalid Date' ? fallback : formatted;
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
    const formatted = date.toLocaleDateString([], options);
    return formatted === 'Invalid Date' ? fallback : formatted;
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
    const dStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const tStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    if (dStr === 'Invalid Date' || tStr === 'Invalid Date') return fallback;
    return `${dStr} ${tStr}`;
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

  if (isNaN(diffSec)) return fallback;
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

