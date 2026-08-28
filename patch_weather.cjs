const fs = require('fs');

let content = fs.readFileSync('src/components/views/WeatherView.tsx', 'utf8');

const replacements = [
  { search: 'id="weather-metric-temp"', replace: 'id="weather-metric-temp"\n              metricKey="temperature"' },
  { search: 'id="weather-metric-humidity"', replace: 'id="weather-metric-humidity"\n              metricKey="humidity"' },
  { search: 'id="weather-metric-wind"', replace: 'id="weather-metric-wind"\n              metricKey="wind_speed"' },
  { search: 'id="weather-metric-dewpoint"', replace: 'id="weather-metric-dewpoint"\n              metricKey="dew_point"' },
  { search: 'id="weather-metric-pressure"', replace: 'id="weather-metric-pressure"\n              metricKey="pressure"' },
  { search: 'id="weather-metric-heatindex"', replace: 'id="weather-metric-heatindex"\n              metricKey="heat_index"' },
  { search: 'id="weather-metric-wetbulb"', replace: 'id="weather-metric-wetbulb"\n              metricKey="wet_bulb"' },
  { search: 'id="weather-metric-aqi"', replace: 'id="weather-metric-aqi"\n              metricKey="air_quality"' },
  { search: 'id="weather-metric-solar"', replace: 'id="weather-metric-solar"\n              metricKey="solar_irradiance"' },
  { search: 'id="weather-metric-uv"', replace: 'id="weather-metric-uv"\n              metricKey="uv_index"' },
  { search: 'id="weather-metric-uhi"', replace: 'id="weather-metric-uhi"\n              metricKey="heat_island"' },
  { search: 'id="weather-metric-canopy"', replace: 'id="weather-metric-canopy"\n              metricKey="canopy_cover"' },
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

fs.writeFileSync('src/components/views/WeatherView.tsx', content);
