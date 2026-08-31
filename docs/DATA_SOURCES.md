# HeatOS Environmental Data Sources

HeatOS synthesizes environmental data from multiple authoritative providers through the **Environmental Data Fabric**. This architecture ensures resilience; if one provider fails, the system degrades gracefully by relying on available sources.

## Core Provider Matrix

| Provider | Role | Key Data Supplied | Authentication | Failure Strategy |
|----------|------|-------------------|----------------|------------------|
| **FortyGuard** | Primary Thermal Engine | High-resolution microclimate mesh, localized surface temperature, heat anomalies | API Key Required (`FORTYGUARD_API_KEY`) | Falls back to NOAA ambient baseline if unavailable. |
| **NOAA NWS** | Atmospheric Baseline | Ambient temperature, humidity, wind, 72-hour forecast | Open Data (No Auth) | Fabric relies on available alternative data. |
| **AirNow (EPA)** | Primary Air Quality | AQI, PM2.5, PM10, Ozone | API Key Required | Falls back to PurpleAir or degrades air quality metrics. |
| **PurpleAir** | Hyper-local Air Quality | Micro-particulate data (PM2.5) | API Key Required | Degrades to regional AirNow baseline. |
| **NASA EONET** | Natural Hazards | Wildfires, severe storms, active extreme events | Open Data (No Auth) | Fails open (no active hazards reported). |
| **NASA FIRMS** | Thermal Anomalies | Active thermal hotspots (fire/heat) | Open Data (No Auth) | Event correlation degrades. |
| **USGS Water** | Hydrological State | Water stress, discharge, humidity correlation | Open Data (No Auth) | Degrades ecological stress models. |

## Data Ingestion & Normalization

The **Environmental Data Fabric** handles API responses via dedicated provider classes (e.g., `FortyGuardProvider`, `NoaaProvider`). 

Each provider:
1. Validates the incoming response structure.
2. Normalizes the data into standard SI units (°C, hPa, m/s).
3. Generates a data quality score (confidence) based on freshness and source reliability.
4. Returns a `NormalizedProviderTelemetry` object to the Fabric orchestrator.

## External API Resilience

HeatOS uses strict resilience patterns for all external API integrations:

- **Timeouts:** All outbound requests enforce strict timeouts (e.g., 5-10 seconds) to prevent cascading failures.
- **Retries:** Configurable exponential backoff retries for transient errors.
- **Circuit Breaking:** If an API repeatedly fails (e.g., 429 Too Many Requests, 502 Bad Gateway), the Orchestrator marks the provider as "offline" for a cooldown period.
- **Missing Data Handling:** If a required provider fails, the Orchestrator synthesizes the `CompositeEnvironmentalState` using remaining providers. The UI reflects this by indicating "Partial Data" or lowering the Confidence Score, rather than crashing or showing fabricated information.
