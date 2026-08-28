const fs = require('fs');
let prov = fs.readFileSync('src/server/fortyguard/provider.ts', 'utf8');

// Fix API Error type
prov = prov.replace(/FortyGuardError, FortyGuardAPIError/g, 'FortyGuardError');
prov = prov.replace(/err instanceof FortyGuardAPIError/g, 'err instanceof FortyGuardError');

// Fix Heatmap request
prov = prov.replace(/lat: params\.latitude,[\s\S]*?lon: params\.longitude,[\s\S]*?radius: params\.radius \|\| 1000,/, 'bounds: params.bounds, geojson: params.geojson,');

// Fix Heat Intelligence request
prov = prov.replace(/lat: params\.latitude,[\s\S]*?lon: params\.longitude,[\s\S]*?radius: params\.radius \|\| 1000,/, 'latitude: params.latitude, longitude: params.longitude, radius_meters: params.radius_meters || 1000,');

// Fix Satellite request
prov = prov.replace(/lat: params\.latitude,[\s\S]*?lon: params\.longitude,[\s\S]*?radius: params\.radius \|\| 1000,[\s\S]*?date: params\.date,/, 'latitude: params.latitude, longitude: params.longitude, band: params.band,');

// Fix Streetview request
prov = prov.replace(/lat: params\.latitude,[\s\S]*?lon: params\.longitude,[\s\S]*?fov: params\.fov,[\s\S]*?heading: params\.heading,/, 'latitude: params.latitude, longitude: params.longitude, heading: params.heading, pitch: params.pitch,');

// Fix EnvParams request
prov = prov.replace(/lat: params\.latitude,[\s\S]*?lon: params\.longitude,[\s\S]*?date: params\.date,/, 'latitude: params.latitude, longitude: params.longitude, start_date: params.start_date, end_date: params.end_date,');

fs.writeFileSync('src/server/fortyguard/provider.ts', prov);
