const fs = require('fs');

const filePath = 'd:/PROJECTS/Progress/progress/components/RoadmapTimeline.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace text-foreground, bg-foreground, border-foreground with their black equivalents
content = content.replace(/text-foreground/g, 'text-black');
content = content.replace(/bg-foreground/g, 'bg-black');
content = content.replace(/border-foreground/g, 'border-black');
content = content.replace(/var\(--foreground\)/g, 'black');

fs.writeFileSync(filePath, content);
console.log('Fixed colors in RoadmapTimeline.tsx');
