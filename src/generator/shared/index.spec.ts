import { isOptional } from './index.js';
import Node from '../../model/Node.js';
import { expect } from 'chai';

describe(".isOptional calcurated attribute", () => {
  it("does not defined field node has type attribute 'Integer'", () => {
    const node = new Node('field', { type: 'Integer' });
    expect(isOptional(node)).to.be.undefined;
  });
  it("does not defined field node has type attribute 'String?'", () => {
    const node = new Node('field', { type: 'String?' });
    expect(isOptional(node)).not.to.be.undefined;
  });
});