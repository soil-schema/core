import Node from '../model/Node.js';
import Grammer from '../model/Grammer.js';
import { BlockCloseToken, BlockOpenToken, DeclarationToken, SeparatorToken, Token } from './tokenize.js';

export default (tokens: Token[], grammer: Grammer): Node => {
  let cursor = 0;
  let ast = new Node('root', {});
  let stack: Node[] = [];

  while(tokens[cursor]) {
    const token = tokens[cursor];
    cursor += 1;

    if (token instanceof SeparatorToken) continue;
    if (token instanceof DeclarationToken) {
      const hit = grammer.find(token.body);
      if (typeof hit == 'undefined') {
        throw new Error(`SyntaxError: Unknown directive "${token.body}"`);
      }

      const { annotation, directive, definition } = hit.parse(token.body);
      const node = new Node(directive, definition, annotation);
      (stack[0] || ast).addChild(node);

      let terminated = false;
      while(tokens[cursor] instanceof SeparatorToken && terminated == false) {
        if (tokens[cursor].body.includes(';')) terminated = true;
        cursor += 1;
      }
      if (terminated) continue;

      if (tokens[cursor] instanceof BlockOpenToken) {
        stack.unshift(node);
        cursor += 1;
      }

      continue;
    }

    if (token instanceof BlockCloseToken) {
      if (stack.length == 0) throw new Error('Syntax Error: Unexpected token "}"');
      stack.shift();
      continue;
    }
  }

  if (stack.length > 0) throw new Error('Syntax Error: Insert "}" to complete block');

  return ast;
}