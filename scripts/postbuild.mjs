#!/usr/bin/env node
import { readdirSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'out';

if (!existsSync(OUT_DIR)) {
  process.exit(0);
}

const removed = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
    } else if (st.isFile()) {
      if (/^__next\.[^/]*\.txt$/.test(entry) || entry === '__next.txt') {
        try {
          unlinkSync(full);
          removed.push(full);
        } catch {
          /* ignore */
        }
      }
    }
  }
}

walk(OUT_DIR);

if (removed.length) {
  console.log(`[postbuild] removed ${removed.length} Next.js debug artifact(s) from ${OUT_DIR}/`);
}
