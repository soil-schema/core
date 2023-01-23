import { expect } from 'chai';
import tokenize, { CommentToken, DeclarationToken, DescriptionToken } from './tokenize.js';

describe('tokenize', () => {

  it('only `description`', () => {
    const source = '/// Test';
    const result = tokenize(source);
    expect(result.length).to.equal(1);
  });

  it('only `comment`', () => {
    const source = '// Test';
    const result = tokenize(source);
    expect(result.length).to.equal(1);
  });

  it('specify case', () => {
    const source = `
/// Account attributes.
entity Account {
  field id: Int
}
`;
    const result = tokenize(source);
    expect(result.length).to.equal(11);
    expect(result.map(({ body }) => body)).to.contain('/// Account attributes.');
    expect(result.map(({ body }) => body)).to.contain('entity Account');
    expect(result.map(({ body }) => body)).to.contain('field id: Int');
  });

  it('specify one-liner', () => {
    const source = 'entity Account { field id: Int; field name: String }';
    const result = tokenize(source);
    expect(result.length).to.equal(9);
    expect(result.map(({ body }) => body)).to.contain('entity Account');
    expect(result.map(({ body }) => body)).to.contain('field id: Int');
    expect(result.map(({ body }) => body)).to.contain('field name: String');
  });

});

describe('DeclarationToken', () => {

  describe('#capture', () => {

    context('when matched with terminal', () => {

      it('correct offset and body', () => {
        const token = new DeclarationToken();
        const offset = token.capture('query sort: string; next', 0);
        expect(offset).to.equal(18);
        expect(token.body).to.equal('query sort: string')
      });

      it('returns next offset', () => {
        const token = new DeclarationToken();
        const offset = token.capture('123456789 mutable field id: Int; next', 10);
        expect(offset).to.equal(10 + 21);
        expect(token.body).to.equal('mutable field id: Int')
      });

    });

    context('when matched with EOF', () => {

      it('correct offset and body', () => {
        const token = new DeclarationToken();
        const offset = token.capture('query sort: string', 0);
        expect(offset).to.equal(18);
        expect(token.body).to.equal('query sort: string')
      });

      it('returns next offset', () => {
        const token = new DeclarationToken();
        const offset = token.capture('123456789 mutable field id: Int', 10);
        expect(offset).to.equal(10 + 21);
        expect(token.body).to.equal('mutable field id: Int')
      });

    });

    context('when matched with new-line', () => {

      it('correct offset and body', () => {
        const token = new DeclarationToken();
        const offset = token.capture('query sort: string\nnext', 0);
        expect(offset).to.equal(18);
        expect(token.body).to.equal('query sort: string')
      });

      it('returns next offset', () => {
        const token = new DeclarationToken();
        const offset = token.capture('123456789 mutable field id: Int\nnext', 10);
        expect(offset).to.equal(10 + 21);
        expect(token.body).to.equal('mutable field id: Int')
      });

    });

  });

});

describe('DescriptionToken', () => {

  describe('#capture', () => {

    context('when matched', () => {

      it('correct offset and body', () => {
        const token = new DescriptionToken();
        const offset = token.capture('/// Test Description', 0);
        expect(offset).to.equal(20);
        expect(token.body).to.equal('/// Test Description')
      });

      it('returns next offset', () => {
        const token = new DescriptionToken();
        const offset = token.capture('123456789 /// Test Description', 10);
        expect(offset).to.equal(10 + 20);
        expect(token.body).to.equal('/// Test Description')
      });

    });

  });

});

describe('CommentToken', () => {

  describe('#capture', () => {

    context('when matched', () => {

      it('correct offset and body', () => {
        const token = new CommentToken();
        const offset = token.capture('// Test Comment', 0);
        expect(offset).to.equal(15);
        expect(token.body).to.equal('// Test Comment')
      });

      it('returns next offset', () => {
        const token = new CommentToken();
        const offset = token.capture('123456789 // Test Comment', 10);
        expect(offset).to.equal(10 + 15);
        expect(token.body).to.equal('// Test Comment')
      });

    });

    context('when mismatched', () => {

      it('returns undefined', () => {
        const token = new CommentToken();
        const offset = token.capture('annotation directive', 0);
        expect(offset).to.undefined;
        expect(token.body).to.equal('')
      });

    });

  });

});

describe('CommentToken', () => {

  describe('#capture', () => {

    context('when matched', () => {

      it('correct offset and body', () => {
        const token = new CommentToken();
        const offset = token.capture('// Test Comment', 0);
        expect(offset).to.equal(15);
        expect(token.body).to.equal('// Test Comment')
      });

      it('returns next offset', () => {
        const token = new CommentToken();
        const offset = token.capture('123456789 // Test Comment', 10);
        expect(offset).to.equal(10 + 15);
        expect(token.body).to.equal('// Test Comment')
      });

    });

    context('when mismatched', () => {

      it('returns undefined', () => {
        const token = new CommentToken();
        const offset = token.capture('annotation directive', 0);
        expect(offset).to.undefined;
        expect(token.body).to.equal('')
      });

    });

  });

});