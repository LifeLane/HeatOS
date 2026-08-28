const fs = require('fs');
let code = fs.readFileSync('src/components/map/LivingEnvironmentMap.tsx', 'utf8');
code = code.replace(/<TimePlaybackControl[\s\S]*?\/>/g, '');
code = code.replace(/{\/\* Right \/ Center: Temporal Time Controller \*\/}/g, '');
code = code.replace(/<div className="pointer-events-auto self-end sm:self-auto w-full sm:w-auto">\s*<\/div>/g, '');
fs.writeFileSync('src/components/map/LivingEnvironmentMap.tsx', code);
