const fs = require('fs');
let code = fs.readFileSync('src/components/views/MapView.tsx', 'utf8');

const targetImports = `import { Map, ArrowRight } from 'lucide-react';`;
const replacementImports = `import { Map, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';`;
code = code.replace(targetImports, replacementImports);

const targetComponent = `export const MapView: React.FC = () => {
  const { currentLocation } = useLocation();
  const { setActiveTab, openTool } = useNavigation();
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState<boolean>(false);`;

const replacementComponent = `export const MapView: React.FC = () => {
  const { currentLocation } = useLocation();
  const { setActiveTab, openTool } = useNavigation();
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState<boolean>(false);
  const [isBannerOpen, setIsBannerOpen] = useState<boolean>(true);`;
code = code.replace(targetComponent, replacementComponent);

const targetBanner = `{/* CTA Banner: Moved out of the map to prevent overlap with search/layer controls */}
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
      </div>`;

const replacementBanner = `{/* CTA Banner: Collapsible on mobile */}
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
        
        <div className={\`overflow-hidden transition-all duration-300 md:max-h-[500px] \${isBannerOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}\`}>
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
      </div>`;

code = code.replace(targetBanner, replacementBanner);
fs.writeFileSync('src/components/views/MapView.tsx', code);
