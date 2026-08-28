const fs = require('fs');
let code = fs.readFileSync('src/server/fabric/orchestrator.ts', 'utf8');

code = code.replace(
  "const epaProvider = this.registry.get('epa_airnow');",
  "const epaProvider = this.registry.get('purple_air') || this.registry.get('epa_airnow');"
);

code = code.replace(
  "const firmsProvider = this.registry.get('nasa_firms');",
  "const firmsProvider = this.registry.get('nasa_eonet') || this.registry.get('nasa_firms');"
);

fs.writeFileSync('src/server/fabric/orchestrator.ts', code);
