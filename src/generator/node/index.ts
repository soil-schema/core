import { block, blueprint, Context, dig, dive, env, exists, file, hook, replace, statement, write } from '../Blueprint.js';
import Pretty from '../Pretty.js';
import { camelize, capitalize, sentence, singular } from '../util.js';

const builder = () => {

  // === entity

  blueprint('node:file:entity', entity => {
    file(entity.require('name'), { ext: 'node' });
    block('dump');
  });

  blueprint('node:dump', node => {
    const annotation = node.get('annotation');
    write('<', annotation ? annotation + ':' : '', node.require('directive'), '> ', () => statement('label'), ' {\n');

    statement('inspect');

    dig('*', () => block('dump'));

    write('}\n');
  });

  blueprint('node:label', node => {
    write(node.get('name') || node.get('value') || '');
  });

  blueprint('node:label:endpoint', endpoint => {
    write(endpoint.require('method'), ' ', endpoint.require('path'));
  });

  blueprint('node:inspect:field', field => {
    write('type = ', field.require('type'), '\n');
  });

  hook('node:file:entity', (context, next) => {
    next(context);
    const file = context.currentFile;
    if (file) {
      file.body = new Pretty(file.body).pretty({
        indentBlock: ['{}', '()'],
        comment: ['//', ['/*', '*/']],
        stripComment: false,
        indent: ' '.repeat(2),
      });
    }
  });

}

builder();

export default builder;