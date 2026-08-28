const fs = require('fs');
let code = fs.readFileSync('src/components/map/LivingEnvironmentMap.tsx', 'utf8');

const regex = /useEffect\(\(\) => \{\s*\/\* Simulate shifting environmental intensity.*?\},\s*\[currentLocation, mapState, 'now'\]\);/gs;
code = code.replace(regex, '');

fs.writeFileSync('src/components/map/LivingEnvironmentMap.tsx', code);
