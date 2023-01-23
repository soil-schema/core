import chalk from 'chalk';

/* c8 ignore start */

export class Token {

  body: string = '';

  constructor() {}

  capture(source: string, offset: number): number | undefined {
    return;
  }

  inspect(): string {
    return `? ${this.body}`;
  }
}

export class DeclarationToken extends Token {

  capture(source: string, offset: number): number | undefined {
    const match = source.substring(offset).match(/^([^\n;{}]+[^\s;{}])((?=\s*(?:\r?\n|;|{|}))|$)/)
    if (match === null) {
      return;
    }
    const declaration = match[0];
    this.body = declaration;
    return offset + declaration.length;
  }

  inspect(): string {
    return chalk.yellow(`D ${this.body}`);
  }
}

export class SeparatorToken extends Token {

  capture(source: string, offset: number): number | undefined {
    const match = source.substring(offset).match(/^[\s;]+/)
    if (match === null) {
      return;
    }
    const separator = match[0];
    this.body = separator;
    return offset + separator.length;
  }

  inspect(): string {
    return chalk.gray(`S ${this.body.trim() || '<space>'}`);
  }
}

export class BlockOpenToken extends Token {

  capture(source: string, offset: number): number | undefined {
    if (source[offset] == '{') {
      this.body = '{';
      return offset + 1;
    }
  }

  inspect(): string {
    return chalk.blue('B {');
  }
}

export class BlockCloseToken extends Token {

  capture(source: string, offset: number): number | undefined {
    if (source[offset] == '}') {
      this.body = '}';
      return offset + 1;
    }
  }

  inspect(): string {
    return chalk.blue('B }');
  }
}

export class DescriptionToken extends Token {

  capture(source: string, offset: number): number | undefined {
    const match = source.substring(offset).match(/^\/\/\/\s+[^\n]+/)
    if (match === null) {
      return;
    }
    this.body = match[0];
    return offset + match[0].length;
  }

  inspect(): string {
    return chalk.gray(`C ${this.body}`);
  }
}

export class CommentToken extends Token {

  capture(source: string, offset: number): number | undefined {
    const match = source.substring(offset).match(/^\/\/\s+[^\n]+/)
    if (match === null) {
      return;
    }
    this.body = match[0];
    return offset + match[0].length;
  }

  inspect(): string {
    return chalk.gray(`C ${this.body}`);
  }
}

/* c8 ignore stop */

export default (source: string): Token[] => {

  const tokens = [] as Token[];
  var offset = 0;

  const capture = (token: Token): boolean => {
    const nextOffset = token.capture(source, offset);
    if (nextOffset) {
      tokens.push(token);
      offset = nextOffset;
      return true;
    }
    return false;
  }

  while (offset < source.length) {
    const c = source[offset];

    // Comments (description and normal)
    if (c == '/') {
      if (capture(new DescriptionToken())) continue;
      if (capture(new CommentToken())) continue;
    }

    if ((/\s/.test(c) || c == ';') && capture(new SeparatorToken())) continue;

    if (c == '{' && capture(new BlockOpenToken())) continue;
    if (c == '}' && capture(new BlockCloseToken())) continue;

    if (capture(new DeclarationToken())) continue;

    throw new Error(`syntax error: fail to tokenize at ${offset}`);
  }

  return tokens;
}