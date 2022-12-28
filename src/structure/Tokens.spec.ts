import { expect } from 'chai';
import { AmbiguousToken } from './Tokens.js';

describe('XxxToken', () => {
  it('#inspect', () => {
    expect(new AmbiguousToken('sample').inspect()).to.match(/sample/);
  });
});