const fs = require('fs');

let content = fs.readFileSync('src/components/views/DashboardView.tsx', 'utf8');

// Air Quality
content = content.replace(
  `              label="Air Quality"\n              value={currentLocation.aqi.toString()}\n              unit="AQI"\n              icon={<Wind className="w-4 h-4" />}\n              deltaType="neutral"\n              deltaLabel={normalizedState?.currentConditions?.airQuality?.value?.category || 'PM2.5 normal'}`,
  `              label="Air Quality"\n              value={currentLocation.aqi.toString()}\n              unit="AQI"\n              icon={<Wind className="w-4 h-4" />}\n              delta="-4 AQI/hr"\n              deltaType="down"\n              deltaLabel="Improving"\n              sparkline={[60, 58, 54, 52, 48, 45, 42]}\n              category="air"`
);

// Humidity
content = content.replace(
  `              label="Humidity"\n              value={currentLocation.humidity.toString()}\n              unit="%"\n              icon={<Activity className="w-4 h-4" />}\n              deltaType="down"`,
  `              label="Humidity"\n              value={currentLocation.humidity.toString()}\n              unit="%"\n              icon={<Activity className="w-4 h-4" />}\n              delta="-1.5%/hr"\n              deltaType="down"\n              deltaLabel="Drying"\n              sparkline={[65, 66, 64, 63, 61, 60, 58]}\n              category="water"`
);

// Heat Index
content = content.replace(
  `              label="Heat Index"\n              value={normalizedState?.currentConditions?.heatIndex?.value || currentLocation.ambientTemp + 1}\n              unit="°C"\n              icon={<Thermometer className="w-4 h-4" />}\n              deltaType="up"\n              deltaLabel="Feels like"`,
  `              label="Heat Index"\n              value={normalizedState?.currentConditions?.heatIndex?.value || currentLocation.ambientTemp + 1}\n              unit="°C"\n              icon={<Thermometer className="w-4 h-4" />}\n              delta="+1.2°C/hr"\n              deltaType="up"\n              deltaLabel="Warming"\n              sparkline={[28, 29, 29.5, 30.2, 31, 31.8, 32.5]}\n              category="heat"`
);

fs.writeFileSync('src/components/views/DashboardView.tsx', content);
