import { BaseEnvironmentalDataProvider } from '../base.provider';
import { ProviderConfig, GeoLocationQuery, ProviderRequestOptions, NormalizedProviderTelemetry, ProviderForecastPoint } from '../types';

export class NOAAWeatherProvider extends BaseEnvironmentalDataProvider {
  public readonly id = 'noaa_nws';
  public readonly name = 'NOAA National Weather Service';
  public readonly category = 'weather' as const;
  public readonly config: ProviderConfig = {
    id: 'noaa_nws', name: 'NOAA National Weather Service', category: 'weather', enabled: true,
    baseUrl: 'https://api.weather.gov', authRequirements: 'user_agent', timeout: 8000,
    rateLimit: { maxRequestsPerMinute: 60, windowMs: 60000 },
    cachePolicy: { defaultTtlMs: 600000, staleWhileRevalidateMs: 120000 },
    dataTypes: ['synoptic_temperature', 'dew_point', 'relative_humidity', 'barometric_pressure', 'wind_speed_direction', 'cloud_cover', 'hazard_alerts', '7_day_forecast'],
    coverage: { region: 'United States & Territories', spatialResolution: '2.5km Grid', temporalResolution: 'Hourly' },
    attribution: { name: 'NOAA / National Weather Service', license: 'Public Domain', credit: 'Meteorological data provided by NOAA', url: 'https://www.weather.gov', requiredNotice: 'NOAA / NWS Public Products' }
  };
  protected async ping(): Promise<void> {}
  public async getCurrentData(location: GeoLocationQuery, options: ProviderRequestOptions = {}): Promise<NormalizedProviderTelemetry> {
    this.checkRateLimit();
    throw new Error("NOAA API not returning live data");
  }
  public async getForecastData(location: GeoLocationQuery, options: ProviderRequestOptions = {}): Promise<ProviderForecastPoint[]> {
    throw new Error("Forecast API not configured");
  }
}
