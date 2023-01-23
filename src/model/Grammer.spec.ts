import { expect } from 'chai';
import { Directive } from './Grammer.js';
import SchemaSyntaxError from './SchemaSyntaxError.js';

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
      expect(testDirective.test('water pokemon Araquanid')).to.be.true;
    });

    it('without annotation', () => {
      const testDirective = new Directive('pokemon');
      expect(testDirective.test('pokemon')).to.be.true;
    });

  });

  describe("#parse", () => {

    it("simple case", () => {
      const person = new Directive('person', /^(?<first>[A-Za-z]+)\s(?<last>[A-Za-z]+)$/);
      const result = person.parse('person Nia Eashes');
      expect(result.annotation).to.be.undefined;
      expect(result.directive).to.equal('person');
      expect(result.definition.body).to.equal('Nia Eashes');
      expect(result.definition.first).to.equal('Nia');
      expect(result.definition.last).to.equal('Eashes');
    });

    it("with annotation", () => {
      const person = new Directive('fire|water|grass pokemon', /[A-Za-z]{2,12}/);
      const result = person.parse('water pokemon Araquanid');
      expect(result.annotation).to.equal('water');
      expect(result.directive).to.equal('pokemon');
      expect(result.definition.body).to.equal('Araquanid');
    });

    it("without definition statement", () => {
      const person = new Directive('staging', undefined);
      const result = person.parse('staging');
      expect(result.annotation).to.be.undefined;
      expect(result.directive).to.equal('staging');
      expect(result.definition.body).to.equal('');
    });

    it("throw SchemaSyntaxError when declaration statement is invalid", () => {
      const person = new Directive('person', /^(?<first>[A-Za-z]+)\s(?<last>[A-Za-z]+)$/);
      expect(() => { person.parse('animal Cat') }).to.throw(SchemaSyntaxError);
    });

  });

});