const fs = require('fs');
let code = fs.readFileSync('src/components/map/OpenMapView.tsx', 'utf8');

const target = `      <div ref={mapContainerRef} className="w-full h-full" />`;
const replacement = `      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Real-time Environmental Animated Overlay */}
      {layerData?.grid && layerData.grid.length > 0 && (
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen flex items-center justify-center z-[400]">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 p-4 sm:p-8 w-full max-w-2xl h-full max-h-[500px]">
            {layerData.grid.slice(0, 36).map((cell, idx) => (
              <div
                key={idx}
                className="rounded-3xl transition-all duration-1000 blur-2xl sm:blur-3xl"
                style={{
                  backgroundColor:
                    activeLayer === 'heat' || activeLayer === 'heat_risk'
                      ? \`rgba(239, 68, 68, \${0.2 + cell.normalizedIntensity * 0.8})\`
                      : activeLayer === 'nature'
                      ? \`rgba(16, 185, 129, \${0.2 + cell.normalizedIntensity * 0.8})\`
                      : activeLayer === 'air'
                      ? \`rgba(20, 184, 166, \${0.2 + cell.normalizedIntensity * 0.8})\`
                      : \`rgba(59, 130, 246, \${0.2 + cell.normalizedIntensity * 0.8})\`,
                  transform: \`scale(\${0.8 + cell.normalizedIntensity * 0.4})\`,
                  animation: \`pulse-opacity \${3 + (idx % 3)}s infinite alternate\`
                }}
              />
            ))}
          </div>
        </div>
      )}`;

code = code.replace(target, replacement);

const styleTarget = `.map-tiles-dark {`;
const styleReplacement = `@keyframes pulse-opacity {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
        .map-tiles-dark {`;

code = code.replace(styleTarget, styleReplacement);

fs.writeFileSync('src/components/map/OpenMapView.tsx', code);
