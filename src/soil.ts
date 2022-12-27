import Generator from './generator/Generator.js';
import swift from './generator/swift/index.js';
import { parse, tokenize } from './parse.js';
import grammer from './grammer.js';

const str = `
entity Sample {}
`;

const ast = parse(tokenize(str), grammer)

console.log(ast);

const generator = new Generator();

swift(generator);

generator
  .generate('swift', ast)
  .forEach(source => {
    console.log(source.buildContent());
  });