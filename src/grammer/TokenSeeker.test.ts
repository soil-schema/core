import TokenProvider from "./TokenProvider";
import TokenSeeker from "./TokenSeeker";

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

test('#stack and #rollback', () => {
  const mock = new MockTokenProvider([
    'a', 'b', 'c', 'd', 'f',
  ]);
  const seeker = new TokenSeeker(mock);

  expect(seeker.token()).toBe('a');
  expect(seeker.next().token()).toBe('b');
  expect(seeker.stack().next().token()).toBe('c');
  expect(seeker.rollback().token()).toBe('b');
});

test('#stack and #commit', () => {
  const mock = new MockTokenProvider([
    'a', 'b', 'c', 'd', 'f',
  ]);
  const seeker = new TokenSeeker(mock);

  expect(seeker.token()).toBe('a');
  expect(seeker.next().token()).toBe('b');
  expect(seeker.stack().next().token()).toBe('c');
  expect(seeker.commit().token()).toBe('c');
});