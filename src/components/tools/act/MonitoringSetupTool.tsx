import React, { useState } from 'react';
import {
  Radio,
  MapPin,
  Clock,
  ShieldAlert,
  Bell,
  CheckCircle2,
  Bookmark,
  Plus,
  Trash2,
  Compass,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';
import { useMonitoring } from '../../../context/MonitoringContext';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import PrimaryButton from '../../ui/PrimaryButton';
import SecondaryButton from '../../ui/SecondaryButton';
import { WatchButton } from '../../common/WatchButton';

export const MonitoringSetupTool: React.FC = () => {
  const { currentLocation } = useLocation();
  const { watchlist, isPlaceWatched, addPlaceToWatch, removePlaceFromWatch } = useMonitoring();

  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [cadence, setCadence] = useState<'5m' | '15m' | '1h' | 'daily'>('15m');
  const [notifyThermal, setNotifyThermal] = useState(true);
  const [notifyAir, setNotifyAir] = useState(true);

  const isWatched = isPlaceWatched(currentLocation.displayName) || isPlaceWatched(currentLocation.name);

  const handleToggleWatch = async () => {
    if (isWatched) {
      removePlaceFromWatch(currentLocation.displayName);
    } else {
      await addPlaceToWatch({
        id: currentLocation.id,
        name: currentLocation.displayName,
        stateCode: currentLocation.state,
        countryCode: currentLocation.country,
        latitude: currentLocation.coordinates.lat,
        longitude: currentLocation.coordinates.lng,
        category: 'site',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] flex-shrink-0">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Continuous Environmental Monitoring Setup
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-50 text-[#2563EB] rounded-full border border-blue-200">
                {watchlist.length} Watched Sites
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure persistent telemetry ingestion, geofence radius, and automated threshold alerts.
            </p>
          </div>
        </div>

        <WatchButton
          location={currentLocation}
          className="py-2.5 px-4 text-xs font-bold shadow-xs self-start sm:self-center"
        />
      </div>

      {/* Configuration Matrix for Active Place */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900">
          Telemetry &amp; Notification Parameters for <span className="text-[#2563EB]">{currentLocation.displayName}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* 1. Geofence Radius */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="font-bold text-slate-700 block">Surveillance Radius</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 5, 10, 25].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusKm(r)}
                  className={`py-1.5 rounded-lg font-mono font-bold transition-colors cursor-pointer ${
                    radiusKm === r
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Spatial radius around coordinates for incident correlation.
            </p>
          </div>

          {/* 2. Update Cadence */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="font-bold text-slate-700 block">Telemetry Sync Cadence</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['5m', '15m', '1h', 'daily'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCadence(c)}
                  className={`py-1.5 rounded-lg font-mono font-bold transition-colors cursor-pointer ${
                    cadence === c
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              FortyGuard high-resolution thermal spline sampling frequency.
            </p>
          </div>

          {/* 3. Alert Subscriptions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="font-bold text-slate-700 block">Active Alert Channels</label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyThermal}
                  onChange={(e) => setNotifyThermal(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                <span className="text-slate-700">Thermal &amp; UHI Anomaly Spikes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyAir}
                  onChange={(e) => setNotifyAir(e.target.checked)}
                  className="rounded text-[#2563EB]"
                />
                <span className="text-slate-700">AQI &amp; Particulate Degradation</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Active Watchlist Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Currently Monitored Portfolio ({watchlist.length} Location{watchlist.length === 1 ? '' : 's'})
        </h3>

        {watchlist.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-50 text-slate-500 text-xs">
            <Bookmark className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
            No locations in your active monitoring watchlist yet. Click "Monitor this Place" above to add.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {watchlist.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Lat {item.latitude.toFixed(2)}°, Lng {item.longitude.toFixed(2)}°
                  </span>
                </div>

                <button
                  onClick={() => removePlaceFromWatch(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringSetupTool;
