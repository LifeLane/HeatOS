/**
 * HeatOS: Create Environmental Monitor Modal
 * 
 * Allows defining proactive spatial thresholds:
 * Location, Signal, Condition, Threshold, Duration, Severity, and Notification preference.
 */

import React, { useState } from 'react';
import {
  X,
  Bell,
  MapPin,
  Flame,
  Wind,
  Droplets,
  Sun,
  Activity,
  Sliders,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  MonitorSignalType,
  MonitorConditionType,
  NotificationPreferenceType,
  EnvironmentalCustomMonitor,
} from '../../services/monitorService';
import { EventSeverity } from '../../server/events/types';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';

interface CreateMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (monitor: EnvironmentalCustomMonitor) => void;
  defaultLocationName?: string;
  defaultCoordinates?: { lat: number; lng: number };
}

export const CreateMonitorModal: React.FC<CreateMonitorModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  defaultLocationName = 'Lower Manhattan',
  defaultCoordinates,
}) => {
  const [location, setLocation] = useState<string>(defaultLocationName);
  const [signal, setSignal] = useState<MonitorSignalType>('heat_anomaly');
  const [condition, setCondition] = useState<MonitorConditionType>('above');
  const [threshold, setThreshold] = useState<string>('+3');
  const [duration, setDuration] = useState<string>('30 minutes');
  const [severity, setSeverity] = useState<EventSeverity>('HIGH');
  const [notificationPreference, setNotificationPreference] =
    useState<NotificationPreferenceType>('banner_sound');
  const [monitorName, setMonitorName] = useState<string>('');

  if (!isOpen) return null;

  const signalConfigs: Record<
    MonitorSignalType,
    { label: string; unit: string; icon: React.ReactNode; defaultThreshold: string; presets: string[] }
  > = {
    heat_anomaly: {
      label: 'Heat anomaly',
      unit: '°C anomaly',
      icon: <Flame className="w-4 h-4 text-orange-600" />,
      defaultThreshold: '+3',
      presets: ['+2', '+3', '+4', '+5'],
    },
    ambient_temp: {
      label: 'Ambient Temperature',
      unit: '°C',
      icon: <Flame className="w-4 h-4 text-rose-600" />,
      defaultThreshold: '35',
      presets: ['32', '35', '38', '40'],
    },
    apparent_temp: {
      label: 'Apparent Temp (Feels Like)',
      unit: '°C',
      icon: <Sun className="w-4 h-4 text-amber-600" />,
      defaultThreshold: '38',
      presets: ['34', '38', '42', '45'],
    },
    air_quality: {
      label: 'Air Quality (AQI)',
      unit: 'AQI',
      icon: <Wind className="w-4 h-4 text-teal-600" />,
      defaultThreshold: '100',
      presets: ['50', '100', '150', '200'],
    },
    wind_speed: {
      label: 'Wind Speed',
      unit: 'km/h',
      icon: <Wind className="w-4 h-4 text-sky-600" />,
      defaultThreshold: '45',
      presets: ['30', '45', '60', '75'],
    },
    precipitation: {
      label: 'Precipitation',
      unit: 'mm/h',
      icon: <Droplets className="w-4 h-4 text-blue-600" />,
      defaultThreshold: '15',
      presets: ['5', '15', '25', '50'],
    },
    uv_index: {
      label: 'Solar UV Index',
      unit: 'UV',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      defaultThreshold: '8',
      presets: ['6', '8', '10', '11+'],
    },
    nature_pulse: {
      label: 'Nature Pulse Score',
      unit: 'Score / 100',
      icon: <Activity className="w-4 h-4 text-emerald-600" />,
      defaultThreshold: '50',
      presets: ['40', '50', '60', '75'],
    },
  };

  const handleSelectSignal = (s: MonitorSignalType) => {
    setSignal(s);
    setThreshold(signalConfigs[s].defaultThreshold);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSignalConfig = signalConfigs[signal];
    const computedName =
      monitorName.trim() ||
      `${location} ${selectedSignalConfig.label} (${condition === 'above' ? '>' : '<'} ${threshold}${
        selectedSignalConfig.unit.includes('°C') ? '°C' : ` ${selectedSignalConfig.unit}`
      })`;

    const conditionLabels: Record<MonitorConditionType, string> = {
      above: 'Above',
      below: 'Below',
      rate_increase: 'Rate of Increase',
      sustained_anomaly: 'Sustained Anomaly',
    };

    const notificationLabels: Record<NotificationPreferenceType, string> = {
      banner_sound: 'In-App Banner & Audio Cue',
      push_notification: 'Mobile Push Notification',
      webhook: 'Real-time Webhook / API Trigger',
      email_digest: 'Daily Email Digest',
    };

    onCreated({
      id: '',
      name: computedName,
      location: location.trim() || 'Lower Manhattan',
      latitude: defaultCoordinates?.lat,
      longitude: defaultCoordinates?.lng,
      signal,
      signalLabel: selectedSignalConfig.label,
      condition,
      conditionLabel: conditionLabels[condition],
      threshold: threshold.startsWith('+') || threshold.startsWith('-') ? threshold : threshold,
      thresholdUnit: selectedSignalConfig.unit,
      duration,
      severity,
      notificationPreference,
      notificationLabel: notificationLabels[notificationPreference],
      status: 'active',
      createdAt: new Date().toISOString(),
      currentObservedValue: signal === 'heat_anomaly' ? '+2.1°C' : `${threshold}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100 shadow-2xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Create Environmental Monitor</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Define deterministic conditions to trigger proactive alerts across the mesh.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleCreate} className="p-5 sm:p-6 space-y-5 text-xs text-slate-700">
          {/* 1. Location */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location</span>
            </label>
            <input
              id="monitor-input-location"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lower Manhattan, Financial District, Central Park"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] text-xs font-semibold text-slate-900 transition-all"
            />
            {/* Quick location chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Lower Manhattan', 'Midtown Core', 'Williamsburg Waterfront', 'Financial District'].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    location === loc
                      ? 'bg-blue-50 text-[#2563EB] font-bold border border-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Signal */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>Signal</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(signalConfigs) as MonitorSignalType[]).map((sigKey) => {
                const config = signalConfigs[sigKey];
                const isSelected = signal === sigKey;
                return (
                  <button
                    key={sigKey}
                    type="button"
                    onClick={() => handleSelectSignal(sigKey)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#2563EB] text-[#2563EB] shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      {config.icon}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />}
                    </div>
                    <span className="text-[11px] font-bold leading-tight">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Condition & Threshold (Combined Row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Condition */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Condition</span>
              </label>
              <select
                id="monitor-select-condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as MonitorConditionType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#2563EB]"
              >
                <option value="above">Above (&gt;)</option>
                <option value="below">Below (&lt;)</option>
                <option value="rate_increase">Rate of Increase</option>
                <option value="sustained_anomaly">Sustained Anomaly</option>
              </select>
            </div>

            {/* Threshold */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Threshold</span>
                <span className="text-[10px] font-mono text-slate-500 lowercase font-normal">
                  Unit: {signalConfigs[signal].unit}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="monitor-input-threshold"
                  type="text"
                  required
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder={signalConfigs[signal].defaultThreshold}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black font-mono text-slate-900 focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              {/* Presets */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {signalConfigs[signal].presets.map((pre) => (
                  <button
                    key={pre}
                    type="button"
                    onClick={() => setThreshold(pre)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      threshold === pre
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Duration & Severity (Combined Row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Duration */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Duration</span>
              </label>
              <select
                id="monitor-select-duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#2563EB]"
              >
                <option value="Immediate (0m)">Immediate (0m)</option>
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="4 hours">4 hours</option>
              </select>
            </div>

            {/* Severity */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>Severity</span>
              </label>
              <select
                id="monitor-select-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as EventSeverity)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-900 focus:outline-none focus:border-[#2563EB]"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="ELEVATED">Elevated</option>
                <option value="WATCH">Watch</option>
                <option value="INFO">Info</option>
              </select>
            </div>
          </div>

          {/* 5. Notification Preference */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span>Notification Preference</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  id: 'banner_sound',
                  title: 'In-App Banner & Audio',
                  desc: 'Immediate audio cue and top screen alert',
                },
                {
                  id: 'push_notification',
                  title: 'Push Notification',
                  desc: 'Mobile lockscreen & web push alert',
                },
                {
                  id: 'webhook',
                  title: 'Real-time Webhook / API',
                  desc: 'Enterprise POST payload dispatch',
                },
                {
                  id: 'email_digest',
                  title: 'Daily Email Digest',
                  desc: 'Summarized environmental report',
                },
              ].map((notif) => {
                const isSelected = notificationPreference === notif.id;
                return (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => setNotificationPreference(notif.id as NotificationPreferenceType)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#2563EB] text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{notif.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Summary Callout */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Monitor Logic Preview
            </span>
            <p className="text-xs font-medium text-slate-800">
              When <strong className="text-slate-950">{signalConfigs[signal].label}</strong> in{' '}
              <strong className="text-slate-950">{location || 'Lower Manhattan'}</strong> is{' '}
              <strong className="text-slate-950">{condition} {threshold}{signalConfigs[signal].unit.includes('°C') ? '°C' : ` ${signalConfigs[signal].unit}`}</strong> for{' '}
              <strong className="text-slate-950">{duration}</strong>, generate a{' '}
              <strong className="text-rose-600 font-bold">{severity}</strong> alert via{' '}
              <strong className="text-slate-950">{notificationPreference.replace(/_/g, ' ')}</strong>.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <SecondaryButton type="button" onClick={onClose} size="md">
              Cancel
            </SecondaryButton>
            <button
              id="btn-submit-create-monitor"
              type="submit"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>CREATE MONITOR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMonitorModal;
