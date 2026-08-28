const fs = require('fs');
let code = fs.readFileSync('src/components/map/LivingEnvironmentMap.tsx', 'utf8');

// Remove Point-Level Projection Notice
code = code.replace(/\{\s*\/\* ---------------- POINT-LEVEL PROJECTION NOTICE.*?\{\s*timeHorizon !== 'now'[\s\S]*?\}\s*/g, '');
code = code.replace(/const \[timeHorizon, setTimeHorizon\] = useState<MapTimeHorizon>\('now'\);/g, '');
code = code.replace(/timeHorizon={timeHorizon}/g, '');

fs.writeFileSync('src/components/map/LivingEnvironmentMap.tsx', code);
