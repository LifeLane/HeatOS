/**
 * HeatOS: Central Deterministic Local Intelligence Engine
 * 
 * Provides instantaneous, scientific, zero-cost, deterministic explanations and
 * classifications for all core environmental metrics without invoking remote AI.
 * 
 * Works 100% offline, guarantees 0ms latency, zero hallucination, and serves
 * as the bedrock of HeatOS interpretability and fallback handling.
 */

export interface MetricInterpretation {
  metricKey: string;
  label: string;
  value: number | string;
  category: string;
  summary: string;
  whyItMatters: string;
  recommendation: string;
  status: 'optimal' | 'normal' | 'moderate' | 'elevated' | 'warning' | 'critical';
  confidence: number;
}

export class LocalIntelligenceEngine {
  /**
   * 1. Temperature interpretation
   */
  public static interpretTemperature(tempC: number): MetricInterpretation {
    let category = 'Moderate';
    let status: MetricInterpretation['status'] = 'normal';
    let summary = `Ambient air temperature measured at ${tempC.toFixed(1)}°C.`;
    let whyItMatters = 'Ambient air temperature is the fundamental thermodynamic baseline of the urban microclimate.';
    let recommendation = 'Standard activity levels are safe under normal baseline conditions.';

    if (tempC >= 42) {
      category = 'Extreme Heat Hazard';
      status = 'critical';
      summary = `Extreme heat emergency: ${tempC.toFixed(1)}°C exceeds critical biophysical thresholds.`;
      whyItMatters = 'Prolonged exposure induces severe heat exhaustion and high cellular hyperthermia risk.';
      recommendation = 'Halt non-essential outdoor operations and maximize cooling shelter access immediately.';
    } else if (tempC >= 38) {
      category = 'Severe Heat';
      status = 'critical';
      summary = `Severe heat conditions: ${tempC.toFixed(1)}°C poses elevated thermal stress.`;
      whyItMatters = 'High thermal load restricts human metabolic cooling and strains HVAC cooling capacity.';
      recommendation = 'Limit direct sun exposure, enforce hydration breaks, and schedule shifts for cooler hours.';
    } else if (tempC >= 32) {
      category = 'Elevated Heat';
      status = 'warning';
      summary = `Elevated heat: ${tempC.toFixed(1)}°C creates moderate to high discomfort.`;
      whyItMatters = 'Requires conscious shade-seeking and increased hydration for vulnerable groups.';
      recommendation = 'Utilize shaded pathways and avoid strenuous outdoor exercise during peak hours.';
    } else if (tempC >= 20 && tempC < 28) {
      category = 'Thermal Comfort';
      status = 'optimal';
      summary = `Optimal thermal comfort: ${tempC.toFixed(1)}°C provides pleasant outdoor conditions.`;
      whyItMatters = 'Ideal range for human metabolic equilibrium with minimal thermal strain.';
      recommendation = 'Favorable conditions for all outdoor civic and recreational activities.';
    } else if (tempC < 5) {
      category = 'Cold Stress';
      status = 'warning';
      summary = `Low temperature: ${tempC.toFixed(1)}°C requires thermal insulation.`;
      whyItMatters = 'Rapid bodily heat loss can lead to hypothermia without adequate apparel.';
      recommendation = 'Wear insulated layers and protect against convective wind chill.';
    }

    return {
      metricKey: 'temperature',
      label: 'Ambient Temperature',
      value: `${tempC.toFixed(1)}°C`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 98,
    };
  }

