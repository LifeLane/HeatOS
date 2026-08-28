import React, { useState } from 'react';
import {
  BellPlus,
  MapPin,
  Flame,
  Radio,
  Sliders,
  CheckCircle2,
  ShieldAlert,
  Bell,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { monitorService, MonitorSignalType, MonitorConditionType, NotificationPreferenceType } from '../../../services/monitorService';
import { EventSeverity } from '../../../server/events/types';
import PrimaryButton from '../../ui/PrimaryButton';

export const CreateMonitorTool: React.FC = () => {
  const { currentLocation } = useLocation();

  const [name, setName] = useState<string>(`${currentLocation.name} Thermal Watch`);
  const [location, setLocation] = useState<string>(currentLocation.name);
  const [signal, setSignal] = useState<MonitorSignalType>('heat_anomaly');
  const [condition, setCondition] = useState<MonitorConditionType>('above');
  const [threshold, setThreshold] = useState<string>('+3°C');
  const [duration, setDuration] = useState<string>('30 minutes');
  const [severity, setSeverity] = useState<EventSeverity>('HIGH');
  const [notification, setNotification] = useState<NotificationPreferenceType>('banner_sound');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    monitorService.createMonitor({
      name: name || `${location} ${signal}`,
      location,
      latitude: currentLocation.coordinates.lat,
      longitude: currentLocation.coordinates.lng,
      signal,
      signalLabel: signal.replace('_', ' ').toUpperCase(),
      condition,
      conditionLabel: condition.toUpperCase(),
      threshold,
      thresholdUnit: 'unit',
      duration,
      severity,
      notificationPreference: notification,
      notificationLabel: notification.replace('_', ' '),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div id="create-monitor-tool" className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <BellPlus className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Create Environmental Monitor
              </h2>
              <p className="text-xs text-slate-500">
                Define proactive spatial alerts and automated threshold triggers
              </p>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Environmental monitor successfully provisioned and active in surveillance network!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-600">
              Monitor Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="e.g. Lower Manhattan Heat Anomaly"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-600">
              Target Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-600">
              Environmental Signal
            </label>
            <select
              value={signal}
              onChange={(e) => setSignal(e.target.value as MonitorSignalType)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none"
            >
              <option value="heat_anomaly">Heat Anomaly (ΔT)</option>
              <option value="ambient_temp">Ambient Air Temperature</option>
              <option value="air_quality">Air Quality (AQI)</option>
              <option value="wind_speed">Wind Speed & Gusts</option>
              <option value="uv_index">UV Radiation Index</option>
              <option value="nature_pulse">Nature & Vegetation Pulse</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-600">
              Condition &amp; Threshold
            </label>
            <div className="flex gap-2">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as MonitorConditionType)}
                className="w-1/2 p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none"
              >
                <option value="above">Above (&gt;)</option>
                <option value="below">Below (&lt;)</option>
                <option value="rate_increase">Rapid Surge</option>
                <option value="sustained_anomaly">Sustained High</option>
              </select>
              <input
                type="text"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-1/2 p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                placeholder="+3°C or 100 AQI"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-600">
              Duration Window
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none"
            >
              <option value="15 minutes">15 minutes</option>
              <option value="30 minutes">30 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="3 hours">3 hours</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-600">
              Severity Level
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as EventSeverity)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white outline-none"
            >
              <option value="CRITICAL">Critical Hazard</option>
              <option value="HIGH">High Priority</option>
              <option value="ELEVATED">Elevated Watch</option>
              <option value="INFO">Informational Notice</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <BellPlus className="w-4 h-4" />
            <span>CREATE MONITOR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMonitorTool;
