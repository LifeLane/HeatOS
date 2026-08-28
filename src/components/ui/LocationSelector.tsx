import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useNavigation } from '../../context/NavigationContext';

interface LocationSelectorProps {
  id?: string;
  className?: string;
  compact?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  id = 'location-selector',
  className = '',
  compact = false,
}) => {
  const { currentLocation } = useLocation();
  const { setIsLocationModalOpen } = useNavigation();

  return (
    <button
      id={id}
      type="button"
      onClick={() => setIsLocationModalOpen(true)}
      aria-label={`Change current location from ${currentLocation.displayName}`}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs group min-h-[34px] ${className}`}
      title="Change Location"
    >
      <MapPin className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0 group-hover:scale-105 transition-transform" />
      <span className={`truncate text-left ${compact ? 'max-w-[110px]' : 'max-w-[160px] sm:max-w-[200px]'}`}>
        {currentLocation.displayName || `${currentLocation.name}, ${currentLocation.country}`}
      </span>
      <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0 group-hover:text-slate-600 transition-colors" />
    </button>
  );
};

export default LocationSelector;
