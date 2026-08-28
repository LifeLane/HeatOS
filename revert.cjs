const fs = require('fs');
let code = fs.readFileSync('src/components/map/LivingEnvironmentMap.tsx', 'utf8');

code = code.replace(/'now'/g, 'timeHorizon');
// wait, I can just replace 'now' with 'timeHorizon' ? that's bad too, what if 'now' was used correctly.
