import React from 'react';
import {
  Compass,
  Layers,
  MapPin,
  Flame,
  Wind,
  Droplets,
  Sun,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useNavigation } from '../../../context/NavigationContext';
import { useLocation } from '../../../context/LocationContext';

export const LivingMapTool: React.FC = () => {
  const { setActiveTab } = useNavigation();
  const { currentLocation } = useLocation();

  return (
    <div id="living-map-tool" className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
                <Compass className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Living Environmental Map & Spatial Layers
                </h2>
                <p className="text-xs text-slate-500">
                  Interactive multi-layer spatial visualization with high-resolution thermal anomaly meshes
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('navigation')}
            className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Open Living Map View</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Spatial Layers Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-600">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-900">Thermal Heat Risk</span>
            </div>
            <p className="text-xs text-slate-500">FortyGuard microclimate anomaly grid mapping surface temperature hotspots.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <Wind className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-900">Air Quality & AQI</span>
            </div>
            <p className="text-xs text-slate-500">Continuous particulate and photochemical ozone dispersion boundaries.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Droplets className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-900">Precipitation & Water</span>
            </div>
            <p className="text-xs text-slate-500">Hydrological stress, rainfall radar sweeps, and humidity gradients.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-purple-600">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-900">Environmental Pulse</span>
            </div>
            <p className="text-xs text-slate-500">6-dimension composite environmental resilience scoring across city districts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivingMapTool;
