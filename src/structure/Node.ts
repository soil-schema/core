export default class Node {
  parent?: Node;
  annotation?: string;
  directive: string;
  definition: { [key: string]: string };
  block: Node[] = [];
  shallow = false;

  constructor(directive: string, definition: { [key: string]: string }, annotation?: string) {
    Object.defineProperty(this, 'parent', { enumerable: false, value: void 0, writable: true });
    this.annotation = annotation;
    this.directive = directive;
    this.definition = definition;
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

  get description(): string {
    let description = `${this.directive}: ${Object.keys(this.definition).map(key => `${key} = ${this.definition[key]}`)}`;
    if (typeof this.annotation == 'string') {
      description = `${this.annotation} ${description}`;
    }
    return description;
  }

  freeze() {
    Object.freeze(this);
    Object.freeze(this.definition);
    this.block.forEach(child => child.freeze());
  }

  test(matcher: Matcher): boolean {
    return matcher.test(this);
  }

  get isRoot(): boolean {
    return !!this.parent;
  }
}

export class Matcher {

  condition: string;
  annotationMatcher?: (annotation: string) => boolean;
  directiveMatcher?: (directive: string) => boolean;

  constructor(condition: string) {
    this.condition = condition;

    const conditions = condition.split(/\s+/);
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

  test(node: Node): boolean {
    if (typeof this.directiveMatcher != 'undefined' && this.directiveMatcher(node.directive) == false) {
      return false;
    }
    if (typeof this.annotationMatcher != 'undefined' && this.annotationMatcher(node.annotation ?? '') == false) {
      return false;
    }
    return true;
  }
}
