/**
 * HeatOS: The Living Weather Globe - Location Search & Fly-To Flyout
 * Compact search bar supporting instant lookup, autocompletion, and smooth camera fly-to.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Globe, Navigation as NavIcon } from 'lucide-react';
import { GLOBAL_CITY_NODES, GlobeCityNode } from './GlobeCanvas';

interface MapSearchFlyoutProps {
  currentLocationName: string;
  onSelectLocation: (lat: number, lng: number, cityNode?: GlobeCityNode) => void;
}

export const MapSearchFlyout: React.FC<MapSearchFlyoutProps> = ({
  currentLocationName,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = query.trim()
    ? GLOBAL_CITY_NODES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.country.toLowerCase().includes(query.toLowerCase())
      )
    : GLOBAL_CITY_NODES.slice(0, 6);

  const handleSelect = (city: GlobeCityNode) => {
    onSelectLocation(city.lat, city.lng, city);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative select-none z-20">
      {/* Search Input Box */}
      <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl px-3 py-1.5 shadow-xl text-slate-100 min-w-[220px] sm:min-w-[280px]">
        <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={currentLocationName || 'Fly to city or coordinate...'}
          className="bg-transparent border-none outline-hidden text-xs sm:text-sm text-slate-100 placeholder-slate-400 w-full min-w-0"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Flyout Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-full sm:w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden py-1.5 max-h-72 overflow-y-auto no-scrollbar">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {query.trim() ? 'Search Results' : 'Recommended Flight Destinations'}
          </div>
          {filteredCities.length > 0 ? (
            filteredCities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelect(city)}
                className="w-full px-3.5 py-2 flex items-center justify-between text-left hover:bg-slate-800/70 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      city.status === 'critical'
                        ? 'bg-rose-500'
                        : city.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                      {city.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {city.country} • {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {city.tempC.toFixed(0)}°C
                  </span>
                  <NavIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
              </button>
            ))
          ) : (
            <div className="px-3.5 py-4 text-center text-xs text-slate-400">
              No matching locations found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
