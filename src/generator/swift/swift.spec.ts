import { expect } from 'chai';
import Node from '../../structure/Node.js';
import Generator, { Context } from '../Generator.js';
import { SWIFT_LANG_CODE } from './const.js';
import swift from './entry.js';

const generator = new Generator([]);

swift(generator);

describe('Swift / Endpoint', () => {

  const container = generator.hooks;
  const makeEndpoint = (definition: string): Node => {
    const sentences = definition.split(' ');
    if (sentences.length == 2) {
      const [ method, path ] = sentences;
      return new Node('endpoint', { method, path })
    }
    if (sentences.length == 3) {
      const [ annotation, method, path ] = sentences;
      return new Node('endpoint', { method, path }, annotation)
    }
    expect.fail(`Invalid endpoint definition: ${definition}`);
  }

  [
    { endpoint: 'GET /users', expectName: 'GetUsers' },
    { endpoint: 'POST /users', expectName: 'PostUsers' },
    { endpoint: 'GET /users/:id', expectName: 'GetUsersId' },
    { endpoint: 'INVALID /unknown', expectName: 'InvalidUnknown' },
  ]
  .forEach(({ endpoint, expectName }) => {
    const context = new Context(SWIFT_LANG_CODE, makeEndpoint(endpoint), container);
    it(`endpoint name with ${endpoint}`, () => {
      const actual = container.render('name', context);
      expect(actual).to.equal(expectName);
    });
  });

  it(`endpoint name with action-name = fetch`, () => {
    const endpoint = makeEndpoint('GET /users/:id');
    endpoint.addChild(new Node('action-name', { value: 'fetch' }))

    const context = new Context(SWIFT_LANG_CODE, endpoint, container);
    const actual = container.render('name', context);

    expect(actual).to.equal('Fetch');
  });
});