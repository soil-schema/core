import Directive from './Directive.js';
import NodeStructure from '../structure/Node.js';
import TokenProvider from './TokenProvider.js';
import TokenSeeker from './TokenSeeker.js';

export type DirectiveBuilder = (directive: Directive) => void;

export default class Grammer {

  directives: Directive[] = [];

  directive(annotations: string[], name: string, definition: RegExp | undefined, builder: (directive: Directive) => void): Grammer {
    const directive = new Directive(name, definition);
    annotations.forEach(name => directive.annotation(name))
    builder(directive);
    this.directives.push(directive);
    return this;
  }

  build(provider: TokenProvider): NodeStructure[] {

    const seeker = new TokenSeeker(provider);
    let result = [] as NodeStructure[];

    // Source -> Directive*
    while (seeker.token()) {
      const directiveNode = this.testDirectives(seeker);
      if (typeof directiveNode != 'undefined') {
        result.push(directiveNode);
      } else {
        // Mismatch tokens
        seeker.next();
      }
    }

    return result;
  }

  private testDirectives(seeker: TokenSeeker): NodeStructure | undefined {

    for (const directive of this.directives) {
      seeker.stack();
      const result = directive.parse(seeker)

      if (typeof result != 'undefined') {
        seeker.commit();
        return result;
      } else {
        seeker.rollback();
      }
    }

    return undefined;
  }
}