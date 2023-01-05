export default class Node {
  annotation?: string;
  directive: string;
  definition: { [key: string]: string };
  block: Node[] = [];

  constructor(directive: string, definition: { [key: string]: string }, annotation?: string) {
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
    this.block.push(node);
    return this;
  }
}
