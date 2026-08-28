const fs = require('fs');
let code = fs.readFileSync('src/server/fabric/registry.ts', 'utf8');

const imports = `
import { EonetProvider } from './providers/eonet.provider';
import { PurpleAirProvider } from './providers/purpleair.provider';
`;

code = code.replace("import { USGSWaterProvider } from './providers/usgs-water.provider';", "import { USGSWaterProvider } from './providers/usgs-water.provider';" + imports);

code = code.replace("this.register(new USGSWaterProvider());", "this.register(new USGSWaterProvider());\n    this.register(new EonetProvider());\n    this.register(new PurpleAirProvider());");

fs.writeFileSync('src/server/fabric/registry.ts', code);
