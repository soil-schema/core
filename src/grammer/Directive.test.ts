import Directive from './Directive.js';
import TokenProvider from './TokenProvider.js';
import TokenSeeker from './TokenSeeker.js';

test('.constructor', () => {
  const directive = new Directive('entity');
  expect(directive.name).toBe('entity')
});

test('#annotation', () => {
  const directive = new Directive('entity')
    .annotation('test');

  expect(directive.annotations.length).toBe(1);
  expect(directive.annotations).toContain('test');
});

test('#directive', () => {
  const directive = new Directive('entity')
    .directive([], 'field', /^\s*(?<name>[a-z][a-z0-9_]*)\s*:\s*(?<type>[A-Z][A-Za-z0-9\.]*)\s*$/);

  expect(directive.directives.length).toBe(1);
  expect(directive.directives.map(directive => directive.name)).toContain('field');
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

test('#parse basic', () => {
  const directive = new Directive('entity', /^[A-Z][a-z]+$/);

  const provider = new MockTokenProvider([
    'entity', ' ', 'Name',
  ]);
  const seeker = new TokenSeeker(provider);
  const result = directive.parse(seeker);

  expect(result?.directive).toBe('entity');
  expect(result?.definition.body).toBe('Name');
});

test('#parse with annotation', () => {
  const directive = new Directive('entity', /^[A-Z][a-z]+$/)
    .annotation('mocked')

  const provider = new MockTokenProvider([
    'mocked', ' ', 'entity', ' ', 'Name',
  ]);
  const seeker = new TokenSeeker(provider);
  const result = directive.parse(seeker);

  expect(result?.annotation).toBe('mocked');
});

test('#parse with block and subdirective', () => {
  const directive = new Directive('entity', /^[A-Z][a-z]+$/)
    .annotation('mocked')
    .directive([], 'field', /^[a-z]+$/)

  const provider = new MockTokenProvider([
    'mocked', ' ', 'entity', ' ', 'Name', '{',
    'field', ' ', 'id',
    '}',
  ]);
  const seeker = new TokenSeeker(provider);
  const result = directive.parse(seeker);

  expect(result?.block.length).toBe(1);
  expect(result?.block[0].directive).toBe('field');
  expect(result?.block[0].definition.body).toBe('id');
});