  /**
   * 2. Feels-Like (Apparent Temperature)
   */
  public static interpretFeelsLike(apparentC: number, ambientC: number): MetricInterpretation {
    const delta = apparentC - ambientC;
    let category = 'Equivalent';
    let status: MetricInterpretation['status'] = 'normal';
    let summary = `Apparent temperature feels like ${apparentC.toFixed(1)}°C (${delta >= 0 ? '+' : ''}${delta.toFixed(1)}°C vs measured air).`;
    let whyItMatters = 'Apparent temperature models perceived thermal comfort by compounding humidity and wind vectors.';
    let recommendation = 'Calibrate hydration and clothing choices to perceived rather than raw thermometer temperature.';

    if (delta >= 4) {
      category = 'High Humidity Amplification';
      status = apparentC >= 38 ? 'critical' : 'warning';
      summary = `High humidity suppresses sweat evaporation, making ${ambientC.toFixed(1)}°C feel significantly hotter at ${apparentC.toFixed(1)}°C.`;
      whyItMatters = 'Reduced evaporative cooling accelerates physiological fatigue and cardiac workload.';
      recommendation = 'Increase fluid intake and avoid prolonged unshaded exertion.';
    } else if (delta <= -4) {
      category = 'Wind Chill Suppression';
      status = 'moderate';
      summary = `Convective wind accelerates heat dissipation, making ${ambientC.toFixed(1)}°C feel cooler at ${apparentC.toFixed(1)}°C.`;
      whyItMatters = 'Rapid surface cooling can cause chill despite moderate air temperatures.';
      recommendation = 'Wear wind-blocking outerwear.';
    }

    return {
      metricKey: 'feelsLike',
      label: 'Apparent Feels-Like',
      value: `${apparentC.toFixed(1)}°C`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 95,
    };
  }

  /**
   * 3. Relative Humidity
   */
  public static interpretHumidity(humidityPct: number): MetricInterpretation {
    let category = 'Comfortable';
    let status: MetricInterpretation['status'] = 'optimal';
    let summary = `Relative humidity is at ${humidityPct}%.`;
    let whyItMatters = 'Atmospheric moisture regulates human perspiration efficiency and building envelope moisture loads.';
    let recommendation = 'Maintain standard ventilation.';

    if (humidityPct >= 75) {
      category = 'Oppressive Moisture';
      status = 'warning';
      summary = `High atmospheric moisture (${humidityPct}%) severely inhibits evaporative perspiration.`;
      whyItMatters = 'Moisture-saturated air traps heat against the human body, amplifying thermal stress.';
      recommendation = 'Utilize dehumidification and fans to enhance air circulation.';
    } else if (humidityPct <= 20) {
      category = 'Arid / Dry';
      status = 'moderate';
      summary = `Low relative humidity (${humidityPct}%) causes rapid respiratory and skin moisture loss.`;
      whyItMatters = 'Arid conditions increase dehydration rates and particulate resuspension.';
      recommendation = 'Maintain frequent hydration and eye moisture.';
    }

    return {
      metricKey: 'humidity',
      label: 'Relative Humidity',
      value: `${humidityPct}%`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 96,
    };
  }

  /**
   * 4. Dew Point
   */
  public static interpretDewPoint(dewPointC: number): MetricInterpretation {
    let category = 'Comfortable';
    let status: MetricInterpretation['status'] = 'optimal';
    let summary = `Dew point is ${dewPointC.toFixed(1)}°C.`;
    let whyItMatters = 'Dew point is the absolute measure of atmospheric moisture content regardless of air temperature.';
    let recommendation = 'Pleasant conditions for outdoor activity.';

    if (dewPointC >= 24) {
      category = 'Extremely Oppressive';
      status = 'critical';
      summary = `Extreme dew point (${dewPointC.toFixed(1)}°C) creates tropical-grade oppressive air.`;
      whyItMatters = 'Human sweat cannot evaporate effectively, leading to rapid heat illness.';
      recommendation = 'Seek climate-controlled air conditioning.';
    } else if (dewPointC >= 20) {
      category = 'Muggy / Humid';
      status = 'warning';
      summary = `Muggy conditions (${dewPointC.toFixed(1)}°C dew point) increase perceived stickiness.`;
      whyItMatters = 'Thermal discomfort increases significantly during physical exertion.';
      recommendation = 'Limit high-intensity workouts to early morning hours.';
    } else if (dewPointC < 10) {
      category = 'Crisp & Dry';
      status = 'optimal';
      summary = `Crisp and dry air (${dewPointC.toFixed(1)}°C dew point) promotes rapid evaporative cooling.`;
      whyItMatters = 'Low moisture content ensures clean evaporative efficiency.';
      recommendation = 'Ensure adequate skin hydration in arid environments.';
    }

    return {
      metricKey: 'dewPoint',
      label: 'Dew Point',
      value: `${dewPointC.toFixed(1)}°C`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 97,
    };
  }

