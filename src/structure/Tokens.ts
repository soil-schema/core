import chalk from 'chalk';

export class Token {

  body: string;

  constructor(body: string) {
    this.body = body;
  }

  get isLineBreak(): boolean { return false }

  inspect(): string {
    return `. ${this.body}`;
  }
}

export class AmbiguousToken extends Token {

  inspect(): string {
    return `A ${this.body}`;
  }
}

export class StringToken extends Token {

  inspect(): string {
    return `S ${chalk.yellow(this.body)}`;
  }
}

export class SeparatorToken extends Token {

  get isLineBreak(): boolean {
    return /^[\n|\r|\r\n]+$/.test(this.body);
  }

  inspect(): string {
    return `. ${chalk.gray('<separator>')}`;
  }
}

export class PunctuationToken extends Token {
  get isBlock(): boolean {
    return this.body == '{' || this.body == '}';
  }
}

export class DescriptionToken extends Token {

  inspect(): string {
    return `D ${chalk.gray(this.body)}`;
  }
}

export class CommentToken extends Token {

  inspect(): string {
    return `C ${chalk.gray(this.body)}`;
  }
}