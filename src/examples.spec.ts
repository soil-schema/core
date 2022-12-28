import { expect } from 'chai';
import { marked } from 'marked';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import Generator, { Context } from './generator/Generator.js';
import swift from './generator/swift/entry.js';
import grammer from './grammer.js';
import { parse, tokenize } from './parse.js';
import Node from './structure/Node.js';

class Example {
  config: any = {};
  schema: string = '';
  mock?: any = {};

  generated: { [key: string]: string } = {};

  makeSwift(ast: Node[]): string {
    const generator = new Generator(ast);
    swift(generator);
    generator.hookContext('swift:entity:template', (context: Context) => {
      context.addAttribute('strip-comment');
    });
    return generator.generate('swift')[0].body;
  }
}

let examples: string[] = [];

const loadExample = async (name: string) => {
  if (examples.length == 0) {
    examples = await readdir(path.join(process.cwd(), 'examples'));
  }
  const exampleName = examples.find(filename => filename.replace(/^\d{3}\-(.*)\.md$/, '$1') == name);
  if (typeof exampleName == 'undefined') {
    throw new Error(`Example document ./examples/NNN-${name}.md is not found.`);
  }
  const exampleBody = await readFile(path.join(path.join(process.cwd(), 'examples', exampleName)), { encoding: 'utf-8' });
  let example = new Example();
  marked(exampleBody, {
    walkTokens: (token) => {
      if (token.type != 'code') return;
      if (token.lang == 'soil schema') example.schema = token.text;
      if (token.lang == 'swift generated') example.generated['swift'] = token.text;
      if (token.lang == 'kotlin generated') example.generated['kotlin'] = token.text;
      if (token.lang == 'json config') example.config = JSON.parse(token.text);
      if (token.lang == 'json mock') example.mock = JSON.parse(token.text);
    },
  });

  return example;
}

describe('examples', () => {
  it('001-basic.md', async () => {
    const example = await loadExample('basic');
    const ast = parse(tokenize(example.schema), grammer);

    expect(example.makeSwift(ast)).to.equal(example.generated['swift']);
  });
});