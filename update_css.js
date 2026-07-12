const fs = require('fs');
const path = require('path');

function findCss(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for(let file of list) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if(stat && stat.isDirectory()) {
      results = results.concat(findCss(file));
    } else if(file.endsWith('.module.css')) {
      results.push(file);
    }
  }
  return results;
}

const files = findCss('./apps/frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  if(content.includes('.filterSelect {')) {
    content = content.replace(/\.filterSelect\s*\{[^}]*\}/g, `.filterSelect {
  padding: 8px 12px;
  border-radius: var(--radius-interactive);
  border: 1px solid transparent;
  background-color: var(--color-bg-subtle);
  font-family: var(--font-body), sans-serif;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  transition: border-color var(--transition-organic), background-color var(--transition-organic), box-shadow var(--transition-organic);
}
.filterSelect:hover {
  background-color: var(--color-bg-base);
  border-color: var(--color-glass-border);
}`);
    modified = true;
  }

  if(content.includes('var(--color-border)')) {
    content = content.replace(/1px solid var\(--color-border\)/g, '1px solid var(--color-glass-border)');
    content = content.replace(/2px solid var\(--color-border\)/g, '1px solid var(--color-glass-border)');
    modified = true;
  }
  
  if(content.includes('.tr:hover')) {
    content = content.replace(/\.tr:hover\s*\{[^}]*\}/g, '');
    modified = true;
  }

  if(modified) {
    fs.writeFileSync(file, content);
    console.log(`Updated CSS in ${file}`);
  }
});
