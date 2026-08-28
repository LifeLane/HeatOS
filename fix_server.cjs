const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /forceProvider,\n\s+imageUrl,\n\s+targetedData/,
  "forceProvider,\n        imageUrl,\n        targetedData"
);

code = code.replace(
  /forceProvider,\n\s+targetedData/,
  "forceProvider,\n        imageUrl,\n        targetedData"
);

fs.writeFileSync('server.ts', code);
