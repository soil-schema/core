import Node from '../../model/Node.js';
import { cleanBlueprints, env, hook, prepare, test } from '../Blueprint.js';

import swift, { DRAFT_ENV } from './index.js';
import shared from '../shared/index.js';
import { afterEach } from 'mocha';
import { expect } from 'chai';

cleanBlueprints();

beforeEach(() => {
  swift();
  shared();
});

afterEach(() => {
  cleanBlueprints();
});

describe('Swift Blueprints', () => {

  describe('swift:signature', () => {

    const TARGET_BLUEPRINT = 'swift:signature';

    const getSignature = (node: Node): string => {
      prepare(node);
      return test(TARGET_BLUEPRINT, node);
    }

    context('with entity directive', () => {
      it('match entity name', () => {
        const node = new Node('entity', { name: 'Account' });
        expect(getSignature(node)).to.equal('Account');
      })

      context('in draft env', () => {
        beforeEach(() => {
          hook(TARGET_BLUEPRINT, (context, next) => {
            env(DRAFT_ENV, () => next(context));
          });
        });
        it('equals `Draft`', () => {
          const node = new Node('entity', { name: 'Account' });
          expect(getSignature(node)).to.equal('Draft');
        })
      });
    });

    context('with field directive', () => {
      it('match camelized field name', () => {
        const node = new Node('field', { name: 'user_id', type: 'Integer' });
        expect(getSignature(node)).to.equal('userId');
      })
    });

    context('with query directive', () => {
      it('match camelized query name', () => {
        const node = new Node('query', { name: 'user_id', type: 'Integer' });
        expect(getSignature(node)).to.equal('userId');
      })
    });

    context('with parameter directive', () => {
      it('match camelized parameter name', () => {
        const node = new Node('parameter', { name: 'user_id', type: 'Integer' });
        expect(getSignature(node)).to.equal('userId');
      })
    });

  });

});