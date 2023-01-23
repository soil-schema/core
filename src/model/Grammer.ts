import SchemaSyntaxError from './SchemaSyntaxError.js';

const DIRECTIVE_DECLARATION = /^(?:(?<annotations>(?:[a-z][a-z\-]*\|)*(?:[a-z][a-z\-]*))\s)?(?<name>[a-z][a-z\-]*)$/

/**
 * Represents the directives that make up the grammar of soil-schema.
 */
export class Directive {

  name: string;
  annotations: string[] = [];
  directives: String[] = [];
  attributes: RegExp | undefined

  private _tester!: RegExp;

  /**
   * @param declaration Directive declaration e.g. `annotation1|annotation2 name`.
   * @param attributes matching pattern for attributes string.
   */
  constructor(declaration: string, attributes?: RegExp | undefined) {
    const match = declaration.match(DIRECTIVE_DECLARATION);
    if (match === null) {
      throw new Error(`Invalid directive declaration: ${declaration}`);
    }
    this.name = match.groups?.name || '';
    this.annotations = (match.groups?.annotations || '').split('|').filter(a => a);
    this.attributes = attributes;

    Object.defineProperty(this, '_tester', {
      value: new RegExp(this.annotations.length > 0 ? `^(?:(${this.annotations.join('|')})\\s+)?${this.name}\\b` : `^${this.name}\\b`),
      enumerable: false,
    });
  }

  /**
   * Test declaration statement.
   * 
   * @param statement 
   * @returns Returns `true` if statement matches this directive declaration. If not, then `false`.
   */
  test(statement: string): boolean {
    if (this._tester.test(statement) == false) return false;
    const declaration = statement.match(this._tester);
    const attributes = statement.substring(declaration![0].length).trim();
    if (attributes) {
      if (typeof this.attributes == 'undefined') {
        return false;
      }
      return this.attributes?.test(attributes);
    }
    return typeof this.attributes == 'undefined';
  }

  /**
   * Parse declaration statement to make `Node`.
   * 
   * @param statement actual declaration statement: "entity Account", "mutable field name: String" ... etc
   * @returns parsing result.
   * 
   * ```
   * const person = new Directive('person', /^(?<first>[A-Za-z]+)\s(?<last>[A-Za-z]+)$/);
   * const result = person.parse('person Nia Eashes');
   * console.log(result); // -> { annotation: undefined, directive: "person", attributes: { body: "Nia Eashes", first: "Nia", last: "Eashes" } }
   * ```
   */
  parse(statement: string): { annotation: string | undefined, directive: string, attributes: { [key: string]: string } } {
    const declaration = statement.match(this._tester);
    if (declaration === null) {
      throw new SchemaSyntaxError(`Fail to parse schema statement \`${statement}\` with ${this.name} directive.`);
    }
    const attributes = statement.substring(declaration[0].length).trim().match(this.attributes!);
    const result = {
      annotation: declaration![1],
      directive: this.name,
      attributes: {} as { [key: string]: string },
    };
    if (attributes) {
      result.attributes.body = attributes[0];
      const groups = attributes.groups;
      if (groups) {
        Object.assign(result.attributes, groups);
      }
    }
    return result;
  }
}
export default class Grammer {

  directives: Directive[] = [];
  rootNames: string[] = [];

  register(directive: Directive): Grammer {
    this.directives.push(directive);
    return this;
  }

  structure(structure: { [key: string]: string[] }): Grammer {
    for (const name in structure) {
      this.directives.find(directive => directive.name == name)?.directives.push(...structure[name]);
    }
    return this;
  }

  root(...names: string[]): Grammer {
    this.rootNames = names;
    return this;
  }

  find(target: string): Directive | undefined {
    return this.directives.find(directive => directive.test(target));
  }
}