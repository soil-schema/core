import { expect } from 'chai';
import TokenProvider from './TokenProvider.js';
import TokenSeeker from './TokenSeeker.js';

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

describe('TokenSeeker', () => {
  it('#stack and #rollback', () => {
    const mock = new MockTokenProvider([
      'a', 'b', 'c', 'd', 'f',
    ]);
    const seeker = new TokenSeeker(mock);

    expect(seeker.token()).to.equal('a');
    expect(seeker.next().token()).to.equal('b');
    expect(seeker.stack().next().token()).to.equal('c');
    expect(seeker.rollback().token()).to.equal('b');
  });

  it('#stack and #commit', () => {
    const mock = new MockTokenProvider([
      'a', 'b', 'c', 'd', 'f',
    ]);
    const seeker = new TokenSeeker(mock);

    expect(seeker.token()).to.equal('a');
    expect(seeker.next().token()).to.equal('b');
    expect(seeker.stack().next().token()).to.equal('c');
    expect(seeker.commit().token()).to.equal('c');
  });
});