  /**
   * 5. Wind Speed & Gusts
   */
  public static interpretWind(speedKmh: number, gustKmh?: number): MetricInterpretation {
    let category = 'Light Breeze';
    let status: MetricInterpretation['status'] = 'optimal';
    let summary = `Wind speed is ${speedKmh.toFixed(0)} km/h${gustKmh ? ` with gusts to ${gustKmh.toFixed(0)} km/h` : ''}.`;
    let whyItMatters = 'Air velocity drives convective urban cooling and disperses particulate air pollution.';
    let recommendation = 'Gentle air movement promotes natural ventilation.';

    if (speedKmh >= 60 || (gustKmh && gustKmh >= 75)) {
      category = 'High Gale / Storm';
      status = 'critical';
      summary = `High wind hazard: ${speedKmh.toFixed(0)} km/h sustained winds with dangerous gusts.`;
      whyItMatters = 'Risks structural damage, tree branch detachment, and airborne debris hazards.';
      recommendation = 'Secure loose outdoor equipment and avoid standing under mature tree canopies.';
    } else if (speedKmh >= 35) {
      category = 'Brisk / Gusty';
      status = 'moderate';
      summary = `Brisk winds (${speedKmh.toFixed(0)} km/h) create strong convective mixing.`;
      whyItMatters = 'Enhances urban ventilation but may transport airborne dust or pollen.';
      recommendation = 'Secure lightweight outdoor materials.';
    } else if (speedKmh < 4) {
      category = 'Stagnant Air';
      status = 'warning';
      summary = `Stagnant air conditions (${speedKmh.toFixed(0)} km/h) limit convective heat dispersion.`;
      whyItMatters = 'Zero air movement exacerbates street canyon heat traps and local pollutant buildup.';
      recommendation = 'Urban canyons with zero wind require active shade and misting interventions.';
    }

    return {
      metricKey: 'wind',
      label: 'Wind Velocity',
      value: `${speedKmh.toFixed(0)} km/h`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 95,
    };
  }

  /**
   * 6. Atmospheric Pressure
   */
  public static interpretPressure(pressureHpa: number): MetricInterpretation {
    let category = 'Standard Atmospheric';
    let status: MetricInterpretation['status'] = 'normal';
    let summary = `Barometric pressure is ${pressureHpa} hPa.`;
    let whyItMatters = 'Barometric pressure indicates synoptic weather systems and atmospheric stability.';
    let recommendation = 'Stable synoptic weather patterns expected.';

    if (pressureHpa >= 1025) {
      category = 'High Pressure System';
      status = 'optimal';
      summary = `Strong high pressure (${pressureHpa} hPa) brings stable, clear atmospheric conditions.`;
      whyItMatters = 'Subsiding air suppresses cloud cover, increasing daytime solar insolation.';
      recommendation = 'Anticipate strong solar heating during daylight hours.';
    } else if (pressureHpa <= 1000) {
      category = 'Low Pressure System';
      status = 'moderate';
      summary = `Low pressure trough (${pressureHpa} hPa) signals atmospheric instability and potential storm activity.`;
      whyItMatters = 'Rising air facilitates cloud formation, wind shear, and precipitation events.';
      recommendation = 'Monitor radar for incoming precipitation or convective wind shifts.';
    }

    return {
      metricKey: 'pressure',
      label: 'Atmospheric Pressure',
      value: `${pressureHpa} hPa`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 97,
    };
  }

