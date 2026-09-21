const fs = require('fs');
const path = require('path');
const dir = 'supabase/migrations';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));

for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  const lines = text.split('\n');
  let lastDropName = '';
  let lastDropTable = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // drop policy if exists "name" on schema.table;
    const dropMatch = line.match(/drop\s+policy\s+if\s+exists\s+"([^"]+)"\s+on\s+([a-z0-9_.]+)/);
    if (dropMatch) {
      lastDropName = dropMatch[1];
      lastDropTable = dropMatch[2].replace('public.', '');
    }

    // create policy "name" ... on schema.table
    const createMatch = line.match(/create\s+policy\s+"([^"]+)"/);
    if (createMatch) {
      const createName = createMatch[1];
      let createTable = '';
      
      // Look for 'on schema.table' in this line or next 2 lines
      for (let j = 0; j < 3; j++) {
        if (i + j < lines.length) {
          const onMatch = lines[i+j].toLowerCase().match(/\s+on\s+([a-z0-9_.]+)/);
          if (onMatch) {
            createTable = onMatch[1].replace('public.', '');
            break;
          }
        }
      }

      if (createName !== lastDropName || createTable !== lastDropTable) {
        console.log(`MISMATCH in ${f}:`);
        console.log(`  DROP   was for: "${lastDropName}" on ${lastDropTable}`);
        console.log(`  CREATE is for : "${createName}" on ${createTable}`);
      }
    }
  }
}
