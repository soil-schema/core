import { expect } from 'chai';
import { marked } from 'marked';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import Generator, { Context } from './generator/Generator.js';
import swift from './generator/swift/entry.js';
import kotlin from './generator/kotlin/entry.js';
import grammer from './grammer.js';
import { parse, tokenize } from './parse.js';
import Node from './structure/Node.js';

class Example {
  filename: string = '';
  config: any = {};
  schema: string = '';
  mock?: any = {};

  generated: { [key: string]: string } = {};

  make(langcode: string, ast: Node[]): string {
    switch (langcode) {
      case 'swift': return this.makeSwift(ast);
      case 'kotlin': return this.makeKotlin(ast);
    }
    return '';
  }

  makeSwift(ast: Node[]): string {
    const generator = new Generator(ast);
    swift(generator);
    generator.hookContext('swift:entity:template', (context: Context) => {
      context.addAttribute('strip-comment');
    });
    return generator.generate(this.config.generate?.swift || {}, 'swift')[0].body;
  }

  makeKotlin(ast: Node[]): string {
    const generator = new Generator(ast);
    kotlin(generator);
    generator.hookContext('kotlin:entity:template', (context: Context) => {
      context.addAttribute('strip-comment');
    });
    return generator.generate(this.config.generate?.kotlin || {}, 'kotlin')[0].body;
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

const runExample = async (name: string) => {
  const example = await loadExample(name);
  describe(example.filename, () => {
    const ast = parse(tokenize(example.schema), grammer);
    ['swift', 'kotlin'].forEach(langcode => {
      if (typeof example.generated[langcode] == 'undefined') return;
      it(`generated ${langcode} code matches in \`${langcode} generated\` code block`, () => {
        expect(example.make(langcode, ast).replace(/ /g, '_')).to.equal(example.generated[langcode].replace(/ /g, '_'));
      })
    });
  });
}

describe('examples', async () => {
  const examples = await readdir(path.join(process.cwd(), 'examples'));
  await Promise.all(examples.map(name => runExample(name)));
});