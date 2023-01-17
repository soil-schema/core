import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { parse, tokenize, grammer } from '../core/index.js';
import loadConfig from './config.js';
import Node from '../structure/Node.js';
import { Context, File, run } from '../generator/Blueprint.js';

import '../generator/swift/index.js';
import '../generator/kotlin/index.js';

type GenerateOptions = {
  langcode: string[];
  config: string;
  debug: boolean;
};

export const loadSource = async (dirpath: string): Promise<string[]> => {
  const files = (await readdir(dirpath))
    .filter(name => name != 'node_modules')
    .map(name => path.join(dirpath, name));
  let result: string[] = [];
  for (const filepath of files) {
    const filestat = await stat(filepath)
    if (filestat.isDirectory()) {
      result.push(...await loadSource(filepath));
    } else if (filestat.isFile() && filepath.endsWith('.soil')) {
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

  // Generate Client Codes and Export to Files

  const root = new Node('root', {});
  ast.forEach(node => root.addChild(node));

  await Promise.all(options.langcode.map(async langcode => {
    const generateConfig: any = Object.assign({}, config, (config.generate || {})[langcode] || {});

    let exportDir: string = '';
    if (typeof config.exportDir == 'string') {
      exportDir = path.resolve(config.exportDir);
    } else if (typeof config.exportDir == 'object' && typeof config.exportDir[langcode] == 'string') {
      exportDir = path.resolve(config.exportDir[langcode]);
    }

    if (exportDir != '') {
      const promises = root.block
        .map(target => new Context(langcode, target))
        .map(context => {
          context.config = Object.assign({}, generateConfig);
          if (options.debug) {
            context.envKeys.push('debug');
          }
          run(context);
          return context.currentFile;
        })
        .filter((file): file is File => !!file)
        .map(async file => file.write({ exportDir, encoding: 'utf-8' }))
      await Promise.all(promises);
    } else {
      console.error('Unspecified export dir');
    }
  }));
};