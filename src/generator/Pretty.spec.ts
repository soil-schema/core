import { expect } from 'chai';
import { describe, it } from 'mocha';
import Pretty from './Pretty.js';

describe('Pretty', () => {

  /// ================

  it('#pretty simple block', () => {
    const source = `
class Person {
var name: String
}
`;
    const result = new Pretty(source).pretty({
      indentBlock: ['{}'],
      comment: ['//', ['/*', '*/']],
    });
    const expected = `
class Person {
  var name: String
}
`.trim();
    expect(result).to.equal(expected);
  });

  /// ================

  it('#pretty joined block', () => {
    const source = `
class Person(
var name: String
) {
Person Content
}
`;
    const result = new Pretty(source).pretty({
      indentBlock: ['{}', '()'],
      comment: ['//', ['/*', '*/']],
    });
    const expected = `
class Person(
  var name: String
) {
  Person Content
}
`.trim();
    expect(result).to.equal(expected);
  });

  /// ================

  it('#pretty with trailing comments', () => {
    const source = `
if (true) { // Condition notes { <- Ignore this !!!
doSomething()
}
`;
    const result = new Pretty(source).pretty({
      indentBlock: ['{}', '()'],
      comment: ['//', ['/*', '*/']],
    });
    const expected = `
if (true) { // Condition notes { <- Ignore this !!!
  doSomething()
}
`.trim();
    expect(result).to.equal(expected);
  });

  /// ================

  it('#pretty broken indents', () => {
    const source = `
{
        too many indent
  {
too less indent
    good indent
  }
  good indent
}
`;
    const result = new Pretty(source).pretty({
      indentBlock: ['{}', '()'],
      comment: ['//', ['/*', '*/']],
    });
    const expected = `
{
  too many indent
  {
    too less indent
    good indent
  }
  good indent
}
`.trim();
    expect(result).to.equal(expected);
  });
});