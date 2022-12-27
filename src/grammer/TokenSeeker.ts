import TokenProvider from './TokenProvider.js';

type LookaheadOptions = {
  ignoreWhitespaces?: boolean;
}

export default class TokenSeeker implements TokenProvider {

  private _cursor: number[] = [0];
  private _provider: TokenProvider;

  constructor(provider: TokenProvider) {
    this._provider = provider
  }

  token(offset?: number): string | undefined {
    return this._provider.token(this._cursor[0] + (offset ?? 0))
  }

  next(offset?: number): TokenSeeker {
    this._cursor[0] += offset ?? 1;
    return this;
  }

  skipWhitespace(): TokenSeeker {
    while (/^\s+$/.test(this.token() ?? "")) {
      this.next();
    }
    return this;
  }

  // Stack current offset.
  stack(): TokenSeeker {
    this._cursor.unshift(this._cursor[0]);
    return this;
  }

  // Drop current and revert previous stacked offset. (rollback offset)
  rollback(): TokenSeeker {
    this._cursor.shift();
    return this;
  }

  // Commit current offset.
  commit(): TokenSeeker {
    const stack = this._cursor.shift();
    if (typeof stack != 'undefined') {
      this._cursor[0] = stack;
    }
    return this;
  }

  lookahead(length: number, options: LookaheadOptions = {}): string[] {
    var result = [] as string[];
    var offset = 0;
    const { ignoreWhitespaces = false } = options;
    while (result.length < length) {
      const token = this.token(offset);
      if (typeof token == 'undefined') { return result }
      offset += 1;
      if (ignoreWhitespaces && /^\s+$/.test(token)) {
        continue; // ignore whitespace
      }
      result.push(token);
    }
    return result
  }

  // for Debug

  inspect(): string {
    return `(offset: ${this._cursor}, token: ${this.token()})`
  }
}