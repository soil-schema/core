import { block, blueprint, dig, env, exists, file, hook, HookCallback, statement, write } from '../Blueprint.js';
import Pretty from '../Pretty.js';
import { camelize, capitalize, sentence } from '../util.js';

const DRAFT_ENV = 'draft';

const builder = () => {

  // === entity

  blueprint('swift:file:entity', entity => {
    file(entity.require('name'), { ext: 'swift' });
    block('content');
  });

  blueprint('swift:content:entity', entity => {
    block('file-header');
    block('open');
    block('init');
    if (exists('mutable field') || exists('write-only field')) {
      block('draft');
    }
    dig('endpoint', () => block('declaration'));
    block('close');
  });

  blueprint('swift:draft:entity', entity => {
    env(DRAFT_ENV, () => {
      block('open');
      block('init');
      block('close');
    });
  });

  blueprint('swift:file-header:entity', entity => {
    if (entity.inEnv('strip-comment')) return;
    write('///\n');
    write(`/// ${entity.require('name')}.swift\n`);
    write('///\n');
    write('/// Generated by soil-schema\n');
    write('///\n');
  });

  blueprint('swift:open:entity', entity => {
    let protocol = 'Codable';
    if (!entity.inEnv(DRAFT_ENV)) {
      if (exists('mutable field') || exists('write-only field')) {
        protocol = 'Decodable';
      }
    } else {
      protocol = 'Encodable';
    }
    write('struct ');
    statement('name');
    write(`: ${protocol} {\n`);

    let condition = entity.inEnv(DRAFT_ENV) ? '!* field' : '!write-only field';
    dig(condition, () => block('property'));
  });

  blueprint('swift:name:entity', entity => {
    write(entity.inEnv(DRAFT_ENV) ? 'Draft' : entity.require('name'));
  });

  blueprint('swift:init:entity', entity => {
    let condition = entity.inEnv(DRAFT_ENV) ? '!* field' : '!write-only field';
    write('init(');
    dig(condition, () => statement('signature'));
    write(') {\n');
    dig(condition, () => {
      statement('assign')
      write('\n')
    });
    write('}');
  });

  // === field

  blueprint('swift:name:field', field => {
    write(camelize(field.require('name')));
  });

  blueprint('swift:property:field', field => {
    write(field.inEnv(DRAFT_ENV) ? 'var ' : 'let ');
    statement('name');
    write(': ');
    statement('type')
  });

  blueprint('swift:signature:field', field => {
    statement('name');
    write(': ');
    statement('type')
    if (!field.inEnv('last-field')) {
      write(', ');
    }
  });

  blueprint('swift:assign:field', field => {
    write('self.');
    statement('name');
    write(' = ');
    statement('name');
  });

  blueprint('swift:close', entity => {
    write('}');
  });

  // === endpoint

  blueprint('swift:declaration:endpoint', endpoint => {
    write('struct ', () => statement('name'), ' {\n\n');
    write(`let method: String = "${endpoint.require('method')}"\n`);
    write(`let path: String = "${endpoint.require('path')}"\n`);
    block('request');
    block('response');
    block('close');
  });

  blueprint('swift:name:endpoint', endpoint => {

    // "GET /users" -> "GetUsers"
    let name = capitalize(`${endpoint.require('method')} ${sentence(endpoint.require('path'))}`, { separator: '' });

    dig('action-name', actionName => {
      name = capitalize(actionName.require('value'));
    });

    write(name, 'Endpoint');
  });

  blueprint('swift:request:endpoint', endpoint => {
    write('typealias Request = Void');
  });

  blueprint('swift:response:endpoint', endpoint => {
    if (exists('response')) {
      dig('response', () => block('declaration'));
    } else {
      write('typealias Response = Void');
    }
  });

  // == schema response

  blueprint('swift:declaration:response', schema => {
    block('open');
    dig('field', () => block('property'));
    block('close');
  });

  blueprint('swift:open:response', schema => {
    write('struct Response: Decodable {');
  });

  // === type

  const LIST_PATTERN = /^List\<(.+)\>\??$/;

  blueprint('swift:type', property => {
    let type = property.get('type') || '';
    let optional = type.endsWith('?');
    let isList = !!type.match(LIST_PATTERN);
    if (optional) {
      type = type.slice(0, type.length - 1);
    }
    if (isList) {
      type = type.match(LIST_PATTERN)![1];
    }
    switch (type) {
    case 'Integer':
      type = 'Int';
      break;
    }
    write(isList ? '[' : '', type, isList ? ']' : '', optional ? '?' : '');
  });

  // === pretty

  hook('swift:comment', (context, next) => {
    write('/*\n', next, ' */\n');
  });

  hook('swift:file:entity', (context, next) => {
    next(context);
    const file = context.currentFile;
    if (file) {
      file.body = new Pretty(file.body).pretty({
        indentBlock: ['{}', '()'],
        comment: ['//', '///'],
        stripComment: context.inEnv('strip-comment'),
        indent: '    ',
      });
    }
  });
};

builder();

export default builder;