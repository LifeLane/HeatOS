const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /quickQuestionKey,\s+bypassCache,\s+} = req\.body;/g,
  "quickQuestionKey,\n        bypassCache,\n        forceProvider,\n        imageUrl,\n        targetedData\n      } = req.body;"
);

code = code.replace(
  /quickQuestionKey,\n\s+bypassCache\n\s+}\);/g,
  "quickQuestionKey,\n          bypassCache,\n          forceProvider,\n          imageUrl,\n          targetedData\n        });"
);

fs.writeFileSync('server.ts', code);
