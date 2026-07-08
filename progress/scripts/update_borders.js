const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory() && !dirPath.includes('node_modules') && !dirPath.includes('.next')) {
        walkDir(dirPath, callback);
    } else {
        callback(path.join(dir, f));
    }
  });
}

walkDir('d:/PROJECTS/Progress/progress', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace border-[3px] with border-4
    content = content.replace(/border-\[3px\]/g, 'border-4');
    content = content.replace(/border-b-\[3px\]/g, 'border-b-4');
    content = content.replace(/border-t-\[3px\]/g, 'border-t-4');
    content = content.replace(/border-l-\[3px\]/g, 'border-l-4');
    content = content.replace(/border-r-\[3px\]/g, 'border-r-4');
    
    // Replace border-[4px] with border-4
    content = content.replace(/border-\[4px\]/g, 'border-4');
    content = content.replace(/border-b-\[4px\]/g, 'border-b-4');
    content = content.replace(/border-t-\[4px\]/g, 'border-t-4');
    content = content.replace(/border-l-\[4px\]/g, 'border-l-4');
    content = content.replace(/border-r-\[4px\]/g, 'border-r-4');
    
    // Replace border-[2px] with border-2
    content = content.replace(/border-\[2px\]/g, 'border-2');
    content = content.replace(/border-b-\[2px\]/g, 'border-b-2');
    content = content.replace(/border-t-\[2px\]/g, 'border-t-2');
    content = content.replace(/border-l-\[2px\]/g, 'border-l-2');
    content = content.replace(/border-r-\[2px\]/g, 'border-r-2');
    
    // Ensure shadows match standard (already done or uses brutal-shadow)
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated borders in ${filePath}`);
    }
  }
});
