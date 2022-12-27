import Node from '../structure/Node.js';
import Generator, { Context, File, Template } from './Generator.js';

test('#render', () => {
  const ast = [
    new Node('entity', { name: 'Sample' }),
  ];
  const generator = new Generator(ast);
  generator.template(new Template('swift', 'entity', (context: Context) => {
    return new File('sample.swift', 'body')
  }));
  const result = generator.generate('swift');
  expect(result[0].filename).toBe('sample.swift');
  expect(result[0].body).toBe('body');
});