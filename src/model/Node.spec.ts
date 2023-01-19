import { expect } from "chai";
import Node, { Matcher } from './Node.js';

describe('Node.Matcher', () => {

  it('test with directive condition', () => {
    const matcher = new Matcher('record');

    const target1 = new Node('record', {});
    expect(matcher.test(target1)).to.be.true;

    const target2 = new Node('data', {});
    expect(matcher.test(target2)).to.be.false;
  });

  it('test with directive negative condition', () => {
    const matcher = new Matcher('!record');

    const target1 = new Node('record', {});
    expect(matcher.test(target1)).to.be.false;

    const target2 = new Node('data', {});
    expect(matcher.test(target2)).to.be.true;
  });

  it('test with annotation and directive condition', () => {
    const matcher = new Matcher('fine record');

    const target1 = new Node('record', {}, 'fine');
    expect(matcher.test(target1)).to.be.true;

    const target2 = new Node('record', {}, 'wrong');
    expect(matcher.test(target2)).to.be.false;
  });
});

describe('Node', () => {

  describe('#resolve', () => {

    it('resolve with a `name` definition attribute', () => {
      const node = new Node('.', {});
      node.addChild(new Node('entity', { name: 'Target' }));
      node.addChild(new Node('entity', { name: 'Another' }));
      
      const result = node.resolve('Target');

      expect(result?.definition.name).to.equal('Target');
    });

    it('resolve with absolute name', () => {
      const node = new Node('.', {});
      const startingNode = new Node('entity', { name: 'Start' });
      node.addChild(startingNode);
      node.addChild(new Node('entity', { name: 'Target' }));
      
      const result = startingNode.resolve('Target');

      expect(result?.definition.name).to.equal('Target');
    });

    it('resolve local name', () => {
      const node = new Node('.', {});
      const startingNode = new Node('entity', { name: 'Start' });
      node.addChild(startingNode);
      startingNode.addChild(new Node('entity', { name: 'Target' }));
      
      const result = startingNode.resolve('Target');

      expect(result?.definition.name).to.equal('Target');
    });

    it('resolve nested name', () => {
      const node = new Node('.', {});
      node.addChild(new Node('entity', { name: 'Person' }));
      node.block[0].addChild(new Node('field', { name: 'id' }));
      
      const result = node.resolve('Person.id');

      expect(result?.definition.name).to.equal('id');
    });

  });

  describe('#root', () => {

    it('2 depth ast', () => {
      const node = new Node('.', {});
      const startingNode = new Node('entity', { name: 'Start' });
      node.addChild(startingNode);

      expect(startingNode.root).to.same.equal(node);
    });

    it('3 depth ast', () => {
      const node = new Node('.', {});
      const intermediateNode = new Node('entity', { name: 'Intermediate' })
      const startingNode = new Node('entity', { name: 'Start' });
      node.addChild(intermediateNode);
      intermediateNode.addChild(startingNode);

      expect(startingNode.root).to.same.equal(node);
    });

  });

});