  /**
   * 7. Heat Index
   */
  public static interpretHeatIndex(heatIndexC: number): MetricInterpretation {
    let category = 'Normal';
    let status: MetricInterpretation['status'] = 'optimal';
    let summary = `Heat Index is ${heatIndexC.toFixed(1)}°C.`;
    let whyItMatters = 'NOAA Heat Index measures perceived temperature when high relative humidity is factored with air heat.';
    let recommendation = 'Low risk under current conditions.';

    if (heatIndexC >= 54) {
      category = 'Extreme Danger';
      status = 'critical';
      summary = `Extreme Heat Index Danger: ${heatIndexC.toFixed(1)}°C. Heatstroke is imminent with continued exposure.`;
      whyItMatters = 'Exceeds the body’s physiological compensation limit for thermal regulation.';
      recommendation = 'Immediately halt all outdoor labor. Enforce mandatory cooling rest in air-conditioned spaces.';
    } else if (heatIndexC >= 41) {
      category = 'Danger';
      status = 'critical';
      summary = `Heat Index Danger: ${heatIndexC.toFixed(1)}°C. Heat cramps and exhaustion likely; heatstroke possible.`;
      whyItMatters = 'High thermal load with severe dehydration and cardiac stress risks.';
      recommendation = 'Limit outdoor activity to essential tasks only with mandatory hydration cycles.';
    } else if (heatIndexC >= 32) {
      category = 'Extreme Caution';
      status = 'warning';
      summary = `Heat Index Extreme Caution: ${heatIndexC.toFixed(1)}°C. Heat cramps and exhaustion possible with prolonged activity.`;
      whyItMatters = 'Physical exertion requires elevated metabolic compensation.';
      recommendation = 'Schedule outdoor tasks for cooler morning hours and seek shaded rest areas.';
    } else if (heatIndexC >= 27) {
      category = 'Caution';
      status = 'moderate';
      summary = `Heat Index Caution: ${heatIndexC.toFixed(1)}°C. Fatigue possible with prolonged exposure.`;
      whyItMatters = 'Slight increase in thermal strain for vulnerable demographics.';
      recommendation = 'Stay hydrated and take periodic breaks during physical activity.';
    }

    return {
      metricKey: 'heatIndex',
      label: 'Heat Index',
      value: `${heatIndexC.toFixed(1)}°C`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 96,
    };
  }

  /**
   * 8. Psychrometric Wet-Bulb Temperature
   */
  public static interpretWetBulb(wetBulbC: number): MetricInterpretation {
    let category = 'Safe Biophysical Range';
    let status: MetricInterpretation['status'] = 'optimal';
    let summary = `Psychrometric wet-bulb temperature is ${wetBulbC.toFixed(1)}°C.`;
    let whyItMatters = 'Wet-bulb temperature is the theoretical lowest temperature achievable via evaporative water cooling.';
    let recommendation = 'Evaporative sweat cooling is fully effective.';

    if (wetBulbC >= 35) {
      category = 'Fatal Survivability Limit';
      status = 'critical';
      summary = `Fatal limit reached: ${wetBulbC.toFixed(1)}°C wet-bulb exceeds theoretical human physiological survivability.`;
      whyItMatters = 'Even healthy humans in shade cannot dissipate metabolic heat, resulting in fatal hyperthermia within 6 hours.';
      recommendation = 'Immediate life-safety emergency: mandatory access to refrigerated or mechanical cooling.';
    } else if (wetBulbC >= 31) {
      category = 'Extreme Danger Threshold';
      status = 'critical';
      summary = `Extreme wet-bulb hazard (${wetBulbC.toFixed(1)}°C): Sweating provides negligible thermal relief.`;
      whyItMatters = 'Dangerous hyperthermia risk even during moderate physical activity.';
      recommendation = 'Suspend heavy manual labor and ensure continuous chilled hydration.';
    } else if (wetBulbC >= 28) {
      category = 'Severe Physiological Stress';
      status = 'warning';
      summary = `Elevated wet-bulb temperature (${wetBulbC.toFixed(1)}°C) sharply restricts evaporative efficiency.`;
      whyItMatters = 'Significant risk of heat exhaustion for athletes and industrial workers.';
      recommendation = 'Implement strict work-rest ratios (20 min rest per 40 min work).';
    } else if (wetBulbC >= 24) {
      category = 'Moderate Humidity Restraint';
      status = 'moderate';
      summary = `Moderate wet-bulb temperature (${wetBulbC.toFixed(1)}°C) reduces cooling speed.`;
      whyItMatters = 'Extended outdoor exertion generates gradual core temperature buildup.';
      recommendation = 'Monitor hydration and take shaded rests.';
    }

    return {
      metricKey: 'wetBulb',
      label: 'Wet-Bulb Temperature',
      value: `${wetBulbC.toFixed(1)}°C`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 97,
    };
  }

