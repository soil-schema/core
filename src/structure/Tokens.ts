export class Token {

  body: string;

  constructor(body: string) {
    this.body = body;
  }

  get isLineBreak(): boolean { return false }
}

export class AmbiguousToken extends Token {
}

export class StringToken extends Token {
}

export class SeparatorToken extends Token {

  get isLineBreak(): boolean {
    return /^[\n|\r|\r\n]+$/.test(this.body);
  }
}

export class PunctuationToken extends Token {
  get isBlock(): boolean {
    return this.body == '{' || this.body == '}';
  }
}

export class DescriptionToken extends Token {
}

export class CommentToken extends Token {
}