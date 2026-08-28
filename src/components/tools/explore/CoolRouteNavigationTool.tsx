import React, { useState } from 'react';
import { Map, Navigation, Thermometer, ArrowRight, ShieldCheck, Sun, Trees, Footprints } from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useAIAnalyst } from '../../../context/AIAnalystContext';
import PrimaryButton from '../../ui/PrimaryButton';

export const CoolRouteNavigationTool: React.FC = () => {
  const { currentLocation, formatTemp } = useLocation();
  const { openAIWithContext } = useAIAnalyst();
  const [routeCalculated, setRouteCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculateRoute = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setRouteCalculated(true);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">CoolRoute™ Navigation</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Thermal-optimized pedestrian routing using FortyGuard UHI anomaly grids.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Route Parameters</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Origin</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <Footprints className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900">Central Transit Station</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Destination</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <Map className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-900">Innovation District HQ</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 mt-2">
                <label className="text-xs font-bold text-slate-500 mb-2 block">Optimization Priority</label>
                <select className="w-full bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 outline-none focus:border-blue-500">
                  <option>Maximum Shade (Thermal Load)</option>
                  <option>Balanced (Time + Thermal)</option>
                  <option>Fastest Path</option>
                </select>
              </div>

              <PrimaryButton 
                onClick={handleCalculateRoute} 
                className="w-full mt-4 justify-center"
                disabled={isCalculating}
              >
                {isCalculating ? 'Computing Thermal Path...' : 'Calculate CoolRoute'}
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {routeCalculated ? (
            <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">
                Route Optimized
              </div>
              
              <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wide">Route Comparison</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Standard Route */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Standard Route</span>
                    <span className="text-xs font-mono font-bold text-slate-600">12 mins</span>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Avg Exposure</span>
                      <span className="text-sm font-mono font-bold text-rose-600">{formatTemp(currentLocation.ambientTemp + 2.5)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Direct Sun</span>
                      <span className="text-sm font-mono font-bold text-slate-800">85%</span>
                    </div>
                  </div>
                </div>

                {/* CoolRoute */}
                <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> CoolRoute
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800">15 mins</span>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-800">Avg Exposure</span>
                      <span className="text-sm font-mono font-bold text-emerald-600">{formatTemp(currentLocation.ambientTemp - 1.2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-800">Direct Sun</span>
                      <span className="text-sm font-mono font-bold text-emerald-700">30%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <Sun className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Thermal Impact Summary</h4>
                  <p className="text-xs text-blue-800/80 leading-relaxed">
                    By taking a 3-minute detour through the tree-lined avenues of the adjacent block, pedestrian thermal exposure is reduced by <strong>3.7°C</strong>. This route leverages building shadows and 55% higher canopy cover.
                  </p>
                  <button 
                    onClick={() => openAIWithContext(`Explain the health benefits of choosing a route that is 3.7C cooler for a 15 minute walk in ${currentLocation.displayName}.`)}
                    className="mt-3 text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    Ask AI Analyst for Health Impact
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-10 h-full flex flex-col items-center justify-center text-center">
              <Navigation className="w-10 h-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Awaiting Route Parameters</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Enter your destination to calculate a pedestrian path that minimizes urban heat island exposure using FortyGuard micro-climate grids.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoolRouteNavigationTool;
