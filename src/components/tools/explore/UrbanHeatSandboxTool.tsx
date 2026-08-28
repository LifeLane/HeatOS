import React, { useState } from 'react';
import { Layers, MousePointer2, Trees, Droplets, Paintbrush, RefreshCw, BarChart4 } from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';

export const UrbanHeatSandboxTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const [activeTool, setActiveTool] = useState<'tree' | 'water' | 'roof'>('tree');
  const [interventions, setInterventions] = useState(0);

  const baseTemp = currentLocation.ambientTemp + currentLocation.surfaceHeatAnomaly;
  const currentSimTemp = baseTemp - (interventions * 0.4);

  const handleApplyIntervention = () => {
    setInterventions(prev => Math.min(prev + 1, 10)); // max 10 for demo
  };

  const handleReset = () => {
    setInterventions(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Mitigation Sandbox</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate the thermal impact of urban planning interventions in real-time.
            </p>
          </div>
        </div>
        <SecondaryButton onClick={handleReset} className="text-xs py-2 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Reset Canvas
        </SecondaryButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Intervention Palette */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-slate-400" /> Palette
            </h3>
            
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTool('tree')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border ${activeTool === 'tree' ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-2">
                  <Trees className={`w-4 h-4 ${activeTool === 'tree' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-bold">Urban Canopy</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded shadow-xs">-0.4°C</span>
              </button>

              <button 
                onClick={() => setActiveTool('water')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border ${activeTool === 'water' ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-2">
                  <Droplets className={`w-4 h-4 ${activeTool === 'water' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-bold">Water Feature</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded shadow-xs">-0.6°C</span>
              </button>

              <button 
                onClick={() => setActiveTool('roof')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border ${activeTool === 'roof' ? 'bg-slate-100 border-slate-500 text-slate-900 shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-2">
                  <Layers className={`w-4 h-4 ${activeTool === 'roof' ? 'text-slate-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-bold">Cool Roofs</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded shadow-xs">-0.3°C</span>
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 mt-4 text-center leading-relaxed">
              Select a mitigation asset and apply it to the grid to recalculate local thermal load.
            </p>
          </div>
        </div>

        {/* Sandbox Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs h-full flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Spatial Grid View</span>
              <span className="text-[10px] font-mono bg-white px-2 py-1 rounded border border-slate-200">10m x 10m Resolution</span>
            </div>
            
            <div 
              className="flex-1 bg-slate-100 relative cursor-crosshair overflow-hidden group min-h-[300px]"
              onClick={handleApplyIntervention}
            >
              {/* Thermal Heatmap Gradient Overlay */}
              <div 
                className="absolute inset-0 opacity-40 mix-blend-multiply transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${interventions < 3 ? '#ef4444' : interventions < 7 ? '#f59e0b' : '#3b82f6'}, transparent 70%)`
                }}
              />
              
              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold text-slate-700 flex items-center gap-1.5 border border-slate-200">
                  <MousePointer2 className="w-3.5 h-3.5" /> Click to apply {activeTool}
                </div>
              </div>
              
              {/* Markers for interventions could go here, representing state */}
              {interventions > 0 && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  {interventions} assets deployed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xs text-white">
            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wide flex items-center gap-2">
              <BarChart4 className="w-4 h-4" /> Impact Output
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Original Surface Temp</span>
                <span className="text-xl font-mono font-bold text-slate-300 line-through opacity-70">
                  {formatTemp(baseTemp)}
                </span>
              </div>
              
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[10px] font-mono text-blue-400 uppercase block mb-1">Simulated Surface Temp</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-black text-white">
                    {formatTemp(currentSimTemp)}
                  </span>
                  {interventions > 0 && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-900/40 px-1.5 py-0.5 rounded">
                      -{(interventions * 0.4).toFixed(1)}°C
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-2">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, interventions * 10)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1.5 uppercase">
                  <span>Current State</span>
                  <span>Optimal Cooling</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UrbanHeatSandboxTool;
