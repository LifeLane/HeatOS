const fs = require('fs');

let content = fs.readFileSync('src/components/views/DashboardView.tsx', 'utf8');

const replacements = [
  { search: 'label="Air Quality"', replace: 'metricKey="air_quality"\n              label="Air Quality"' },
  { search: 'label="Humidity"', replace: 'metricKey="humidity"\n              label="Humidity"' },
  { search: 'label="UV Index"', replace: 'metricKey="uv_index"\n              label="UV Index"' },
  { search: 'label="Canopy Cover"', replace: 'metricKey="canopy_cover"\n              label="Canopy Cover"' },
  { search: 'label="Wind Speed"', replace: 'metricKey="wind_speed"\n              label="Wind Speed"' },
  { search: 'label="Heat Index"', replace: 'metricKey="heat_index"\n              label="Heat Index"' },
  { search: 'label="Solar Irradiance"', replace: 'metricKey="solar_irradiance"\n              label="Solar Irradiance"' },
  { search: 'label="Dew Point"', replace: 'metricKey="dew_point"\n              label="Dew Point"' },
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

fs.writeFileSync('src/components/views/DashboardView.tsx', content);
