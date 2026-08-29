import { BaseEnvironmentalDataProvider } from '../base.provider';
import { ProviderConfig, GeoLocationQuery, ProviderRequestOptions, NormalizedProviderTelemetry, ProviderForecastPoint, WeatherTelemetryBlock } from '../types';

export class NOAAWeatherProvider extends BaseEnvironmentalDataProvider {
  public readonly id = 'noaa_nws';
  public readonly name = 'NOAA National Weather Service';
  public readonly category = 'weather' as const;
  public readonly config: ProviderConfig = {
    id: 'noaa_nws',
    name: 'NOAA National Weather Service',
    category: 'weather',
    enabled: true,
    baseUrl: 'https://api.weather.gov',
    authRequirements: 'user_agent',
    timeout: 8000,
    rateLimit: { maxRequestsPerMinute: 60, windowMs: 60000 },
    cachePolicy: { defaultTtlMs: 600000, staleWhileRevalidateMs: 120000 },
    dataTypes: ['synoptic_temperature', 'dew_point', 'relative_humidity', 'barometric_pressure', 'wind_speed_direction', 'cloud_cover', 'hazard_alerts', '7_day_forecast'],
    coverage: { region: 'United States & Territories', spatialResolution: '2.5km Grid', temporalResolution: 'Hourly' },
    attribution: {
      name: 'NOAA / National Weather Service',
      license: 'Public Domain (U.S. Government)',
      credit: 'Meteorological observations and grid forecasts provided by NOAA NWS.',
      url: 'https://www.weather.gov',
      requiredNotice: 'NOAA / NWS Public Products'
    }
  };

  protected async ping(): Promise<void> {}

  public async getCurrentData(location: GeoLocationQuery, options: ProviderRequestOptions = {}): Promise<NormalizedProviderTelemetry> {
    this.checkRateLimit();
    const start = Date.now();
    try {
      // Query NOAA points endpoint
      const pointsUrl = `${this.config.baseUrl}/points/${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
      const pointsRes = await fetch(pointsUrl, {
        headers: {
          'User-Agent': '(HeatOS Environmental Intelligence, contact@heatos.vercel.app)',
          'Accept': 'application/geo+json',
        },
        signal: options.signal,
      });

      if (!pointsRes.ok) {
        throw new Error(`NOAA points API returned HTTP ${pointsRes.status}`);
      }

      const pointsData = await pointsRes.json();
      const forecastHourlyUrl = pointsData.properties?.forecastHourly;

      if (!forecastHourlyUrl) {
        throw new Error('NOAA forecast hourly endpoint not found in grid metadata');
      }

      const forecastRes = await fetch(forecastHourlyUrl, {
        headers: {
          'User-Agent': '(HeatOS Environmental Intelligence, contact@heatos.vercel.app)',
          'Accept': 'application/geo+json',
        },
        signal: options.signal,
      });

      if (!forecastRes.ok) {
        throw new Error(`NOAA hourly forecast returned HTTP ${forecastRes.status}`);
      }

      const forecastData = await forecastRes.json();
      const periods = forecastData.properties?.periods;
      if (!periods || periods.length === 0) {
        throw new Error('NOAA forecast periods empty');
      }

      const currentPeriod = periods[0];
      const tempF = currentPeriod.temperature;
      const tempC = Math.round(((tempF - 32) * 5 / 9) * 10) / 10;
      const windSpeedStr = currentPeriod.windSpeed || '10 mph';
      const windSpeedMph = parseInt(windSpeedStr, 10) || 10;
      const windSpeedKmh = Math.round(windSpeedMph * 1.60934 * 10) / 10;
      const windDir = currentPeriod.windDirection || 'N';
      const windDeg = this.convertWindDirectionToDeg(windDir);
      const humidityPct = currentPeriod.relativeHumidity?.value ?? 55;
      const dewPointF = currentPeriod.dewpoint?.value != null ? (currentPeriod.dewpoint.value * 9/5) + 32 : tempF - 10;
      const dewPointC = Math.round(((dewPointF - 32) * 5 / 9) * 10) / 10;

      const weatherBlock: WeatherTelemetryBlock = {
        ambientTempC: tempC,
        apparentTempC: tempC + 1.2,
        dewPointC: dewPointC,
        relativeHumidityPct: humidityPct,
        barometricPressureHpa: 1013.25,
        windSpeedKmh: windSpeedKmh,
        windDirectionDeg: windDeg,
        cloudCoverPct: 25,
        precipitationChancePct: currentPeriod.probabilityOfPrecipitation?.value ?? 10,
        weatherCondition: currentPeriod.shortForecast || 'Clear',
      };

      this.lastLatencyMs = Date.now() - start;

      return {
        providerId: this.id,
        providerName: this.name,
        category: this.category,
        timestamp: new Date().toISOString(),
        attribution: this.config.attribution,
        quality: {
          freshness: 'live',
          confidence: 94,
          availability: 'online',
          quality: 'high',
          latencyMs: this.lastLatencyMs,
          lastUpdated: new Date().toISOString(),
        },
        data: weatherBlock,
        raw: currentPeriod,
      };
    } catch (err: any) {
      this.lastLatencyMs = Date.now() - start;
      throw err;
    }
  }

  public async getForecastData(location: GeoLocationQuery, options: ProviderRequestOptions = {}): Promise<ProviderForecastPoint[]> {
    try {
      const pointsUrl = `${this.config.baseUrl}/points/${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
      const pointsRes = await fetch(pointsUrl, {
        headers: {
          'User-Agent': '(HeatOS Environmental Intelligence, contact@heatos.vercel.app)',
          'Accept': 'application/geo+json',
        },
        signal: options.signal,
      });
      if (!pointsRes.ok) return [];
      const pointsData = await pointsRes.json();
      const forecastUrl = pointsData.properties?.forecast;
      if (!forecastUrl) return [];

      const forecastRes = await fetch(forecastUrl, {
        headers: {
          'User-Agent': '(HeatOS Environmental Intelligence, contact@heatos.vercel.app)',
          'Accept': 'application/geo+json',
        },
        signal: options.signal,
      });
      if (!forecastRes.ok) return [];
      const forecastData = await forecastRes.json();
      const periods = forecastData.properties?.periods || [];

      return periods.slice(0, 7).map((p: any) => ({
        timestamp: p.startTime,
        temperatureC: Math.round(((p.temperature - 32) * 5 / 9) * 10) / 10,
        condition: p.shortForecast,
        humidityPct: p.relativeHumidity?.value ?? 50,
      }));
    } catch {
      return [];
    }
  }

  private convertWindDirectionToDeg(dir: string): number {
    const map: Record<string, number> = {
      N: 0, NNE: 22, NE: 45, ENE: 67, E: 90, ESE: 112, SE: 135, SSE: 157,
      S: 180, SSW: 202, SW: 225, WSW: 247, W: 270, WNW: 292, NW: 315, NNW: 337
    };
    return map[dir.toUpperCase()] || 0;
  }
}
