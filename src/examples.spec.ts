import { expect } from 'chai';
import { marked } from 'marked';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import activateSwift from './generator/swift/index.js';
import activateKotlin from './generator/kotlin/index.js';
import grammer from './grammer.js';
import { parse, tokenize } from './parse.js';
import Node from './structure/Node.js';
import { cleanBlueprints, Context, env, hook, HookCallback, run } from './generator/Blueprint.js';

class Example {
  filename: string = '';
  config: any = {};
  schema: string = '';
  mock?: any = {};

  generated: { [key: string]: string } = {};

  make(langcode: string, ast: Node[]): string {
    const context = new Context(langcode, ast[0]);
    context.envKeys.push('strip-comment');
    context.config = Object.assign({}, this.config);
    run(context);
    return context.currentFile?.body || '';
  }
}

const loadExample = async (name: string) => {
  const exampleBody = await readFile(path.join(path.join(process.cwd(), 'examples', name)), { encoding: 'utf-8' });
  let example = new Example();
  example.filename = name;
  marked(exampleBody, {
    walkTokens: (token) => {
      if (token.type != 'code') return;
      if (token.lang == 'soil schema') example.schema = token.text;
      if (token.lang == 'json config') example.config = JSON.parse(token.text);
      if (token.lang == 'json mock') example.mock = JSON.parse(token.text);
      // [!] `xxx generated` -> example.generated['xxx'] = token.text;
      if (/^[a-z]+\s+generated$/.test(token.lang || '')) example.generated[(token.lang || '').replace(/\s+generated$/, '')] = token.text;
    },
  });

  return example;
}

const install = () => {
  cleanBlueprints();
  activateSwift();
  activateKotlin();
}

const runExample = async (name: string) => {
  const example = await loadExample(name);
  describe(example.filename, () => {
    const ast = parse(tokenize(example.schema), grammer);
    ['swift', 'kotlin'].forEach(langcode => {
      if (typeof example.generated[langcode] == 'undefined') return;
      it(`generated ${langcode} code matches in \`${langcode} generated\` code block`, () => {
        install();
        expect(example.make(langcode, ast)).to.equal(example.generated[langcode]);
      })
    });
  });
}

describe('examples', async () => {
  const examples = await readdir(path.join(process.cwd(), 'examples'));
  await Promise.all(examples.map(name => runExample(name)));
});