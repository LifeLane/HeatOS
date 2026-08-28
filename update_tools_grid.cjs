const fs = require('fs');

let content = fs.readFileSync('src/components/views/ToolsView.tsx', 'utf8');

// The original line is <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
content = content.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">/g,
  '<div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 sm:gap-6 items-stretch">'
);

fs.writeFileSync('src/components/views/ToolsView.tsx', content);
