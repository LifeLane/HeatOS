const fs = require('fs');
let code = fs.readFileSync('src/components/map/LivingEnvironmentMap.tsx', 'utf8');

code = code.replace(/set'now'/g, 'setTimeHorizon');
code = code.replace(/Map'now'/g, 'MapTimeHorizon');
code = code.replace(/const \['now', setTimeHorizon\] = useState<MapTimeHorizon>\('now'\);/g, 'const [timeHorizon, setTimeHorizon] = useState<MapTimeHorizon>(\'now\');');
code = code.replace(/\['now'\]/g, 'timeHorizon'); // Maybe? Let's be careful.

fs.writeFileSync('src/components/map/LivingEnvironmentMap.tsx', code);
