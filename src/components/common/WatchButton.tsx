/**
 * HeatOS Phase 9: Watch / Monitor Place CTA Button
 * 
 * Clean, high-contrast button allowing 1-click monitoring toggle with visual feedback.
 */

import React from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useMonitoring } from '../../context/MonitoringContext';
import { useLocation } from '../../context/LocationContext';

interface WatchButtonProps {
  locationName?: string;
  variant?: 'default' | 'compact' | 'header' | 'card';
  className?: string;
}

export const WatchButton: React.FC<WatchButtonProps> = ({
  locationName,
  variant = 'default',
  className = '',
}) => {
  const { currentLocation } = useLocation();
  const { isPlaceWatched, toggleWatchCurrentLocation, addPlaceToWatch, removePlaceFromWatch, isEvaluating } = useMonitoring();

  const targetName = locationName || currentLocation.displayName;
  const isWatched = isPlaceWatched(targetName);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (locationName && locationName !== currentLocation.displayName) {
      if (isWatched) {
        removePlaceFromWatch(locationName);
      } else {
        await addPlaceToWatch({
          name: locationName,
          category: 'site',
          organization: 'HeatOS Workspace',
          latitude: currentLocation.coordinates.lat,
          longitude: currentLocation.coordinates.lng,
        });
      }
    } else {
      await toggleWatchCurrentLocation();
    }
  };

  if (variant === 'header') {
    return (
      <button
        id="btn-header-watch-place"
        onClick={handleClick}
        disabled={isEvaluating}
        title={isWatched ? `Remove ${targetName} from Watchlist` : `Monitor ${targetName} in Watchlist`}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm ${
          isWatched
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
            : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700 hover:border-emerald-500/50 hover:text-emerald-400'
        } ${className}`}
      >
        {isEvaluating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isWatched ? (
          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
        )}
        <span className="hidden sm:inline">
          {isWatched ? 'MONITORING' : 'MONITOR THIS PLACE'}
        </span>
        <span className="sm:hidden">
          {isWatched ? 'WATCHED' : 'MONITOR'}
        </span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        id={`btn-compact-watch-${targetName.replace(/\s+/g, '-').toLowerCase()}`}
        onClick={handleClick}
        disabled={isEvaluating}
        title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
        className={`p-1.5 rounded-md transition-colors ${
          isWatched
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/60 hover:text-emerald-400 hover:border-zinc-600'
        } ${className}`}
      >
        {isWatched ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      id={`btn-watch-${targetName.replace(/\s+/g, '-').toLowerCase()}`}
      onClick={handleClick}
      disabled={isEvaluating}
      className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
        isWatched
          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
          : 'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-emerald-500/40 hover:text-white hover:bg-zinc-750'
      } ${className}`}
    >
      {isEvaluating ? (
        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
      ) : isWatched ? (
        <BookmarkCheck className="w-4 h-4 text-emerald-400" />
      ) : (
        <Bookmark className="w-4 h-4 text-zinc-400" />
      )}
      <span>{isWatched ? 'Watched in My Places' : 'Monitor This Place'}</span>
    </button>
  );
};
