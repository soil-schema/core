import chalk from 'chalk';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import grammer from '../grammer.js';
import Generator from '../generator/Generator.js';
import { parse, tokenize } from '../parse.js';
import loadConfig from './config.js';
import Node from '../structure/Node.js';

import swift from '../generator/swift/entry.js';
import kotlin from '../generator/kotlin/entry.js';

type GenerateOptions = {
  langcode: string[];
  config: string;
};

export const loadSource = async (dirpath: string): Promise<string[]> => {
  const files = (await readdir(dirpath))
    .map(name => path.join(dirpath, name));
  let result: string[] = [];
  for (const filepath of files) {
    const filestat = await stat(filepath)
    if (filestat.isDirectory()) {
      result.push(...await loadSource(filepath));
    } else if (filestat.isFile()) {
      result.push(filepath);
    }
  }
  return result;
}

export default async (options: GenerateOptions) => {

  // Prepare Command

  const config = await loadConfig({ config: options.config });

  // Load Schemas as Combined AST

  const files = await loadSource(config.rootDir);
  let ast: Node[] = [];
  await Promise.all(files.map(async filepath => {
    ast.push(...parse(tokenize(await readFile(filepath, { encoding: 'utf-8' })), grammer));
  }));
  console.log(ast);

  // Build Generator

  const generator = new Generator(ast);
  swift(generator);
  kotlin(generator);

  // Generate Client Codes and Export to Files

  await Promise.all(options.langcode.map(async langcode => {
    const files = generator.generate(langcode);

    let exportDir: string = '';
    if (typeof config.exportDir == 'string') {
      exportDir = path.join('.', config.exportDir);
    } else if (typeof config.exportDir == 'object' && typeof config.exportDir[langcode] == 'string') {
      exportDir = path.join('.', config.exportDir[langcode]);
    }

    if (exportDir != '') {
      await Promise.all(files.map(async file => file.write({ exportDir, encoding: 'utf-8' })));
    } else {
      console.error('Unspecified export dir');
    }
  }));
};