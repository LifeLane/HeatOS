const fs = require('fs');
let code = fs.readFileSync('src/components/map/LivingEnvironmentMap.tsx', 'utf8');

code = code.replace(/'now'Label:/g, 'timeHorizonLabel:');

fs.writeFileSync('src/components/map/LivingEnvironmentMap.tsx', code);
