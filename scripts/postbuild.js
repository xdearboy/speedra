#!/usr/bin/env node

import { chmodSync, readFileSync, writeFileSync } from 'node:fs';

const entry = 'dist/index.js';

const content = readFileSync(entry, 'utf8');

if (!content.startsWith('#!/usr/bin/env node')) {
  writeFileSync(entry, `#!/usr/bin/env node\n${content}`, 'utf8');
}

try {
  chmodSync(entry, 0o755);
} catch {}
