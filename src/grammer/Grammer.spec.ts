import { expect } from 'chai';
import Grammer from './Grammer.js';
import TokenProvider from './TokenProvider.js';

describe('Grammer', () => {
  it('.constructor', () => {
    const grammer = new Grammer();
    expect(grammer.directives.length).to.equal(0);
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

  it('#build', () => {
    const grammer = new Grammer()
      .directive([], 'entity', /^(?<name>(?:[A-Z][a-z0-9]+)+)$/, () => {});

    const provider = new MockTokenProvider([
      'entity', ' ', 'Name', ' ', '{', '}',
    ]);

    const result = grammer.build(provider);
    expect(result.length).to.equal(1);
    expect(result[0].directive).to.equal('entity');
    expect(result[0].definition.body).to.equal('Name');
    expect(result[0].definition.name).to.equal('Name');
  });

  it('#build with nested directive', () => {
    const grammer = new Grammer()
      .directive([], 'entity', /^(?<name>(?:[A-Z][a-z0-9]+)+)$/, entity => {
        entity
          .directive([], 'field', /^(?<name>[a-z]+):\s(?<type>[A-Za-z][A-Za-z0-9\-\.]*)$/);
      });

    const provider = new MockTokenProvider([
      'entity', ' ', 'Name', ' ', '{', 'field', 'id:', ' ', 'Int', '}',
    ]);

    const result = grammer.build(provider);
    expect(result.length).to.equal(1);
    expect(result[0].directive).to.equal('entity');
    expect(result[0].definition.body).to.equal('Name');
    expect(result[0].definition.name).to.equal('Name');
    expect(result[0].block[0].directive).to.equal('field');
    expect(result[0].block[0].definition.name).to.equal('id');
    expect(result[0].block[0].definition.type).to.equal('Int');
  });
});