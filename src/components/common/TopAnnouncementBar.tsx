import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  GitBranch,
  Github,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Cpu,
  ShieldCheck,
  ExternalLink,
  Info
} from 'lucide-react';

interface TopAnnouncementBarProps {
  className?: string;
}

export const TopAnnouncementBar: React.FC<TopAnnouncementBarProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand();
    }
  };

  return (
    <div
      id="heatos-top-announcement-bar"
      className={`sticky top-0 z-50 w-full bg-slate-950 text-slate-100 border-b border-slate-800/90 shadow-md backdrop-blur-md transition-colors ${className}`}
    >
      {/* Primary Compact Bar (Clickable) */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={toggleExpand}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono select-none cursor-pointer hover:bg-slate-900/80 transition-colors gap-2"
        title={isExpanded ? 'Click to collapse message' : 'Click to expand details'}
      >
        {/* Left: Engine Status Indicator + Headline Badges */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
          {/* Active Live Radar Pulse */}
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>

          {/* Collapsed Headline Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap">
              LIVE SYSTEM
            </span>
            <span className="text-slate-600 hidden xs:inline">•</span>
            <span className="text-slate-300 font-medium tracking-wide whitespace-nowrap text-[11px] sm:text-[12px]">
              Environmental intelligence operating layer
            </span>
          </div>
        </div>

        {/* Right: Action Links (Icons Only) + Expand Chevron */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Portfolio Link (Globe Icon) */}
          <a
            id="announcement-link-portfolio"
            href="https://whoami.worldoftexts.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Author Portfolio"
            title="Author Portfolio (https://whoami.worldoftexts.com)"
            className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-center"
          >
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 hover:text-white" />
          </a>

          {/* HeatOS Repository Link (GitBranch Icon) */}
          <a
            id="announcement-link-repository"
            href="https://github.com/LifeLane/HeatOS"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="HeatOS GitHub Repository"
            title="HeatOS Repository (https://github.com/LifeLane/HeatOS)"
            className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-center"
          >
            <GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 hover:text-blue-300" />
          </a>

          {/* GitHub Profile Link (GitHub Icon) */}
          <a
            id="announcement-link-github"
            href="https://github.com/LifeLane"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LifeLane GitHub Profile"
            title="GitHub Profile (https://github.com/LifeLane)"
            className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-center"
          >
            <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 hover:text-white" />
          </a>

          {/* Divider */}
          <div className="w-[1px] h-3.5 bg-slate-800 mx-0.5" />

          {/* Expand/Collapse Toggle Button */}
          <button
            id="announcement-toggle-expand"
            type="button"
            onClick={toggleExpand}
            aria-label={isExpanded ? 'Collapse announcement' : 'Expand announcement'}
            className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="text-[10px] uppercase font-mono tracking-wider hidden md:inline text-slate-400">
              {isExpanded ? 'LESS' : 'DETAILS'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-300" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Drawer Details (Animated) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-slate-800/80 bg-slate-950/98 px-3 sm:px-6 py-3.5 sm:py-4.5"
          >
            <div className="max-w-7xl mx-auto space-y-3">
              {/* Primary Expanded Statement */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="space-y-2 flex-1">
                  <h4 className="text-sm font-bold text-white tracking-wide">HEATOS</h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    A working environmental intelligence system that synthesizes real-world environmental signals into a contextual environmental state.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    Built as a solo project with 100+ internal files and 11+ connected APIs/providers.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans italic">
                    Some external sources may occasionally be unavailable due to provider limits or resource constraints. HeatOS is designed to degrade gracefully and surface data availability rather than silently fabricate certainty.
                  </p>
                </div>
              </div>

              {/* Engineering Highlights / Architecture Grounding */}
              <div className="pt-2 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/70">
                  <div className="text-slate-500 uppercase text-[9px] font-bold">Codebase Scale</div>
                  <div className="text-slate-200 font-bold mt-0.5">100+ Modular Files</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/70">
                  <div className="text-slate-500 uppercase text-[9px] font-bold">Core IoT & Telemetry</div>
                  <div className="text-emerald-400 font-bold mt-0.5">FortyGuard API</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/70">
                  <div className="text-slate-500 uppercase text-[9px] font-bold">Data Convergence</div>
                  <div className="text-blue-400 font-bold mt-0.5">10+ Multi-Agency Feeds</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/70">
                  <div className="text-slate-500 uppercase text-[9px] font-bold">Transparency</div>
                  <div className="text-slate-200 font-bold mt-0.5">Explicit Live/Fallback State</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopAnnouncementBar;
