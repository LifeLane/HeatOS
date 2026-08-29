/**
 * HeatOS: Navigation Module - The Living Weather Globe & NASA Earth Observation Layers
 * Primary Experience: The Map/Globe is the Interface.
 * Full viewport exploration with 3D Globe, FortyGuard Urban Mesh, and real-time NASA Earth Observation API satellite layers.
 */

import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useNavigation } from '../../context/NavigationContext';
import { LivingEnvironmentMap } from '../map/LivingEnvironmentMap';
import { MapDiagnosticModal } from '../map/MapDiagnosticModal';
import { Map, ArrowRight, ChevronDown, ChevronUp, Satellite, Flame, Trees, Activity, Radio, Sparkles } from 'lucide-react';
import { MapLayerKey } from '../../server/map/types';

export const MapView: React.FC = () => {
  const { currentLocation } = useLocation();
  const { setActiveTab, openTool } = useNavigation();
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState<boolean>(false);
  const [isBannerOpen, setIsBannerOpen] = useState<boolean>(false);
  const [activeNasaLayer, setActiveNasaLayer] = useState<MapLayerKey>('heat');
  const [nasaLayerStatus, setNasaLayerStatus] = useState<{
    name: string;
    satellite: string;
    resolution: string;
    freshness: string;
  }>({
    name: 'NASA MODIS Land Surface Temperature (LST)',
    satellite: 'Terra / Aqua MODIS',
    resolution: '1km Thermal IR',
    freshness: 'Real-Time NRT',
  });

  const nasaLayers: Array<{
    key: MapLayerKey;
    label: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    satellite: string;
    resolution: string;
  }> = [
    { key: 'heat', label: 'NASA MODIS LST', subtitle: 'Surface Temp', icon: Flame, satellite: 'Terra/Aqua MODIS', resolution: '1km' },
    { key: 'fire', label: 'NASA FIRMS Fires', subtitle: 'Active Thermal Anomalies', icon: Sparkles, satellite: 'VIIRS / MODIS', resolution: '375m' },
    { key: 'air', label: 'NASA GIBS Aerosol', subtitle: 'Aerosol Optical Depth', icon: Activity, satellite: 'Aura OMI / MODIS', resolution: '3km' },
    { key: 'nature', label: 'Satellite NDVI', subtitle: 'Vegetation & Canopy', icon: Trees, satellite: 'Landsat 8 / Sentinel-2', resolution: '30m' },
    { key: 'heat_risk', label: 'NASA EONET Hazards', subtitle: 'Natural Events & Heatwaves', icon: Radio, satellite: 'EONET Global Mesh', resolution: 'Global' },
  ];

  return (
    <div className="w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] min-h-[600px] flex flex-col relative rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
      
      {/* CoolRoute Navigation & Earth Observation Signals Banner */}
      <div className="bg-white border-b border-slate-200/80 shrink-0">
        <div className="p-3 sm:px-6 flex items-center justify-between gap-3">
          <div 
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setIsBannerOpen(!isBannerOpen)}
          >
            <div className="flex items-center gap-2 text-[#2563EB] font-black tracking-tight text-sm uppercase">
              <Map className="w-4 h-4" />
              <span>THE LIVING MAP / COOLROUTE</span>
            </div>
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-[#2563EB] rounded-full border border-blue-200">
              EARTH OBSERVATION SIGNALS
            </span>
            <button className="p-1 text-slate-500 hover:text-slate-700">
              {isBannerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('tools');
                openTool('cool-route-navigation', 'EXPLORE');
              }}
              className="px-4 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Calculate Cool Route <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        <div className={`overflow-hidden transition-all duration-300 ${isBannerOpen ? 'max-h-[300px] opacity-100 px-6 pb-3' : 'max-h-0 opacity-0 px-6 pb-0'}`}>
          <p className="text-xs text-slate-600 font-medium max-w-3xl leading-relaxed">
            See environmental conditions at street level — and find where heat, exposure, and cooling differ. Environmental conditions vary block by block. HeatOS makes those differences visible. Find the lower-exposure path through the city using FortyGuard microclimate mesh and satellite thermal signals.
          </p>
        </div>
      </div>

      {/* Earth Observation Signals Layer Bar */}
      <div className="bg-slate-900 text-white px-4 py-2 shrink-0 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar border-b border-slate-800">
        <div className="flex items-center gap-2 shrink-0">
          <Satellite className="w-4 h-4 text-sky-400 animate-pulse" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-300">EARTH OBSERVATION SIGNALS:</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {nasaLayers.map((layer) => {
            const Icon = layer.icon;
            const isSelected = activeNasaLayer === layer.key;
            return (
              <button
                key={layer.key}
                onClick={() => {
                  setActiveNasaLayer(layer.key);
                  setNasaLayerStatus({
                    name: layer.label,
                    satellite: layer.satellite,
                    resolution: layer.resolution,
                    freshness: 'Real-Time NRT',
                  });
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md ring-1 ring-sky-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={`Overlay ${layer.label} (${layer.satellite})`}
              >
                <Icon className="w-3.5 h-3.5 text-sky-300" />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The Living Weather Globe Centerpiece */}
      <div className="flex-1 relative min-h-0">
        <LivingEnvironmentMap
          latitude={currentLocation.coordinates.lat}
          longitude={currentLocation.coordinates.lng}
          locationName={currentLocation.name}
          initialLayer={activeNasaLayer}
          onOpenDiagnostics={() => setIsDiagnosticModalOpen(true)}
        />
      </div>

      {/* Map Diagnostics Suite Modal */}
      <MapDiagnosticModal
        isOpen={isDiagnosticModalOpen}
        onClose={() => setIsDiagnosticModalOpen(false)}
      />
    </div>
  );
};

export default MapView;
