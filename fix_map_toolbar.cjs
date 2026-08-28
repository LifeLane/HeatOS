const fs = require('fs');
let code = fs.readFileSync('src/components/map/MapToolbar.tsx', 'utf8');

const targetImports = `import {
  ZoomIn,
  ZoomOut,
  Navigation,
  Compass,
  Maximize2,
  Minimize2,
  Layers,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  MapPin,
} from 'lucide-react';`;

const replacementImports = `import {
  ZoomIn,
  ZoomOut,
  Navigation,
  Compass,
  Maximize2,
  Minimize2,
  Layers,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Settings2
} from 'lucide-react';
import { useState, useEffect } from 'react';`;

code = code.replace(targetImports, replacementImports);

const targetComponent = `export const MapToolbar: React.FC<MapToolbarProps> = ({`;

const replacementComponent = `export const MapToolbar: React.FC<MapToolbarProps> = ({`;

code = code.replace(targetComponent, replacementComponent);

const targetReturn = `return (
    <div
      id="compact-map-floating-control"
      className="flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 select-none transition-all max-h-[50vh] sm:max-h-none overflow-y-auto no-scrollbar"
    >
      {/* Zoom In */}`;

const replacementReturn = `const [isCollapsed, setIsCollapsed] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      id="compact-map-floating-control"
      className="flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 select-none transition-all"
    >
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
        title="Toggle Map Tools"
      >
        <Settings2 className="w-4 h-4" />
      </button>
      
      <div className={\`flex flex-col gap-1 overflow-hidden transition-all duration-300 \${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}\`}>

      {/* Zoom In */}`;

code = code.replace(targetReturn, replacementReturn);

const targetEnd = `    </div>
  );
};`;

const replacementEnd = `      </div>
    </div>
  );
};`;

code = code.replace(targetEnd, replacementEnd);

fs.writeFileSync('src/components/map/MapToolbar.tsx', code);
