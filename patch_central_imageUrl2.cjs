const fs = require('fs');
let code = fs.readFileSync('src/server/ai/centralAIService.ts', 'utf8');

code = code.replace("imageUrl: req.imageUrl", "imageUrl: request.imageUrl");

fs.writeFileSync('src/server/ai/centralAIService.ts', code);
