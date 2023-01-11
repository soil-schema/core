import { block, blueprint, dig, env, exists, file, hook, HookCallback, statement, write } from '../Blueprint.js';
import Pretty from '../Pretty.js';
import { camelize, capitalize, sentence } from '../util.js';
import Config from './Config.js';
import kotlinSerialization from './kotlin-serialization.js';

const builder = () => {

  // === entity

  blueprint('kotlin:file:entity', entity => {
    file(entity.require('name'), { ext: 'kotlin' });
    block('content');
  });

  blueprint('kotlin:content:entity', entity => {
    write('package com.soil\n\n');
    block('file-header');
    block('open');
    if (exists('mutable field') || exists('write-only field')) {
      block('draft');
    }
    dig('endpoint', () => block('declaration'));
    block('close');
  });

  blueprint('kotlin:draft:entity', entity => {
    env('draft', () => {
      block('open');
      block('close');
    });
  });

  blueprint('kotlin:file-header:entity', entity => {
  });

  blueprint('kotlin:open:entity', entity => {
    write('data class ');
    statement('name');
    statement('init');
    write(` {\n`);
  });

  blueprint('kotlin:name:entity', entity => {
    write(entity.inEnv('draft') ? 'Draft' : entity.require('name'));
  });

  blueprint('kotlin:init:entity', entity => {
    let condition = entity.inEnv('draft') ? '!* field' : '!write-only field';
    write('(\n');
    dig(condition, () => {
      statement('signature')
      write('\n');
    });
    write(')');
  });

  // === field

  blueprint('kotlin:name:field', field => {
    write(camelize(field.require('name')));
  });

  blueprint('kotlin:property:field', field => {
    write(field.inEnv('draft') ? 'var ' : 'let ');
    statement('name');
    write(': ');
    statement('type')
  });

  blueprint('kotlin:signature:field', field => {
    write('val ')
    statement('name');
    write(': ');
    statement('type')
    write(',');
  });

  blueprint('kotlin:assign:field', field => {
    write('self.');
    statement('name');
    write(' = ');
    statement('name');
  });

  blueprint('kotlin:close', entity => {
    write('}');
  });

  // === endpoint

  blueprint('kotlin:declaration:endpoint', endpoint => {
    write('data class ', () => statement('name'), ' {\n\n');
    write(`val method: String = "${endpoint.require('method')}"\n`);
    write(`val path: String = "${endpoint.require('path')}"\n`);
    block('response');
    block('close');
  });

  blueprint('kotlin:name:endpoint', endpoint => {

    // "GET /users" -> "GetUsers"
    let name = capitalize(`${endpoint.require('method')} ${sentence(endpoint.require('path'))}`, { separator: '' });

    dig('action-name', actionName => {
      name = capitalize(actionName.require('value'));
    });

    write(name, 'Endpoint');
  });

  blueprint('kotlin:response:endpoint', endpoint => {
    if (exists('response')) {
      dig('response', () => block('declaration'));
    } else {
      write('typealias Response = Void');
    }
  });

  // == schema response

  blueprint('kotlin:declaration:response', schema => {
    write(() => statement('open'), '\n');
    dig('field', () => {
      statement('signature');
      write('\n');
    });
    write(')\n');
  });

  blueprint('kotlin:open:response', schema => {
    write('data class Response(');
  });

  // === type

  blueprint('kotlin:type:field', field => {
    let type = field.get('type') || '';
    let optional = type.endsWith('?')
    if (optional) {
      type = type.slice(0, type.length - 1);
    }
    switch (type) {
    case 'Integer':
      type = 'Int';
      break;
    }
    write(type + (optional ? '?' : ''));
  });

  // === pretty

  hook('kotlin:comment', (context, next) => {
    write('/*\n');
    next(context);
    write(' */\n');
  });

  hook('kotlin:file:entity', (context, next) => {
    next(context);
    const file = context.currentFile;
    if (file) {
      file.body = new Pretty(file.body).pretty({
        indentBlock: ['{}', '()'],
        comment: ['//', '///'],
        stripComment: context.inEnv('strip-comment'),
        indent: '  ',
      });
    }
  });

  kotlinSerialization();
};

builder();

export default builder;