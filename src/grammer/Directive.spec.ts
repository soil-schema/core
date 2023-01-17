import { expect } from 'chai';
import Directive from './Directive.js';

describe('Directive', () => {

  describe('.constructor', () => {

    it('with annotation', () => {
      const testDirective = new Directive('fire|water|grass pokemon');
      expect(testDirective.name).to.equal('pokemon');
      expect(testDirective.annotations).to.deep.equals(['fire', 'water', 'grass']);
    });

  });

  describe('#test', () => {

    it('with annotation', () => {
      const testDirective = new Directive('fire|water|grass pokemon');
      expect(testDirective.test('fire pokemon')).to.be.true;
    });

    it('with annotation', () => {
      const testDirective = new Directive('fire|water|grass pokemon');
      expect(testDirective.test('fire pokemon')).to.be.true;
    });

    it('full usecase', () => {
      const testDirective = new Directive('fire|water|grass pokemon', /[A-Za-z]{2,12}/);
      expect(testDirective.test('fire pokemon Araquanid')).to.be.true;
    });

    it('without annotation', () => {
      const testDirective = new Directive('pokemon');
      expect(testDirective.test('pokemon')).to.be.true;
    });

  });

});