  /**
   * 9. Air Quality Index (AQI)
   */
  public static interpretAirQuality(aqi: number): MetricInterpretation {
    let category = 'Good (0-50)';
    let status: MetricInterpretation['status'] = 'optimal';
    let summary = `Air Quality Index is ${aqi} (Good). Clean atmospheric conditions.`;
    let whyItMatters = 'Air quality poses little or no risk to public health and respiratory systems.';
    let recommendation = 'Ideal air conditions for outdoor activities and natural building ventilation.';

    if (aqi > 300) {
      category = 'Hazardous (>300)';
      status = 'critical';
      summary = `Hazardous air quality (${aqi} AQI): Severe health warning for the entire population.`;
      whyItMatters = 'High particulate concentrations can cause acute respiratory and cardiovascular events.';
      recommendation = 'Remain indoors with HEPA air filtration. Avoid all outdoor physical activity.';
    } else if (aqi > 200) {
      category = 'Very Unhealthy (201-300)';
      status = 'critical';
      summary = `Very Unhealthy air quality (${aqi} AQI): High health risk for all demographics.`;
      whyItMatters = 'Triggers acute asthma attacks and respiratory inflammation.';
      recommendation = 'Wear N95/FFP2 masks outdoors and keep windows sealed.';
    } else if (aqi > 150) {
      category = 'Unhealthy (151-200)';
      status = 'warning';
      summary = `Unhealthy air quality (${aqi} AQI): General public may experience adverse health effects.`;
      whyItMatters = 'Fine particulate matter (PM2.5) penetrates deep into pulmonary alveoli.';
      recommendation = 'Sensitive groups must avoid outdoor exertion; others should reduce prolonged activity.';
    } else if (aqi > 100) {
      category = 'Unhealthy for Sensitive Groups (101-150)';
      status = 'warning';
      summary = `Unhealthy for Sensitive Groups (${aqi} AQI): Children, elderly, and asthmatics are vulnerable.`;
      whyItMatters = 'Elevated ozone or particulate levels irritate sensitive respiratory tracts.';
      recommendation = 'Sensitive individuals should limit prolonged outdoor exertion.';
    } else if (aqi > 50) {
      category = 'Moderate (51-100)';
      status = 'moderate';
      summary = `Moderate air quality (${aqi} AQI): Acceptable quality with slight risk for unusually sensitive individuals.`;
      whyItMatters = 'Minor background pollutants present within national regulatory standards.';
      recommendation = 'Standard outdoor activity is safe for the general population.';
    }

    return {
      metricKey: 'airQuality',
      label: 'Air Quality (AQI)',
      value: `${aqi} AQI`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 96,
    };
  }

  /**
   * 10. UV Index
   */
  public static interpretUV(uvIndex: number): MetricInterpretation {
    let category = 'Low (0-2)';
    let status: MetricInterpretation['status'] = 'optimal';
    let summary = `UV Index is ${uvIndex.toFixed(1)} (Low). Minimal solar radiation hazard.`;
    let whyItMatters = 'Minimal ultraviolet exposure risk during standard daylight hours.';
    let recommendation = 'No special solar protection required.';

    if (uvIndex >= 11) {
      category = 'Extreme (11+)';
      status = 'critical';
      summary = `Extreme UV radiation (${uvIndex.toFixed(1)}): Unprotected skin can burn in under 10 minutes.`;
      whyItMatters = 'High-intensity UV-A and UV-B photons cause rapid cellular DNA damage and retinal strain.';
      recommendation = 'Avoid sun exposure between 10:00 and 16:00. Use SPF 50+, UV400 sunglasses, and wide-brim hats.';
    } else if (uvIndex >= 8) {
      category = 'Very High (8-10)';
      status = 'critical';
      summary = `Very High UV radiation (${uvIndex.toFixed(1)}): Rapid sunburn risk on unprotected skin.`;
      whyItMatters = 'Substantial ultraviolet dosage with high cumulative skin cancer risk.';
      recommendation = 'Seek shade, apply SPF 30+ sunscreen, and wear protective clothing.';
    } else if (uvIndex >= 6) {
      category = 'High (6-7)';
      status = 'warning';
      summary = `High UV radiation (${uvIndex.toFixed(1)}): Protection required against solar radiation.`;
      whyItMatters = 'Direct sun exposure causes sunburn within 20 to 30 minutes.';
      recommendation = 'Wear sunglasses, apply sunscreen, and seek shade during midday hours.';
    } else if (uvIndex >= 3) {
      category = 'Moderate (3-5)';
      status = 'moderate';
      summary = `Moderate UV radiation (${uvIndex.toFixed(1)}): Standard solar protection recommended.`;
      whyItMatters = 'Moderate ultraviolet intensity during midday sun.';
      recommendation = 'Wear a hat and apply sunscreen if spending over 45 minutes outdoors.';
    }

    return {
      metricKey: 'UV',
      label: 'Solar UV Index',
      value: `UV ${uvIndex.toFixed(1)}`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 98,
    };
  }

