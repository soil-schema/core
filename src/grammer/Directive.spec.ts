import { expect } from 'chai';
import Directive from './Directive.js';
import TokenProvider from './TokenProvider.js';
import TokenSeeker from './TokenSeeker.js';

describe('Directive', () => {
  it('.constructor', () => {
    const directive = new Directive('entity');
    expect(directive.name).to.equal('entity')
  });

  it('#annotation', () => {
    const directive = new Directive('entity')
      .annotation('test');

    expect(directive.annotations.length).to.equal(1);
    expect(directive.annotations).to.contain('test');
  });

  it('#directive', () => {
    const directive = new Directive('entity')
      .directive([], 'field', /^\s*(?<name>[a-z][a-z0-9_]*)\s*:\s*(?<type>[A-Z][A-Za-z0-9\.]*)\s*$/);

    expect(directive.directives.length).to.equal(1);
    expect(directive.directives.map(directive => directive.name)).to.contain('field');
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

  it('#parse basic', () => {
    const directive = new Directive('entity', /^[A-Z][a-z]+$/);

    const provider = new MockTokenProvider([
      'entity', ' ', 'Name',
    ]);
    const seeker = new TokenSeeker(provider);
    const result = directive.parse(seeker);

    expect(result?.directive).to.equal('entity');
    expect(result?.definition.body).to.equal('Name');
  });

  it('#parse with annotation', () => {
    const directive = new Directive('entity', /^[A-Z][a-z]+$/)
      .annotation('mocked')

    const provider = new MockTokenProvider([
      'mocked', ' ', 'entity', ' ', 'Name',
    ]);
    const seeker = new TokenSeeker(provider);
    const result = directive.parse(seeker);

    expect(result?.annotation).to.equal('mocked');
  });

  it('#parse with block and subdirective', () => {
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

    expect(result?.block.length).to.equal(1);
    expect(result?.block[0].directive).to.equal('field');
    expect(result?.block[0].definition.body).to.equal('id');
  });
});