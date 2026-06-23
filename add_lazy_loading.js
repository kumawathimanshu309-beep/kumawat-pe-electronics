const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ejs')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./views');
let total = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content.replace(/<img(?![^>]*?loading=['"]lazy['"])/gi, '<img loading="lazy"');
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    total++;
  }
});
console.log('Updated ' + total + ' files');
