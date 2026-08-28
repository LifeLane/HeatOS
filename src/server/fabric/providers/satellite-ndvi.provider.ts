import { BaseEnvironmentalDataProvider } from '../base.provider';
import { ProviderConfig, GeoLocationQuery, ProviderRequestOptions, NormalizedProviderTelemetry } from '../types';

export class OpenSatelliteVegetationProvider extends BaseEnvironmentalDataProvider {
  public readonly id = 'open_satellite_ndvi';
  public readonly name = 'Open Satellite Vegetation Index';
  public readonly category = 'satellite_vegetation' as const;
  public readonly config: ProviderConfig = {
    id: 'open_satellite_ndvi', name: 'Open Satellite Vegetation Index', category: 'satellite_vegetation', enabled: true,
    baseUrl: 'https://api.earthobservation.org', authRequirements: 'none', timeout: 10000,
    rateLimit: { maxRequestsPerMinute: 20, windowMs: 60000 },
    cachePolicy: { defaultTtlMs: 86400000, staleWhileRevalidateMs: 3600000 },
    dataTypes: ['ndvi', 'evi', 'canopy_cover_percent', 'surface_albedo'],
    coverage: { region: 'Global', spatialResolution: '10m (Sentinel-2)', temporalResolution: '5-Day Revisit' },
    attribution: { name: 'Copernicus Sentinel Data', license: 'Open Access', credit: 'Contains modified Copernicus Sentinel data processed by Sentinel Hub.', url: 'https://scihub.copernicus.eu/', requiredNotice: 'Copernicus Sentinel Data' }
  };
  protected async ping(): Promise<void> {}
  public async getCurrentData(location: GeoLocationQuery, options: ProviderRequestOptions = {}): Promise<NormalizedProviderTelemetry> {
    this.checkRateLimit();
    throw new Error("Satellite Vegetation API not fully configured");
  }
}
