const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('JarvisOrb')) {
  code = code.replace(
    "import { CommercialDemoTour } from './components/common/CommercialDemoTour';", 
    "import { CommercialDemoTour } from './components/common/CommercialDemoTour';\nimport { JarvisOrb } from './components/common/JarvisOrb';"
  );
  
  code = code.replace(
    "<OpenDataFabricModal",
    "<JarvisOrb />\n      <OpenDataFabricModal"
  );
  fs.writeFileSync('src/App.tsx', code);
}
