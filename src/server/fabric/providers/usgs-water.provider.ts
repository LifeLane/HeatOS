import { BaseEnvironmentalDataProvider } from '../base.provider';
import { ProviderConfig, GeoLocationQuery, ProviderRequestOptions, NormalizedProviderTelemetry } from '../types';

export class USGSWaterProvider extends BaseEnvironmentalDataProvider {
  public readonly id = 'usgs_nwis';
  public readonly name = 'USGS National Water Information System';
  public readonly category = 'water' as const;
  public readonly config: ProviderConfig = {
    id: 'usgs_nwis', name: 'USGS National Water Information System', category: 'water', enabled: true,
    baseUrl: 'https://waterservices.usgs.gov/nwis/iv/', authRequirements: 'none', timeout: 10000,
    rateLimit: { maxRequestsPerMinute: 30, windowMs: 60000 },
    cachePolicy: { defaultTtlMs: 900000, staleWhileRevalidateMs: 300000 },
    dataTypes: ['water_temperature_c', 'gage_height_m', 'discharge_cfs', 'specific_conductance'],
    coverage: { region: 'United States', spatialResolution: 'Point Observations (Gages)', temporalResolution: '15-Minute to Hourly' },
    attribution: { name: 'U.S. Geological Survey (USGS)', license: 'Public Domain', credit: 'Water data provided by the U.S. Geological Survey.', url: 'https://waterdata.usgs.gov/nwis', requiredNotice: 'USGS NWIS Data' }
  };
  protected async ping(): Promise<void> {}
  public async getCurrentData(location: GeoLocationQuery, options: ProviderRequestOptions = {}): Promise<NormalizedProviderTelemetry> {
    this.checkRateLimit();
    throw new Error("USGS API not fully configured");
  }
}
