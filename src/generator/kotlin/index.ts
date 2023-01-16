import { block, blueprint, Context, dig, env, exists, file, hook, replace, statement, write } from '../Blueprint.js';
import Pretty from '../Pretty.js';
import { camelize, capitalize, sentence, singular } from '../util.js';
import Config from './Config.js';

// Extensions

import kotlinSerialization from './kotlin-serialization.js';
import okhttp from './okhttp.js';

const KOTLIN_URL_BUILDER = 'UrlBuilder';

const builder = () => {

  // === entity

  blueprint('kotlin:file:entity', entity => {
    file(entity.require('name'), { ext: 'kt' });
    block('content');
    if (entity.inEnv('debug')) {
      block('logs');
    }
  });

  blueprint('kotlin:file:scenario', entity => {
    // Nothing to generate.
  });

  blueprint('kotlin:content:entity', entity => {
    const config = entity.config as Config;

    write('package ', config.package ?? 'com.soil',  '\n\n');
    block('file-header');
    block('open');
    block('enums');
    if (exists('mutable field') || exists('write-only field')) {
      block('draft');
    }
    dig('endpoint', () => block('declaration'));
    block('close');
  });

  blueprint('kotlin:enums:entity', entity => {
    dig('field', () => block('enum'));
  });

  blueprint('kotlin:draft:entity', entity => {
    env('draft', () => {
      block('open');
      block('close');
    });
  });

  blueprint('kotlin:file-header:entity', entity => {
    block('imports');
  });

  blueprint('kotlin:imports:entity', entity => {
    write('import android.net.Uri.Builder as ', KOTLIN_URL_BUILDER, '\n');
  });

  hook('kotlin:imports+post', (context, next) => {
    next(context);
    replace(current => {
      return current.split('\n').sort().join('\n')
    });
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

  // === scaffold

  blueprint('kotlin:close', entity => {
    write('}');
  });

  // === endpoint

  blueprint('kotlin:declaration:endpoint', endpoint => {
    write('class ', () => statement('name'), ' {\n\n');
    write(`val method: String = "${endpoint.require('method')}"\n`);
    write(`val path: String = "${endpoint.require('path')}"\n`);

    block('url-builder');
    env('request', () => block('request'));
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

  blueprint('kotlin:url-builder:endpoint', endpoint => {
    write('fun build(builder: ', KOTLIN_URL_BUILDER, ') {\n');
    write('builder\n');
    write('.path(this.path)\n');
    write('}\n');
  });

  blueprint('kotlin:request:endpoint', endpoint => {
    if (exists('request')) {
      dig('request', () => block('declaration'));
    }
  });

  blueprint('kotlin:response:endpoint', endpoint => {
    if (exists('success')) {
      dig('success', () => block('declaration'));
    }
  });

  // == schema request

  blueprint('kotlin:declaration:request', schema => {
    write(() => statement('open'), '\n');
    dig('field', () => {
      statement('signature');
      write('\n');
    });
    write(')\n');
  });

  blueprint('kotlin:open:request', schema => {
    write('data class Request(');
  });

  // == schema response

  blueprint('kotlin:declaration:success', schema => {
    write(() => statement('open'), '\n');
    dig('field', () => {
      statement('signature');
      write('\n');
    });
    write(')\n');
  });

  blueprint('kotlin:open:success', schema => {
    write('data class Response(');
  });

  // === type

  type TypeObject = {
    body: string;
    isList: boolean;
    isOptional: boolean;
  }

  const parseType = (context: Context): TypeObject => {
    let type = context.require('type');
    let isList = type.startsWith('List<');
    let isOptional = type.endsWith('?');

    if (isOptional) type = type.slice(0, type.length - 1);
    if (isList) type = type.slice(5, type.length - 1);

    return { body: type, isList, isOptional };
  }

  blueprint('kotlin:raw-type', field => {
    let { body } = parseType(field);
    switch (body) {
    case 'Integer':
      body = 'Int';
      break;
    }
    write(body);
  });

  blueprint('kotlin:type:field', field => {
    const { isList, isOptional } = parseType(field);
    let body = statement('raw-type', { capture: true });
    if (body == 'Enum') {
      body = statement('enum-name', { capture: true });
    }
    if (isList) {
      body = `List<${body}>`;
    }
    write(body + (isOptional ? '?' : ''));
  });

  blueprint('kotlin:type-signature', field => {
    let body = statement('raw-type', { capture: true });
    if (body == 'Enum') {
      statement('enum-name');
    }
  });

  blueprint('kotlin:enum', field => {
    const type = statement('raw-type', { capture: true });
    if (type != 'Enum') {
      return; // Nothing to do
    }

    write('enum class ', () => statement('type-signature'), ' {\n');
    dig('case', () => write(() => statement('member'), ',\n'));
    write('}\n');
  });

  blueprint('kotlin:enum-name', field => {
    const { isList } = parseType(field);
    if (isList) {
      write(singular(capitalize(field.require('name'), { separator: '' })));
    } else {
      write(capitalize(field.require('name'), { separator: '' }));
    }
  });

  blueprint('kotlin:member:case', context => {
    write(context.require('body').toUpperCase().replace(/\-/g, '_'));
  });

  // === pretty

  hook('kotlin:comment', (context, next) => {
    write('/*\n');
    next(context);
    write(' */\n');
  });

  hook('kotlin:file:entity', (context, next) => {
    const config = context.config as Config;

    next(context);
    const file = context.currentFile;
    if (file) {
      file.body = new Pretty(file.body).pretty({
        indentBlock: ['{}', '()'],
        comment: ['//', '///', ['/*', '*/']],
        stripComment: context.inEnv('strip-comment'),
        indent: ' '.repeat(config.indentLength || 4),
      });
    }
  });

  // === Debug

  hook('kotlin:logs:entity', (entity, next) => {
    write('/*\n');
    write(' Blueprint logs\n');
    entity.logs
      .forEach(line => write(' ', line, '\n'));
    write(' */\n');
    next(entity);
  });

  blueprint('kotlin:debug', entity => {
    write(entity.get('name') || 'unnamed');
  });

  // === Extensions

  kotlinSerialization();
  okhttp();
};

builder();

export default builder;