  /**
   * 11. Solar Global Horizontal Irradiance (GHI)
   */
  public static interpretSolarIrradiance(ghiWm2: number): MetricInterpretation {
    let category = 'Low / Nocturnal';
    let status: MetricInterpretation['status'] = 'optimal';
    let summary = `Solar irradiance measured at ${ghiWm2} W/m².`;
    let whyItMatters = 'Solar irradiance directly determines shortwave radiative heating of urban surfaces.';
    let recommendation = 'Low radiative heat gain on building envelopes.';

    if (ghiWm2 >= 900) {
      category = 'Intense Solar Insolation';
      status = 'critical';
      summary = `Peak solar irradiance (${ghiWm2} W/m²): Extreme shortwave radiative heat flux.`;
      whyItMatters = 'Heats asphalt and concrete surfaces up to 25°C above ambient air temperature.';
      recommendation = 'Deploy shade awnings and cool roof technologies to reject direct radiative gains.';
    } else if (ghiWm2 >= 600) {
      category = 'High Solar Radiation';
      status = 'warning';
      summary = `Strong solar radiation (${ghiWm2} W/m²) driving rapid surface thermal accumulation.`;
      whyItMatters = 'Significant thermal load on dark pavements and building facades.';
      recommendation = 'Utilize shaded walkways to avoid direct radiative heat absorption.';
    } else if (ghiWm2 >= 300) {
      category = 'Moderate Insolation';
      status = 'moderate';
      summary = `Moderate solar radiation (${ghiWm2} W/m²).`;
      whyItMatters = 'Balanced daylighting with moderate thermal heating.';
      recommendation = 'Standard daylight conditions.';
    }

    return {
      metricKey: 'solarIrradiance',
      label: 'Solar Irradiance (GHI)',
      value: `${ghiWm2} W/m²`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 95,
    };
  }

  /**
   * 12. FortyGuard Urban Heat Island (UHI) Surface Anomaly
   */
  public static interpretHeatIsland(anomalyDeltaC: number, surfaceTempC?: number): MetricInterpretation {
    let category = 'Nominal Baseline';
    let status: MetricInterpretation['status'] = 'optimal';
    let summary = `Surface thermal delta is +${anomalyDeltaC.toFixed(1)}°C compared to regional baseline.`;
    let whyItMatters = 'Urban Heat Island (UHI) delta isolates anthropogenic and pavement heat retention from ambient air.';
    let recommendation = 'Thermal properties align with regional rural background.';

    if (anomalyDeltaC >= 6.0) {
      category = 'Extreme Thermal Anomaly';
      status = 'critical';
      summary = `Severe urban heat island hotspot: Pavement surface exceeds ambient baseline by +${anomalyDeltaC.toFixed(1)}°C${surfaceTempC ? ` (${surfaceTempC.toFixed(1)}°C surface)` : ''}.`;
      whyItMatters = 'Severe thermal retention traps heat in the urban boundary layer, preventing nocturnal cooling.';
      recommendation = 'Priority site for high-albedo cool pavement coating and urban canopy greening.';
    } else if (anomalyDeltaC >= 3.5) {
      category = 'Elevated Heat Island Hotspot';
      status = 'warning';
      summary = `Acute microclimate anomaly: +${anomalyDeltaC.toFixed(1)}°C above regional background.`;
      whyItMatters = 'High density of low-albedo asphalt and restricted convective ventilation.';
      recommendation = 'Deploy shade structures and optimize HVAC condenser heat discharge points.';
    } else if (anomalyDeltaC >= 1.5) {
      category = 'Moderate Urban Thermal Elevation';
      status = 'moderate';
      summary = `Moderate thermal delta: +${anomalyDeltaC.toFixed(1)}°C urban thermal elevation.`;
      whyItMatters = 'Standard built-environment thermal mass accumulation.';
      recommendation = 'Maintain urban tree maintenance to preserve cooling buffer.';
    } else if (anomalyDeltaC <= 0.0) {
      category = 'Cooling Oasis / Vegetation Buffer';
      status = 'optimal';
      summary = `Cool microclimate zone: Surface is ${Math.abs(anomalyDeltaC).toFixed(1)}°C cooler than background baseline.`;
      whyItMatters = 'Evapotranspiration and high vegetative canopy density actively suppress heat accumulation.';
      recommendation = 'Preserve existing tree canopy and permeable soils.';
    }

    return {
      metricKey: 'heatIsland',
      label: 'Urban Heat Island (UHI) Delta',
      value: `+${anomalyDeltaC.toFixed(1)}°C`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 96,
    };
  }

