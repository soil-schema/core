import Node from '../structure/Node.js';
import TokenSeeker from './TokenSeeker.js';

export default class Directive {

  name: string;
  annotations: string[] = [];
  directives: Directive[] = [];
  definition: RegExp | undefined

  constructor(name: string, definition?: RegExp | undefined) {
    this.name = name;
    this.definition = definition;
  }

  annotation(name: string): Directive {
    this.annotations.push(name);
    return this;
  }

  directive(annotations: string[], name: string, definition?: RegExp | undefined): Directive {
    const directive = new Directive(name, definition);
    annotations.forEach(name => directive.annotation(name))
    this.directives.push(directive);
    return this;
  }

  parse(seeker: TokenSeeker): Node | undefined {
    const tokens = seeker.lookahead(2, { ignoreWhitespaces: true });

    if (!this.check(tokens)) return void 0;

    seeker.skipWhitespace();
    let annotation = undefined;
    if (this.annotations.includes(tokens[0])) {
      annotation = tokens[0];
      seeker.next().skipWhitespace();
    }
    seeker.next();

    let definition = "";
    while (seeker.token()) {
      const token = seeker.token() ?? "\n"
      if (/\r?\n/.test(token) || token == '{' || token == '}') break;
      definition += token;
      seeker.next();
    }

    const definitionMatch = this.match(definition.trim());

    if (typeof definitionMatch != 'undefined') {
      const definitionBody = Object.assign({
        body: definitionMatch[0],
      }, definitionMatch.groups ?? {});

      const node = new Node(this.name, definitionBody, annotation);

      if (seeker.token() == '{') this.parseBlock(node, seeker);

      return node;

    }

    return undefined;
  }

  parseBlock(node: Node, seeker: TokenSeeker) {
    if (seeker.token() != '{') return;

    seeker.next();

    while (seeker.token() != '}' && typeof seeker.token() == 'string') {
      for (const directive of this.directives) {
        seeker.stack();
        const result = directive.parse(seeker);
        if (typeof result != 'undefined') {
          seeker.commit();
          node.addChild(result);
        } else {
          seeker.rollback();
        }
      }
      seeker.next();
    }
  }

  private check(tokens: string[]): boolean {
    if (tokens.length == 0) return false
    if (tokens.length == 1) {
      return tokens[0] == this.name;
    }
    if (tokens.length == 2) {
      return tokens[0] == this.name || (this.check([tokens[1]]) && this.annotations.includes(tokens[0]));
    }
    return false;
  }

  private match(definition: string): RegExpMatchArray | undefined {
    return definition.match(this.definition ?? /^\s*$/) ?? void 0;
  }
}