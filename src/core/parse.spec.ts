import { expect } from 'chai';
import Grammer, { Directive } from '../model/Grammer.js';
import parse from './parse.js';
import tokenize from './tokenize.js';

describe('parse', () => {

  context('with test grammer', () => {
    const grammer = new Grammer()
      .register(new Directive('test', /^[A-Z]+$/))
      .register(new Directive('name', /^[a-z]+$/))
      .structure({
        test: ['name'],
      })
      .root('test');

    it('valid case', () => {
      const source = 'test NAME';
      const result = parse(tokenize(source), grammer).block;
      expect(result.length).to.equal(1);
      expect(result[0].directive).to.equal('test');
      expect(result[0].attributes.body).to.equal('NAME');
    });

    it('invalid directive name', () => {
      const source = 'invalid NAME';
      expect(() => parse(tokenize(source), grammer)).to.throw(Error);
    });

    it('full case', () => {
      const source = 'test NAME { name annotation; name directive }';
      const result = parse(tokenize(source), grammer).block;
      expect(result.length).to.equal(1);
      expect(result[0].block.length).to.equal(2);
    });

  });
});