  /**
   * 13. Tree Canopy Density / NDVI
   */
  public static interpretTreeCanopy(canopyPct: number): MetricInterpretation {
    let category = 'Moderate Canopy Cover';
    let status: MetricInterpretation['status'] = 'normal';
    let summary = `Tree canopy cover is measured at ${canopyPct}%.`;
    let whyItMatters = 'Vegetation canopies provide physical shade and microclimate evapotranspiration cooling.';
    let recommendation = 'Preserve existing urban greenery.';

    if (canopyPct >= 40) {
      category = 'Dense Urban Forest Oasis';
      status = 'optimal';
      summary = `High canopy density (${canopyPct}%): Substantial natural shade and microclimate cooling buffer.`;
      whyItMatters = 'Canopy intercepts up to 90% of solar radiation, lowering ground temperatures by 3-6°C.';
      recommendation = 'Model site for urban biophilic cooling and community recreation.';
    } else if (canopyPct <= 12) {
      category = 'Severe Canopy Deficit';
      status = 'critical';
      summary = `Canopy deficit (${canopyPct}%): Highly exposed urban surface with minimal vegetative shade.`;
      whyItMatters = 'Lack of foliage leaves impervious pavements fully exposed to intense radiative solar gain.';
      recommendation = 'Immediate target for street tree planting programs and engineered shade sails.';
    }

    return {
      metricKey: 'treeCanopy',
      label: 'Urban Tree Canopy',
      value: `${canopyPct}%`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 95,
    };
  }

  /**
   * 14. Precipitation
   */
  public static interpretPrecipitation(precipMm: number, probabilityPct?: number): MetricInterpretation {
    let category = 'Dry / Clear';
    let status: MetricInterpretation['status'] = 'optimal';
    let summary = `Precipitation rate is ${precipMm.toFixed(1)} mm/h${probabilityPct !== undefined ? ` (${probabilityPct}% probability)` : ''}.`;
    let whyItMatters = 'Precipitation drives latent evaporative cooling and stormwater surface runoff.';
    let recommendation = 'Dry conditions favorable for outdoor operations.';

    if (precipMm >= 15) {
      category = 'Torrential Downpour';
      status = 'critical';
      summary = `Heavy precipitation (${precipMm.toFixed(1)} mm/h): Urban flash flooding and drainage surcharge risk.`;
      whyItMatters = 'Exceeds urban soil infiltration capacity, triggering rapid impervious surface runoff.';
      recommendation = 'Inspect stormwater catchment basins and avoid low-lying flood corridors.';
    } else if (precipMm >= 4) {
      category = 'Moderate Rain';
      status = 'moderate';
      summary = `Moderate rainfall (${precipMm.toFixed(1)} mm/h) providing convective atmospheric cooling.`;
      whyItMatters = 'Washes out airborne particulates and temporarily lowers surface heat.';
      recommendation = 'Standard rain precautions for transit and logistics.';
    }

    return {
      metricKey: 'precipitation',
      label: 'Precipitation',
      value: `${precipMm.toFixed(1)} mm/h`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 96,
    };
  }

