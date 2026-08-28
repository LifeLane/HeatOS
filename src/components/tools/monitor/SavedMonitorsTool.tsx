import React, { useState, useEffect } from 'react';
import {
  Radio,
  Bell,
  Trash2,
  Play,
  Pause,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { monitorService, EnvironmentalCustomMonitor } from '../../../services/monitorService';

export const SavedMonitorsTool: React.FC = () => {
  const [monitors, setMonitors] = useState<EnvironmentalCustomMonitor[]>([]);

  const loadMonitors = () => {
    setMonitors(monitorService.getMonitors());
  };

  useEffect(() => {
    loadMonitors();
  }, []);

  const handleToggle = (id: string) => {
    monitorService.toggleMonitorStatus(id);
    loadMonitors();
  };

  const handleDelete = (id: string) => {
    monitorService.deleteMonitor(id);
    loadMonitors();
  };

  return (
    <div id="saved-monitors-tool" className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <Radio className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Active & Saved Environmental Monitors
              </h2>
              <p className="text-xs text-slate-500">
                Persistent spatial trigger network monitoring your defined bounds
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {monitors.length} Active Rules
          </span>
        </div>

        {monitors.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-700">No active monitors configured</p>
            <p className="text-xs text-slate-500">
              Create a monitor to track temperature, heat risk, air quality, or custom thresholds.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {monitors.map((m) => (
              <div key={m.id} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{m.name}</span>
                    <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded ${
                      m.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {m.status.toUpperCase()}
                    </span>
                    <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      {m.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono"><MapPin className="w-3 h-3 text-slate-400" />{m.location}</span>
                    <span>•</span>
                    <span className="font-mono">Signal: {m.signalLabel} {m.conditionLabel} {m.threshold}</span>
                    <span>•</span>
                    <span className="font-mono">Duration: {m.duration}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(m.id)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#2563EB] border border-slate-200 transition-colors cursor-pointer"
                    title={m.status === 'active' ? 'Pause monitor' : 'Resume monitor'}
                  >
                    {m.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                    title="Delete monitor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedMonitorsTool;
