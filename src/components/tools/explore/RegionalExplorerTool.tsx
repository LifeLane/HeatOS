import React from 'react';
import {
  Compass,
  MapPin,
  Lock,
  Sparkles,
  Globe,
} from 'lucide-react';
import { useLocation } from '../../../context/LocationContext';

export const RegionalExplorerTool: React.FC = () => {
  const { currentLocation } = useLocation();

  return (
    <div id="regional-explorer-tool" className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <Globe className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            COMING SOON
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 pt-2">
            Regional Macro-Climate Explorer
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Cross-county and state-wide synoptic environmental modeling, multi-basin watershed tracking, and macro-scale thermal atmospheric river analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegionalExplorerTool;
