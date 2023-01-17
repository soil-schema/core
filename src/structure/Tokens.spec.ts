import { expect } from 'chai';
import { DirectiveToken } from './Tokens.js';

describe('XxxToken', () => {
  it('#inspect', () => {
    expect(new DirectiveToken('sample').inspect()).to.match(/sample/);
  });
});