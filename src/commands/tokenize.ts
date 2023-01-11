import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { tokenize } from '../parse.js';
import chalk from 'chalk';

type TokenizeOptions = {
  config: string;
};

export default (files: string[], options: TokenizeOptions) => {
  files
    .map(file => path.join(process.cwd(), file))
    .forEach(async filepath => {
      const filename = path.relative(process.cwd(), filepath);
      const logs: string[] = [];
      try {
        logs.push(chalk.bold(`\r\n==== Tokenize: ${filename}`));
        const tokens = tokenize(await readFile(filepath, { encoding: 'utf-8' }));
        tokens.forEach(token => logs.push(token.inspect()));
      } catch(error: any) {
        if (error.code == 'ENOENT' && error.syscall == 'open') {
          logs.push(chalk.red(`ERROR: File not found - ${filename}`));
        } else {
          logs.push(error);
        }
      }
    });
}