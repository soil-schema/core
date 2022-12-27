import Grammer from './Grammer.js';
import TokenProvider from './TokenProvider.js';

test('.constructor', () => {
  const grammer = new Grammer();
  expect(grammer.directives.length).toBe(0);
});

class MockTokenProvider implements TokenProvider {
  tokens: string[];
  _offset: number = 0;

  constructor(tokens: string[]) {
    this.tokens = tokens;
  }

  token(offset: number): string | undefined {
    return this.tokens[offset];
  }
}

test('#build', () => {
  const grammer = new Grammer()
    .directive([], 'entity', /^(?<name>(?:[A-Z][a-z0-9]+)+)$/, () => {});

  const provider = new MockTokenProvider([
    'entity', ' ', 'Name', ' ', '{', '}',
  ]);

  const result = grammer.build(provider);
  expect(result.length).toBe(1);
  expect(result[0].directive).toBe('entity');
  expect(result[0].definition.body).toBe('Name');
  expect(result[0].definition.name).toBe('Name');
});

test('#build with nested directive', () => {
  const grammer = new Grammer()
    .directive([], 'entity', /^(?<name>(?:[A-Z][a-z0-9]+)+)$/, entity => {
      entity
        .directive([], 'field', /^(?<name>[a-z]+):\s(?<type>[A-Za-z][A-Za-z0-9\-\.]*)$/);
    });

  const provider = new MockTokenProvider([
    'entity', ' ', 'Name', ' ', '{', 'field', 'id:', ' ', 'Int', '}',
  ]);

  const result = grammer.build(provider);
  expect(result.length).toBe(1);
  expect(result[0].directive).toBe('entity');
  expect(result[0].definition.body).toBe('Name');
  expect(result[0].definition.name).toBe('Name');
  expect(result[0].block[0].directive).toBe('field');
  expect(result[0].block[0].definition.name).toBe('id');
  expect(result[0].block[0].definition.type).toBe('Int');
});