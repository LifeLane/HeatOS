/**
 * HeatOS: Navigation Module - The Living Weather Globe
 * Primary Experience: The Map/Globe is the Interface.
 * Full viewport exploration with 3D Globe, FortyGuard Urban Mesh, and real-time environmental layers.
 */

import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useNavigation } from '../../context/NavigationContext';
import { LivingEnvironmentMap } from '../map/LivingEnvironmentMap';
import { MapDiagnosticModal } from '../map/MapDiagnosticModal';
import { Map, ArrowRight } from 'lucide-react';

export const MapView: React.FC = () => {
  const { currentLocation } = useLocation();
  const { setActiveTab, openTool } = useNavigation();
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState<boolean>(false);

  return (
    <div className="w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] min-h-[600px] flex flex-col relative rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
      
      {/* CTA Banner: Moved out of the map to prevent overlap with search/layer controls */}
      <div className="bg-white border-b border-slate-200/80 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-black tracking-tight text-sm uppercase mb-1">
            <Map className="w-4 h-4" />
            <span>CoolRoute™ Navigation</span>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
            Calculate a pedestrian path that minimizes urban heat island exposure and direct UV load using FortyGuard microclimate mesh data.
          </p>
        </div>
        <button
          onClick={() => {
            setActiveTab('tools');
            openTool('cool-route-navigation', 'EXPLORE');
          }}
          className="shrink-0 w-full sm:w-auto px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          Calculate Route <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* The Living Weather Globe Centerpiece */}
      <div className="flex-1 relative min-h-0">
        <LivingEnvironmentMap
          latitude={currentLocation.coordinates.lat}
          longitude={currentLocation.coordinates.lng}
          locationName={currentLocation.name}
          initialLayer="heat"
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
