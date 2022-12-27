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

  addChild(node: Node) {
    this.block.push(node);
  }
}
