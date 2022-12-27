import os from 'node:os';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Source from './Source.js';

test('#export', async () => {
  const source = new Source('sample.txt', 'content');
  await source.export(os.tmpdir());
  const content = await readFile(path.join(os.tmpdir(), 'sample.txt'), { encoding: 'utf-8' });

  expect(content).toEqual('content');
});