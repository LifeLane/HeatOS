const fs = require('fs');
let code = fs.readFileSync('src/components/map/LivingEnvironmentMap.tsx', 'utf8');

code = code.replace(/timeHorizon/g, "'now'");

fs.writeFileSync('src/components/map/LivingEnvironmentMap.tsx', code);
