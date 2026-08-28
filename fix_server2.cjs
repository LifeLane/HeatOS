const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /bypassCache: Boolean\(bypassCache\),\n\s+forceProvider,\n\s+targetedData,/g,
  "bypassCache: Boolean(bypassCache),\n        forceProvider,\n        imageUrl,\n        targetedData,"
);

fs.writeFileSync('server.ts', code);