  /**
   * 15. Nature / Environmental Pulse Score
   */
  public static interpretEnvironmentalPulse(pulseScore: number): MetricInterpretation {
    let category = 'Good Environmental Vitality';
    let status: MetricInterpretation['status'] = 'optimal';
    let summary = `Composite Environmental Pulse score is ${pulseScore}/100. Balanced ecosystem vitality.`;
    let whyItMatters = 'Synthesizes thermal comfort, air purity, vegetation density, and moisture balance into a single index.';
    let recommendation = 'Conditions support resilient civic activity and natural ecological equilibrium.';

    if (pulseScore <= 40) {
      category = 'Acute Environmental Stress';
      status = 'critical';
      summary = `Severe environmental stress (${pulseScore}/100): Compound stressors across heat, air quality, or canopy deficit.`;
      whyItMatters = 'Multiple microclimate vectors exceed comfort thresholds simultaneously.';
      recommendation = 'Activate municipal heat-health protocols and monitor vulnerable populations.';
    } else if (pulseScore <= 60) {
      category = 'Moderate Stress / Degradation';
      status = 'warning';
      summary = `Moderate environmental stress (${pulseScore}/100): One or more microclimate dimensions require attention.`;
      whyItMatters = 'Elevated heat or reduced canopy density limits overall urban comfort.';
      recommendation = 'Review driver breakdown to address the primary limiting factor.';
    } else if (pulseScore >= 80) {
      category = 'Optimal Urban Oasis';
      status = 'optimal';
      summary = `Optimal vitality (${pulseScore}/100): High canopy shading, clean air, and balanced thermal metrics.`;
      whyItMatters = 'Exemplary biophysical microclimate conditions.';
      recommendation = 'Ideal environmental baseline.';
    }

    return {
      metricKey: 'environmentalPulse',
      label: 'Environmental Pulse',
      value: `${pulseScore}/100`,
      category,
      summary,
      whyItMatters,
      recommendation,
      status,
      confidence: 95,
    };
  }

  /**
   * 16. Environmental Anomaly Dispatcher
   */
  public static interpretEnvironmentalAnomaly(metricKey: string, value: number, baseline?: number): MetricInterpretation {
    const delta = baseline !== undefined ? value - baseline : 0;
    const isElevated = delta > 0;

    return {
      metricKey: 'environmentalAnomaly',
      label: `Anomaly: ${metricKey}`,
      value: `${value}`,
      category: isElevated ? 'Positive Departure' : 'Negative Departure',
      summary: `Observed ${metricKey} at ${value} (${isElevated ? '+' : ''}${delta.toFixed(1)} departure from baseline).`,
      whyItMatters: 'Statistical anomalies indicate acute localized microclimate shifts.',
      recommendation: 'Track rate-of-change and cross-reference with FortyGuard spatial mesh.',
      status: Math.abs(delta) > 3 ? 'warning' : 'normal',
      confidence: 94,
    };
  }

  /**
   * Generic dispatcher by key
   */
  public static interpretByKey(key: string, value: any, context?: Record<string, any>): MetricInterpretation {
    const numVal = typeof value === 'number' ? value : parseFloat(value) || 0;
    switch (key.toLowerCase()) {
      case 'temperature':
      case 'ambienttemp':
      case 'temp':
        return this.interpretTemperature(numVal);
      case 'feelslike':
      case 'apparenttemp':
        return this.interpretFeelsLike(numVal, context?.ambientTemp ?? numVal);
      case 'humidity':
      case 'relativehumidity':
        return this.interpretHumidity(numVal);
      case 'dewpoint':
        return this.interpretDewPoint(numVal);
      case 'wind':
      case 'windspeed':
        return this.interpretWind(numVal, context?.gustKmh);
      case 'pressure':
      case 'pressurehpa':
        return this.interpretPressure(numVal);
      case 'heatindex':
        return this.interpretHeatIndex(numVal);
      case 'wetbulb':
        return this.interpretWetBulb(numVal);
      case 'airquality':
      case 'aqi':
        return this.interpretAirQuality(numVal);
      case 'uv':
      case 'uvindex':
        return this.interpretUV(numVal);
      case 'solarirradiance':
      case 'solar_ghi':
      case 'ghi':
        return this.interpretSolarIrradiance(numVal);
      case 'heatisland':
      case 'surfaceheatanomaly':
      case 'uhidelta':
        return this.interpretHeatIsland(numVal, context?.surfaceTemp);
      case 'treecanopy':
      case 'canopy':
      case 'ndvi':
        return this.interpretTreeCanopy(numVal);
      case 'precipitation':
      case 'precip':
        return this.interpretPrecipitation(numVal, context?.precipProb);
      case 'environmentalpulse':
      case 'pulse':
        return this.interpretEnvironmentalPulse(numVal);
      default:
        return this.interpretTemperature(numVal);
    }
  }
}
