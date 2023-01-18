import { expect } from 'chai';
import { afterEach, teardown } from 'mocha';
import Node from '../model/Node.js';
import { block, blueprint, cleanBlueprints, Context, dig, env, file, run, statement, write } from './Blueprint.js';

const DRAFT_ENV = 'draft';

describe('blueprint dsl', () => {

  afterEach(cleanBlueprints);

  it('.file and .write', () => {

    blueprint('test:file:entity', (entity: Context) => {
      file('sample', { ext: 'test' });
      write('body');
    });

    const node = new Node('entity', { name: 'sample' });
    const context = new Context('test', node);

    run(context);

    expect(context.currentFile?.filename).to.equal('sample.test');
    expect(context.currentFile?.body).to.equal('body');
  });

  it('.block', () => {

    blueprint('test:file:entity', (entity: Context) => {
      file('sample', { ext: 'test' });
      block('header'); // `.block` method goto an another blueprint like a subroutine enclosed with line-break .
    });

    blueprint('test:header:entity', (entity: Context) => {
      write('// File header');
    });

    const node = new Node('entity', { name: 'sample' });
    const context = new Context('test', node);

    run(context);

    expect(context.currentFile?.body).to.equal('\n// File header\n');
  });

  it('.statement', () => {

    blueprint('test:file:entity', (entity: Context) => {
      file('sample', { ext: 'test' });
      statement('header'); // `.statement` method goto an another blueprint like a subroutine.
    });

    blueprint('test:header:entity', (entity: Context) => {
      write('// File header');
    });

    const node = new Node('entity', { name: 'sample' });
    const context = new Context('test', node);

    run(context);

    expect(context.currentFile?.body).to.equal('// File header');
  });

  it('.dig', () => {

    blueprint('test:file:entity', (entity: Context) => {
      file('sample', { ext: 'test' });
      dig('record', () => {
        block('name'); // `.dig` replaces current node, block / statement hook name is also replaced e.g. "test:name:entity" => "test:name:record".
      });
    });

    blueprint('test:name:record', (record: Context) => {
      write(record.get('name') ?? 'undefined');
    });

    const node = new Node('entity', { name: 'sample' });
    node.addChild(new Node('record', { name: 'item-1' }));
    node.addChild(new Node('record', { name: 'item-2' }));
    const context = new Context('test', node);

    run(context);

    expect(context.currentFile?.body).to.equal('\nitem-1\n\nitem-2\n');
  });

  it('.env', () => {
    blueprint('test:file:entity', (entity: Context) => {
      file('sample', { ext: 'test' });
      dig('record', () => {
        block('name');
      });
      env(DRAFT_ENV, () => { // Enter `draft` environment.
        dig('record', () => {
          block('name');
        });
      });
    });

    blueprint('test:name:record', (record: Context) => {
      if (record.inEnv(DRAFT_ENV)) {
        write('draft ');
      }
      write(record.get('name') ?? 'undefined');
    });

    const node = new Node('entity', { name: 'sample' });
    node.addChild(new Node('record', { name: 'item-1' }));
    node.addChild(new Node('record', { name: 'item-2' }));
    const context = new Context('test', node);

    run(context);

    expect(context.inEnv(DRAFT_ENV)).to.false;
    expect(context.currentFile?.body).to.equal('\nitem-1\n\nitem-2\n\ndraft item-1\n\ndraft item-2\n');
  });
});