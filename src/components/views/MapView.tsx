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
import { Map, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export const MapView: React.FC = () => {
  const { currentLocation } = useLocation();
  const { setActiveTab, openTool } = useNavigation();
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState<boolean>(false);
  const [isBannerOpen, setIsBannerOpen] = useState<boolean>(true);

  return (
    <div className="w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] min-h-[600px] flex flex-col relative rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
      
      {/* CTA Banner: Collapsible on mobile */}
      <div className="bg-white border-b border-slate-200/80 shrink-0">
        <div className="p-3 sm:px-6 flex items-center justify-between cursor-pointer md:cursor-default" onClick={() => setIsBannerOpen(!isBannerOpen)}>
          <div className="flex items-center gap-2 text-blue-700 font-black tracking-tight text-sm uppercase">
            <Map className="w-4 h-4" />
            <span>CoolRoute™ Navigation</span>
          </div>
          <button className="md:hidden p-1 text-slate-500 hover:text-slate-700">
            {isBannerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        <div className={`overflow-hidden transition-all duration-300 md:max-h-[500px] ${isBannerOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-4 sm:px-6 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
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
        </div>
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
