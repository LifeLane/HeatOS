const fs = require('fs');
let code = fs.readFileSync('src/components/map/LivingEnvironmentMap.tsx', 'utf8');

// We want to change the layout to be more mobile-friendly
// Top bar: Search bar on the left, Layer selector on the right (if visible, hidden behind a button on mobile)
// Right floating controls: Change to flex-row on mobile and place at bottom right? Or keep top right but collapse
// Bottom bar: Legend and Time playback

// Let's replace the top bar entirely
const oldTopBar = `{/* ---------------- TOP FLOATING BAR: SEARCH & LAYER SELECTOR ---------------- */}
      <div className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-6 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Location Search Flyout & Live Mode */}
        <div className="pointer-events-auto flex items-center gap-2">
          <MapSearchFlyout
            currentLocationName={locationName}
            onSelectLocation={handleFlyTo}
          />

          {/* Environmental Mode Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 text-xs font-bold text-slate-800 shadow-lg shadow-slate-900/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-700">
              Living Environmental Telemetry
            </span>
          </div>
        </div>

        {/* Center / Right: Floating Layer Selector */}
        {isLayerSelectorVisible && (
          <div className="pointer-events-auto max-w-full overflow-x-auto transition-all duration-300">
            <FloatingLayerSelector
              activeLayer={activeLayer}
              availableLayers={availableLayers}
              onSelectLayer={handleLayerSelect}
            />
          </div>
        )}
      </div>`;

const newTopBar = `{/* ---------------- TOP FLOATING BAR: SEARCH & LAYER SELECTOR ---------------- */}
      <div className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-6 z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pointer-events-none">
        {/* Left: Location Search Flyout & Live Mode */}
        <div className="pointer-events-auto flex items-center gap-2 w-full md:w-auto">
          <div className="flex-1 min-w-0">
            <MapSearchFlyout
              currentLocationName={locationName}
              onSelectLocation={handleFlyTo}
            />
          </div>

          {/* Environmental Mode Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 text-xs font-bold text-slate-800 shadow-lg shadow-slate-900/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-700">
              Living Environmental Telemetry
            </span>
          </div>
        </div>

        {/* Center / Right: Floating Layer Selector */}
        {isLayerSelectorVisible && (
          <div className="pointer-events-auto w-full md:w-auto overflow-x-auto no-scrollbar transition-all duration-300">
            <FloatingLayerSelector
              activeLayer={activeLayer}
              availableLayers={availableLayers}
              onSelectLayer={handleLayerSelect}
            />
          </div>
        )}
      </div>`;

code = code.replace(oldTopBar, newTopBar);


// Right controls
const oldRightControls = `{/* ---------------- RIGHT FLOATING COMPACT MAP CONTROLS ---------------- */}
      <div className="absolute right-3 sm:right-4 top-20 z-20 flex flex-col gap-2 pointer-events-auto">
        <MapToolbar
          viewMode={viewMode}
          onChangeViewMode={(mode) => setViewMode(mode)}
          isAutoRotate={isAutoRotate}
          onToggleAutoRotate={() => setIsAutoRotate((prev) => !prev)}
          zoomLevel={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetOrientation={handleResetOrientation}
          onLocateUser={handleLocateUser}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
          isLayerSelectorOpen={isLayerSelectorVisible}
          onToggleLayerSelector={() => setIsLayerSelectorVisible((prev) => !prev)}
          onRefresh={() => loadMapData(activeLayer, true)}
          isLoading={isLoading}
          onOpenDiagnostics={onOpenDiagnostics}
        />
      </div>`;

const newRightControls = `{/* ---------------- RIGHT FLOATING COMPACT MAP CONTROLS ---------------- */}
      <div className="absolute right-3 sm:right-4 top-32 md:top-20 z-20 flex flex-col gap-2 pointer-events-auto">
        <MapToolbar
          viewMode={viewMode}
          onChangeViewMode={(mode) => setViewMode(mode)}
          isAutoRotate={isAutoRotate}
          onToggleAutoRotate={() => setIsAutoRotate((prev) => !prev)}
          zoomLevel={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetOrientation={handleResetOrientation}
          onLocateUser={handleLocateUser}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
          isLayerSelectorOpen={isLayerSelectorVisible}
          onToggleLayerSelector={() => setIsLayerSelectorVisible((prev) => !prev)}
          onRefresh={() => loadMapData(activeLayer, true)}
          isLoading={isLoading}
          onOpenDiagnostics={onOpenDiagnostics}
        />
      </div>`;

code = code.replace(oldRightControls, newRightControls);

// Bottom bar
const oldBottomBar = `{/* ---------------- BOTTOM FLOATING BAR: TIMELINE & LEGEND ---------------- */}
      <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-6 z-20 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2.5 pointer-events-none">
        {/* Left: Dynamic Map Legend */}
        <div className="pointer-events-auto">
          <MapLegend layerData={currentLayerData} />
        </div>

        {/* Right / Center: Temporal Time Controller */}
        <div className="pointer-events-auto">
          <TimePlaybackControl
            currentHorizon={timeHorizon}
            onSelectHorizon={(horizon) => setTimeHorizon(horizon)}
          />
        </div>
      </div>`;

const newBottomBar = `{/* ---------------- BOTTOM FLOATING BAR: TIMELINE & LEGEND ---------------- */}
      <div className="absolute bottom-20 sm:bottom-4 inset-x-3 sm:inset-x-6 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pointer-events-none">
        {/* Left: Dynamic Map Legend */}
        <div className="pointer-events-auto self-start sm:self-auto max-w-full overflow-hidden">
          <MapLegend layerData={currentLayerData} />
        </div>

        {/* Right / Center: Temporal Time Controller */}
        <div className="pointer-events-auto self-end sm:self-auto w-full sm:w-auto">
          <TimePlaybackControl
            currentHorizon={timeHorizon}
            onSelectHorizon={(horizon) => setTimeHorizon(horizon)}
          />
        </div>
      </div>`;
      
code = code.replace(oldBottomBar, newBottomBar);

fs.writeFileSync('src/components/map/LivingEnvironmentMap.tsx', code);

// Fix MapToolbar
let toolbarCode = fs.readFileSync('src/components/map/MapToolbar.tsx', 'utf8');

const oldToolbarContainer = `className="flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 select-none transition-all"`;
const newToolbarContainer = `className="flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 select-none transition-all max-h-[50vh] sm:max-h-none overflow-y-auto no-scrollbar"`;

toolbarCode = toolbarCode.replace(oldToolbarContainer, newToolbarContainer);
fs.writeFileSync('src/components/map/MapToolbar.tsx', toolbarCode);
