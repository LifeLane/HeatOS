import React, { useState } from 'react';
import {
  BellPlus,
  Bell,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wind,
  Droplets,
  Sun,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

interface CustomAlertRule {
  id: string;
  name: string;
  metric: 'temp' | 'surface_anomaly' | 'aqi' | 'uv' | 'humidity' | 'heat_risk';
  operator: '>' | '<' | 'rise_rate';
  threshold: number;
  unit: string;
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'WATCH';
  isActive: boolean;
}

export const AlertBuilderTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();

  const [rules, setRules] = useState<CustomAlertRule[]>([
    {
      id: 'rule-1',
      name: 'Extreme Heatwave Trigger',
      metric: 'temp',
      operator: '>',
      threshold: 38,
      unit: '°C',
      severity: 'CRITICAL',
      isActive: true,
    },
    {
      id: 'rule-2',
      name: 'Severe Urban Heat Island Anomaly',
      metric: 'surface_anomaly',
      operator: '>',
      threshold: 4.0,
      unit: '°C',
      severity: 'HIGH',
      isActive: true,
    },
    {
      id: 'rule-3',
      name: 'Air Pollution Spike Threshold',
      metric: 'aqi',
      operator: '>',
      threshold: 120,
      unit: 'AQI',
      severity: 'HIGH',
      isActive: true,
    },
    {
      id: 'rule-4',
      name: 'Extreme Solar Radiation Flux',
      metric: 'uv',
      operator: '>',
      threshold: 9,
      unit: 'UV',
      severity: 'ELEVATED',
      isActive: true,
    },
  ]);

  const [nameInput, setNameInput] = useState('');
  const [metricInput, setMetricInput] = useState<CustomAlertRule['metric']>('temp');
  const [operatorInput, setOperatorInput] = useState<CustomAlertRule['operator']>('>');
  const [thresholdInput, setThresholdInput] = useState<number>(35);
  const [severityInput, setSeverityInput] = useState<CustomAlertRule['severity']>('HIGH');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const unitMap: Record<CustomAlertRule['metric'], string> = {
      temp: '°C',
      surface_anomaly: '°C',
      aqi: 'AQI',
      uv: 'UV',
      humidity: '%',
      heat_risk: '/100',
    };

    const newRule: CustomAlertRule = {
      id: `rule-${Date.now()}`,
      name: nameInput.trim(),
      metric: metricInput,
      operator: operatorInput,
      threshold: thresholdInput,
      unit: unitMap[metricInput],
      severity: severityInput,
      isActive: true,
    };

    setRules([newRule, ...rules]);
    setNameInput('');
    setShowCreateModal(false);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <BellPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Custom Environmental Alert Builder
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                {rules.filter((r) => r.isActive).length} Active Rules
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Define custom multi-sensor threshold triggers and operational notification boundaries.
            </p>
          </div>
        </div>

        <PrimaryButton
          id="open-create-rule"
          onClick={() => setShowCreateModal(true)}
          className="text-xs py-2.5 px-3.5 whitespace-nowrap self-start sm:self-center flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Alert Rule</span>
        </PrimaryButton>
      </div>

      {/* Create Rule Modal / Form */}
      {showCreateModal && (
        <form
          onSubmit={handleAddRule}
          className="bg-white rounded-2xl border border-blue-200 p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Configure New Alert Trigger</h3>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Rule Name</label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Critical Heat Warning"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Target Parameter</label>
              <select
                value={metricInput}
                onChange={(e) => setMetricInput(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value="temp">Air Temperature (°C)</option>
                <option value="surface_anomaly">Surface Heat Anomaly (°C)</option>
                <option value="aqi">Air Quality Index (AQI)</option>
                <option value="uv">Solar UV Index</option>
                <option value="humidity">Relative Humidity (%)</option>
                <option value="heat_risk">Heat Risk Score (/100)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Condition &amp; Threshold</label>
              <div className="flex gap-1.5">
                <select
                  value={operatorInput}
                  onChange={(e) => setOperatorInput(e.target.value as any)}
                  className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs"
                >
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value="rise_rate">Δ/hr</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(Number(e.target.value))}
                  className="w-2/3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Severity Tier</label>
              <select
                value={severityInput}
                onChange={(e) => setSeverityInput(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="ELEVATED">ELEVATED</option>
                <option value="WATCH">WATCH</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <SecondaryButton onClick={() => setShowCreateModal(false)} className="text-xs py-2 px-3">
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" className="text-xs py-2 px-4">
              Save Alert Rule
            </PrimaryButton>
          </div>
        </form>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((r) => (
          <div
            key={r.id}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => toggleRule(r.id)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  r.isActive ? 'bg-blue-50 text-[#2563EB]' : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Bell className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-xs sm:text-sm font-bold ${r.isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                    {r.name}
                  </h3>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.2 rounded-full border ${
                    r.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    r.severity === 'HIGH' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                    'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {r.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Trigger condition: {r.metric} {r.operator} {r.threshold}{r.unit}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleRule(r.id)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  r.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {r.isActive ? 'Active' : 'Disabled'}
              </button>

              <button
                onClick={() => handleDeleteRule(r.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertBuilderTool;
