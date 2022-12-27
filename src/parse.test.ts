import Grammer from './grammer/Grammer.js';
import { parse, tokenize, TokenSeeker } from './parse.js';

/// - Tokenize

test('tokenize source', () => {
  const tokens = tokenize(`
node Name {
}
`);
  expect(tokens.length).toBe(7);
  expect(tokens.map(token => token.body)).toEqual(['node', ' ', 'Name', ' ', '{', '\n', '}']);
});

test('tokenize source with comments', () => {
  const tokens = tokenize(`
/// This is a description comment.
node Name {
  // This is a normal comment.
}
`);
  expect(tokens.map(token => token.body)).toContain('/// This is a description comment.')
  expect(tokens.map(token => token.body)).toContain('// This is a normal comment.')
});

test('tokenize source with string literal', () => {
  const tokens = tokenize(`
node Name {
  example "Nia"
}
`);
  expect(tokens.map(token => token.body)).toContain('"Nia"')
});

/// - TokenSeeker

test('TokenSeeker is TokenProvider', () => {
  const seeker = new TokenSeeker(tokenize(`
node Name {
}
`));
  expect(seeker.token(0)).toBe('node');
  expect(seeker.token(1)).toBe(' ');
});

// - Parse

test('parse only directive', () => {
  const source = `
node Name
`;
  const grammer = new Grammer()
    .directive([], 'node', /^[A-Za-z]+$/, () => {});

  const ast = parse(tokenize(source), grammer);

  expect(ast.length).toBe(1);
});
