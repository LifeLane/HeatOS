const fs = require('fs');
let prov = fs.readFileSync('src/server/fortyguard/provider.ts', 'utf8');

prov = prov.replace(/export interface IEnvironmentalProvider \{[\s\S]*?\}/, 
`export interface IEnvironmentalProvider {
  getEnvironmentalParameters(params: FortyGuardEnvParamsRequest, options?: { signal?: AbortSignal; requestId?: string }): Promise<EnvironmentalState>;
  getHeatmap(params: FortyGuardHeatmapRequest, options?: { signal?: AbortSignal; requestId?: string }): Promise<HeatmapData>;
  getHeatIntelligence(params: FortyGuardHeatIntelligenceRequest, options?: { signal?: AbortSignal; requestId?: string }): Promise<HeatIntelligenceResult>;
  getSatellite(params: FortyGuardSatelliteRequest, options?: { signal?: AbortSignal; requestId?: string }): Promise<SatelliteThermalResult>;
  getStreetview(params: FortyGuardStreetviewRequest, options?: { signal?: AbortSignal; requestId?: string }): Promise<StreetviewMicroclimateResult>;
}`);

fs.writeFileSync('src/server/fortyguard/provider.ts', prov);
