const fs = require('fs');
const path = require('path');
const dir = 'supabase/migrations';
const files = fs.readdirSync(dir);
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();
    if (line.startsWith('create policy')) {
      let foundDrop = false;
      for (let j = Math.max(0, i - 10); j < i; j++) {
        if (lines[j].toLowerCase().includes('drop policy if exists')) {
          foundDrop = true;
          break;
        }
      }
      if (!foundDrop) {
        console.log('NO DROP:', f, i + 1, lines[i]);
      }
    }
  }
}
