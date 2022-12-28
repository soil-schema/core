import Grammer from './grammer/Grammer.js';
import TokenProvider from './grammer/TokenProvider.js';
import Node from './structure/Node.js';
import { Token, StringToken, AmbiguousToken, SeparatorToken, PunctuationToken, DescriptionToken, CommentToken } from './structure/Tokens.js';

// - TokenSeeker

export class TokenSeeker implements TokenProvider {

  private _tokens: Token[];

  constructor (tokens: Token[]) {
    this._tokens = tokens;
  }

  // - TokenProvider

  token(offset: number): string | undefined {
    return this._tokens[offset]?.body
  }
}

/**
 * Parse tokens to node tree structure by specify Grammer.
 * @param tokens 
 * @param grammer 
 * @returns 
 */
export const parse = function(tokens: Token[], grammer: Grammer): Node[] {
  return grammer.build(new TokenSeeker(tokens));
}

/**
 * Tokenize source without engine.
 * 
 * - Tokenize string, number, boolean and null literal.
 * - Tokenize comments.
 * - Tokenize block start / end punctuations, `{` and `}`.
 * - Tokenize list start / end punctuations, `[` and `]`.
 * - Strip tokens by each lines.
 * @param source string
 */
export const tokenize = function(source: string): Token[] {
  const tokens = [] as Token[];

  let timedout = false
  setTimeout(() => timedout = true, 1000);

  var offset = 0;
  while (offset < source.length && !timedout) {
    const c = source[offset];

    // Comments (description and normal)
    if (`${c}${source[offset+1]}` == '//') {
      if (source[offset+2] == '/') { // match `///`
        tokens.unshift(new DescriptionToken(''));
      } else {
        tokens.unshift(new CommentToken(''));
      }

      while (offset < source.length && source[offset] != '\n') {
        tokens[0].body += source[offset];
        offset += 1;
      }

      continue;
    }

    if (tokens[0] instanceof SeparatorToken && (c == '"' || c == '\'')) {
      tokens.unshift(new StringToken(c));
      do {
        offset += 1;
        tokens[0].body += source[offset];
      } while (offset < source.length && source[offset] != c)

      continue;
    }

    offset += 1;

    // Separator
    if (/^\s/.test(c)) {
      if (!(tokens[0] instanceof SeparatorToken)) {
        tokens.unshift(new SeparatorToken(''));
      }
      tokens[0].body += c;
      continue;
    }

    // Punctuations
    if (['{', '}', '[', ']'].includes(c)) {
      tokens.unshift(new PunctuationToken(c));
      continue;
    }

    // Ambiguous
    if (!(tokens[0] instanceof AmbiguousToken)) {
      tokens.unshift(new AmbiguousToken(''));
    }
    tokens[0].body += c;
  }

  while (tokens[0] instanceof SeparatorToken) {
    tokens.shift();
  }

  tokens.reverse()

  while (tokens[0] instanceof SeparatorToken) {
    tokens.shift();
  }

  return tokens;
}