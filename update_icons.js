const fs = require('fs');
const path = require('path');

function findTsx(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for(let file of list) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if(stat && stat.isDirectory()) {
      results = results.concat(findTsx(file));
    } else if(file.endsWith('.tsx')) {
      results.push(file);
    }
  }
  return results;
}

const files = findTsx('./apps/frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if(!content.includes('lucide-react')) return;
  
  const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
  if(!importMatch) return;
  
  const icons = importMatch[1].split(',').map(i => i.trim());
  let modified = false;
  
  icons.forEach(icon => {
    // Regex pour matcher <IconName ... >
    const regex = new RegExp(`<${icon}(?!\\w)([^>]*)>`, 'g');
    content = content.replace(regex, (match, attrs) => {
      if(attrs.includes('strokeWidth')) return match; // Deja present
      
      // Si c'est une grande icone (size >= 32), on met 1.2
      const sizeMatch = attrs.match(/size=\{?['"]?(\d+)['"]?\}?/);
      let size = 24;
      if (sizeMatch && sizeMatch[1]) {
        size = parseInt(sizeMatch[1]);
      }
      
      const strokeWidth = size >= 32 ? '1.2' : '1.5';
      
      modified = true;
      return `<${icon} strokeWidth={${strokeWidth}}${attrs}>`;
    });
  });
  
  if(modified) {
    fs.writeFileSync(file, content);
    console.log(`Updated icons in ${file}`);
  }
});
