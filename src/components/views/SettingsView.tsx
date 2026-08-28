import React, { useState } from 'react';
import {
  Key,
  Shield,
  Radio,
  Server,
  Globe,
  Sliders,
  Bell,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
} from 'lucide-react';
import { useFortyGuard } from '../../context/FortyGuardContext';
import { useLocation } from '../../context/LocationContext';
import PageContainer from '../ui/PageContainer';
import Card from '../ui/Card';
import Section from '../ui/Section';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';
import { FadeIn } from '../motion/MotionPrimitives';

export const SettingsView: React.FC = () => {
  const { apiKey, setApiKey, autoRefreshInterval, setAutoRefreshInterval, isConnected, reconnect } = useFortyGuard();
  const { unit, setUnit } = useLocation();

  const [inputKey, setInputKey] = useState<string>(apiKey);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [telemetryFrequency, setTelemetryFrequency] = useState<number>(autoRefreshInterval);
  const [thermalAlertThreshold, setThermalAlertThreshold] = useState<number>(38.0);
  const [enablePings, setEnablePings] = useState<boolean>(true);
  const [highDensityMode, setHighDensityMode] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

  const handleExportData = () => {
    setExporting(true);
    try {
      const rows = [
        ['Timestamp', 'Heat Index (°C)', 'Air Quality (AQI)', 'Humidity (%)'],
        [new Date(Date.now() - 3600000).toISOString(), '31.2', '45', '60'],
        [new Date(Date.now() - 1800000).toISOString(), '31.8', '47', '58'],
        [new Date(Date.now()).toISOString(), '32.5', '42', '56'],
      ];
      const csvContent = rows.map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `environmental_data_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  };


  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey);
    setAutoRefreshInterval(telemetryFrequency);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <PageContainer maxWidth="5xl">
      <FadeIn>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            System &amp; Mesh Gateway Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage FortyGuard API credentials, telemetry polling intervals, and alert thresholds.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* API Gateway & Authentication */}
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">FortyGuard API Gateway</h2>
                <p className="text-xs text-slate-500">Configure your secure API key for FortyGuard telemetry streaming</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="settings-api-key" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  API Key
                </label>
                <div className="relative">
                  <input
                    id="settings-api-key"
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="fg_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-mono placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all shadow-xs"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      SECURE
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Telemetry data is synced over high-throughput encrypted WebSockets.
                </p>
              </div>
            </div>
          </Card>

          {/* Preferences & Measurement Units */}
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Display &amp; Telemetry Preferences</h2>
                <p className="text-xs text-slate-500">Configure temperature unit and streaming density</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Unit Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Temperature Units
                </label>
                <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50">
                  <button
                    type="button"
                    id="unit-c-btn"
                    onClick={() => setUnit('C')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      unit === 'C' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Celsius (°C)
                  </button>
                  <button
                    type="button"
                    id="unit-f-btn"
                    onClick={() => setUnit('F')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      unit === 'F' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fahrenheit (°F)
                  </button>
                </div>
              </div>

              {/* Refresh Interval */}
              <div>
                <label htmlFor="refresh-interval-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sensor Polling Cadence
                </label>
                <select
                  id="refresh-interval-select"
                  value={telemetryFrequency}
                  onChange={(e) => setTelemetryFrequency(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all shadow-xs"
                >
                  <option value={2000}>2 seconds (High Frequency)</option>
                  <option value={5000}>5 seconds (Default Balanced)</option>
                  <option value={10000}>10 seconds (Low Bandwidth)</option>
                  <option value={30000}>30 seconds (Eco Mode)</option>
                </select>
              </div>
            </div>
          </Card>


          {/* Alerts & Notifications */}
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Alerts &amp; Notifications</h2>
                <p className="text-xs text-slate-500">Configure environmental push notifications</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Push Notifications</label>
                <p className="text-xs text-slate-500">Receive browser alerts for critical environmental events</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushNotifications} onChange={() => {
                  if (!pushNotifications) {
                    if ('Notification' in window) {
                      Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                          setPushNotifications(true);
                          new Notification('FortyGuard Alerts Enabled', { body: 'You will now receive critical environmental alerts.' });
                        }
                      });
                    } else {
                      setPushNotifications(true);
                    }
                  } else {
                    setPushNotifications(false);
                  }
                }} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563EB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
              </label>
            </div>
          </Card>

          {/* Data Management */}
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Data Management</h2>
                <p className="text-xs text-slate-500">Export and manage your local environmental data</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Export Telemetry Data</label>
                <p className="text-xs text-slate-500">Download historical Heat Index, AQI, and Humidity (CSV)</p>
              </div>
              <button type="button" onClick={handleExportData} disabled={exporting} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                <Save className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </Card>

          {/* Save Action Bar */}

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Settings successfully saved and applied!
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Changes apply immediately to live mesh telemetry.
              </span>
            )}

            <PrimaryButton
              id="settings-save-btn"
              type="submit"
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Configuration
            </PrimaryButton>
          </div>
        </form>
      </FadeIn>
    </PageContainer>
  );
};

export default SettingsView;
