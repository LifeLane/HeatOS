const fs = require('fs');

let content = fs.readFileSync('src/components/views/HomeView.tsx', 'utf8');

const replacements = [
  { search: 'id: \'pillar-heat\'', replace: 'metricKey: \'heat_island\',\n      id: \'pillar-heat\'' },
  { search: 'id: \'pillar-air\'', replace: 'metricKey: \'air_quality\',\n      id: \'pillar-air\'' },
  { search: 'id: \'pillar-water\'', replace: 'metricKey: \'humidity\',\n      id: \'pillar-water\'' },
  { search: 'onClick={handleInspectZone}', replace: 'metricKey={pillar.metricKey}' },
];

replacements.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

fs.writeFileSync('src/components/views/HomeView.tsx', content);
