/**
 * HeatOS: Environmental Custom Monitoring Service
 * Manages user-defined spatial triggers, anomaly alarms, and notifications.
 */

import { EventSeverity, EnvironmentalEvent } from '../server/events/types';

export type MonitorSignalType = 
  | 'heat_anomaly'
  | 'ambient_temp'
  | 'apparent_temp'
  | 'air_quality'
  | 'wind_speed'
  | 'precipitation'
  | 'uv_index'
  | 'nature_pulse';

export type MonitorConditionType = 
  | 'above'
  | 'below'
  | 'rate_increase'
  | 'sustained_anomaly';

export type NotificationPreferenceType = 
  | 'banner_sound'
  | 'push_notification'
  | 'webhook'
  | 'email_digest';

export interface EnvironmentalCustomMonitor {
  id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  signal: MonitorSignalType;
  signalLabel: string;
  condition: MonitorConditionType;
  conditionLabel: string;
  threshold: string | number;
  thresholdUnit: string;
  duration: string; // e.g. "30 minutes", "15 minutes", "1 hour"
  severity: EventSeverity;
  notificationPreference: NotificationPreferenceType;
  notificationLabel: string;
  status: 'active' | 'triggered' | 'paused';
  createdAt: string;
  lastTriggered?: string;
  currentObservedValue?: string | number;
}

const STORAGE_KEY = 'heatos_custom_monitors_v1';

const DEFAULT_MONITORS: EnvironmentalCustomMonitor[] = [
  {
    id: 'mon-default-1',
    name: 'Lower Manhattan Heat Peak Watch',
    location: 'Lower Manhattan',
    latitude: 40.7128,
    longitude: -74.006,
    signal: 'heat_anomaly',
    signalLabel: 'Heat anomaly',
    condition: 'above',
    conditionLabel: 'Above',
    threshold: '+3°C',
    thresholdUnit: '°C anomaly',
    duration: '30 minutes',
    severity: 'HIGH',
    notificationPreference: 'banner_sound',
    notificationLabel: 'In-App Banner & Audio Cue',
    status: 'active',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    currentObservedValue: '+2.4°C',
  },
  {
    id: 'mon-default-2',
    name: 'Midtown Particulate & AQI Alarm',
    location: 'Midtown Core',
    latitude: 40.7589,
    longitude: -73.9851,
    signal: 'air_quality',
    signalLabel: 'Air Quality (AQI)',
    condition: 'above',
    conditionLabel: 'Above',
    threshold: '100 AQI',
    thresholdUnit: 'AQI',
    duration: '1 hour',
    severity: 'ELEVATED',
    notificationPreference: 'push_notification',
    notificationLabel: 'Mobile Push Notification',
    status: 'active',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    currentObservedValue: '58 AQI',
  },
  {
    id: 'mon-default-3',
    name: 'Waterfront Gust & Hydro Dispersion',
    location: 'Williamsburg Waterfront',
    latitude: 40.7181,
    longitude: -73.9617,
    signal: 'wind_speed',
    signalLabel: 'Wind Speed',
    condition: 'above',
    conditionLabel: 'Above',
    threshold: '45 km/h',
    thresholdUnit: 'km/h',
    duration: '15 minutes',
    severity: 'WATCH',
    notificationPreference: 'email_digest',
    notificationLabel: 'Daily Email Digest',
    status: 'active',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    currentObservedValue: '18 km/h',
  },
];

export class MonitorService {
  public static getMonitors(): EnvironmentalCustomMonitor[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MONITORS));
        return DEFAULT_MONITORS;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_MONITORS;
    }
  }

  public static createMonitor(
    data: Omit<EnvironmentalCustomMonitor, 'id' | 'createdAt' | 'status'>
  ): EnvironmentalCustomMonitor {
    const monitors = this.getMonitors();
    const newMonitor: EnvironmentalCustomMonitor = {
      ...data,
      id: `mon-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    monitors.unshift(newMonitor);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(monitors));
    } catch (e) {
      console.warn('Failed to persist monitor to localStorage', e);
    }
    return newMonitor;
  }

  public static deleteMonitor(id: string): void {
    const monitors = this.getMonitors().filter((m) => m.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(monitors));
    } catch (e) {
      console.warn('Failed to delete monitor from localStorage', e);
    }
  }

  public static toggleMonitor(id: string): EnvironmentalCustomMonitor | null {
    const monitors = this.getMonitors();
    const target = monitors.find((m) => m.id === id);
    if (!target) return null;
    target.status = target.status === 'active' ? 'paused' : 'active';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(monitors));
    } catch (e) {
      console.warn('Failed to update monitor status in localStorage', e);
    }
    return target;
  }

  public static toggleMonitorStatus(id: string): EnvironmentalCustomMonitor | null {
    return this.toggleMonitor(id);
  }
}

export const monitorService = MonitorService;
