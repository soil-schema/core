import { expect } from 'chai';
import Grammer from './grammer/Grammer.js';
import { parse, tokenize, TokenSeeker } from './parse.js';

/// - Tokenize

describe('Tokenize', () => {
  it('tokenize source', () => {
    const tokens = tokenize(`
node Name {
}
`);
    expect(tokens.length).to.equal(7);
    expect(tokens.map(token => token.body)).to.deep.equal(['node', ' ', 'Name', ' ', '{', '\n', '}']);
  });

  it('tokenize source with comments', () => {
    const tokens = tokenize(`
/// This is a description comment.
node Name {
  // This is a normal comment.
}
`);
    expect(tokens.map(token => token.body)).to.contain('/// This is a description comment.')
    expect(tokens.map(token => token.body)).to.contain('// This is a normal comment.')
  });

  it('tokenize source with string literal', () => {
    const tokens = tokenize(`
node Name {
  example "Nia"
}
`);
    expect(tokens.map(token => token.body)).to.contain('"Nia"')
  });
});

/// - TokenSeeker

it('TokenSeeker is TokenProvider', () => {
  const seeker = new TokenSeeker(tokenize(`
node Name {
}
`));
  expect(seeker.token(0)).to.equal('node');
  expect(seeker.token(1)).to.equal(' ');
});

// - Parse

describe('Parse', () => {
  it('parse only directive', () => {
    const source = `
node Name
`;
    const grammer = new Grammer()
      .directive([], 'node', /^[A-Za-z]+$/, () => {});

    const ast = parse(tokenize(source), grammer);

    expect(ast.length).to.equal(1);
  });
});