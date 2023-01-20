import SchemaSyntaxError from './SchemaSyntaxError.js';

const DIRECTIVE_DECLARATION = /^(?:(?<annotations>(?:[a-z][a-z\-]*\|)*(?:[a-z][a-z\-]*))\s)?(?<name>[a-z][a-z\-]*)$/

/**
 * Represents the directives that make up the grammar of soil-schema.
 */
export default class Directive {

  name: string;
  annotations: string[] = [];
  directives: String[] = [];
  definition: RegExp | undefined

  private _tester!: RegExp;

  /**
   * @param declaration Directive declaration e.g. `annotation1|annotation2 name`.
   * @param definition matching pattern for definition string.
   */
  constructor(declaration: string, definition?: RegExp | undefined) {
    const match = declaration.match(DIRECTIVE_DECLARATION);
    if (match === null) {
      throw new Error(`Invalid directive declaration: ${declaration}`);
    }
    this.name = match.groups?.name || '';
    this.annotations = (match.groups?.annotations || '').split('|').filter(a => a);
    this.definition = definition;

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
    const definition = statement.substring(declaration![0].length).trim();
    if (definition) {
      if (typeof this.definition == 'undefined') {
        return false;
      }
      return this.definition?.test(definition);
    }
    return typeof this.definition == 'undefined';
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
   * console.log(result); // -> { annotation: undefined, directive: "person", definition: { body: "Nia Eashes", first: "Nia", last: "Eashes" } }
   * ```
   */
  parse(statement: string): { annotation: string | undefined, directive: string, definition: { [key: string]: string } } {
    const declaration = statement.match(this._tester);
    if (declaration === null) {
      throw new SchemaSyntaxError(`Fail to parse schema statement \`${statement}\` with ${this.name} directive.`);
    }
    const definition = statement.substring(declaration[0].length).trim().match(this.definition!);
    const result = {
      annotation: declaration![1],
      directive: this.name,
      definition: {} as { [key: string]: string },
    };
    if (definition) {
      result.definition.body = definition[0];
      const groups = definition.groups;
      if (groups) {
        Object.assign(result.definition, groups);
      }
    }
    return result;
  }
}