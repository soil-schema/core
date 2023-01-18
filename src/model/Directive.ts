const DIRECTIVE_DECLARATION = /^(?:(?<annotations>(?:[a-z][a-z\-]*\|)*(?:[a-z][a-z\-]*))\s)?(?<name>[a-z][a-z\-]*)$/

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

  test(target: string): boolean {
    if (this._tester.test(target) == false) return false;
    const declaration = target.match(this._tester);
    const definition = target.substring(declaration![0].length).trim();
    if (definition) {
      if (typeof this.definition == 'undefined') {
        return false;
      }
      return this.definition?.test(definition);
    }
    return typeof this.definition == 'undefined';
  }

  capture(target: string): { annotation: string | undefined, directive: string, definition: { [key: string]: string } } {
    const declaration = target.match(this._tester);
    const definition = target.substring(declaration![0].length).trim().match(this.definition!);
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