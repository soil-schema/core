export default class Node {
  parent?: Node;
  annotation?: string;
  directive: string;
  attributes: { [key: string]: string };
  block: Node[] = [];

  constructor(directive: string, attributes: { [key: string]: string }, annotation?: string) {
    Object.defineProperty(this, 'parent', { enumerable: false, value: void 0, writable: true });
    this.annotation = annotation;
    this.directive = directive;
    this.attributes = attributes;
  }

  /**
   * Add child node. This method supports method chaining.
   * @param {Node} node child Node to add.
   * @returns {Node} this Node.
   */
  addChild(node: Node): Node {
    node.parent = this;
    this.block.push(node);
    return this;
  }

  merge(node: Node) {
    node.block.forEach(node => this.addChild(node));
  }

  get description(): string {
    let description = `${this.directive}: ${Object.keys(this.attributes).map(key => `${key} = ${this.attributes[key]}`)}`;
    if (typeof this.annotation == 'string') {
      description = `${this.annotation} ${description}`;
    }
    return description;
  }

  freeze() {
    Object.freeze(this);
    Object.freeze(this.attributes);
    this.block.forEach(child => child.freeze());
  }

  test(matcher: Matcher): boolean {
    return matcher.test(this);
  }

  get allBlock(): Node[] {
    return this.block.reduce((result: Node[], node: Node) => {
      result.push(node);
      result.push(...node.allBlock);
      return result;
    }, []);
  }

  get isRoot(): boolean {
    return this.parent == undefined;
  }

  get root(): Node {
    return this.parent?.root || this;
  }

  resolve(path: string): Node | undefined {
    if (path == '') return this;
    const splittedPath = path.split('.');
    const name = splittedPath.shift();
    if (this.isRoot == false) {
      if (name == this.attributes.name) return this.resolve(splittedPath.join('.'));
    }
    return this.block.find(node => node.attributes.name == name)?.resolve(splittedPath.join('.')) || this.parent?.resolve(path);
  }
}

export class Matcher {

  condition: string;
  annotationMatcher?: (annotation: string) => boolean;
  directiveMatcher?: (directive: string) => boolean;
  attributeMatcher?: (attributes: { [key: string]: string }) => boolean

  constructor(condition: string) {
    this.condition = condition;

    if (condition == '*') {
      this.directiveMatcher = () => true;
      return;
    }

    let conditions = condition.split(/\s+/)
      .filter(condition => {
        const attributeCondition = condition.match(/^has\((?<attribute>.+)\)$/)
        if (attributeCondition !== null) {
          this.attributeCondition = attributeCondition[1];
          return false;
        }
        return true;
      });
    if (conditions.length == 1) {
      // condition = {directive}
      this.directiveCondition = conditions[0];
    }
    if (conditions.length == 2) {
      // condition = {annotation} {directive}
      this.annotationCondition = conditions[0];
      this.directiveCondition = conditions[1];
    }
  }

  set annotationCondition(condition: string) {
    if (condition == '!*') {
      // [!] Non Annotated condition
      this.annotationMatcher = (annotation: string) => annotation != '';
      return;
    }
    if (condition[0] == '!') {
      // [!] Negative condition
      this.annotationMatcher = (annotation: string) => `!${annotation}` != condition;
      return;
    }
    this.annotationMatcher = (annotation: string) => annotation == condition;
  }

  set directiveCondition(condition: string) {
    if (condition[0] == '!') {
      // [!] Negative condition
      this.directiveMatcher = (directive: string) => `!${directive}` != condition;
      return;
    }
    this.directiveMatcher = (directive: string) => directive == condition;
  }

  set attributeCondition(condition: string) {
    this.attributeMatcher = (attributes: { [key: string]: string }) => Object.keys(attributes).includes(condition);
  }

  test(node: Node): boolean {
    if (typeof this.directiveMatcher != 'undefined' && this.directiveMatcher(node.directive) == false) {
      return false;
    }
    if (typeof this.annotationMatcher != 'undefined' && this.annotationMatcher(node.annotation ?? '') == false) {
      return false;
    }
    if (typeof this.attributeMatcher != 'undefined' && this.attributeMatcher(node.attributes) == false) {
      return false;
    }
    return true;
  }
}
