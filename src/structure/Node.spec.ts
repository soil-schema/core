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