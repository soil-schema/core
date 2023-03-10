import { block, blueprint, Context, dig, dive, env, exists, file, hook, replace, statement, write } from '../Blueprint.js';
import Pretty from '../Pretty.js';
import { camelize, capitalize, sentence, singular } from '../util.js';
import Config from './Config.js';

// Extensions

import kotlinSerialization from './kotlin-serialization.js';
import okhttp from './okhttp.js';
import endpointInterface from './endpoint-interface.js';

const KOTLIN_URL_BUILDER = 'UrlBuilder';

export const PRIMITIVE_TYPE_TABLE: { [key: string]: string } = {
  'Integer': 'Int',
  'Timestamp': 'LocalDateTime', // java.time.LocalDateTime
  'URL': 'Uri', // android.net.Uri
  'Number': 'Double',
}

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
    dig('inner', () => block('schema'));
    dig('field', () => block('enum'));
    dig('field', () => block('schema'));
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
    block('imports');
  });

  blueprint('kotlin:signature:entity', entity => {
    write(entity.inEnv('draft') ? 'Draft' : entity.require('name'));
  });

  blueprint('kotlin:signature:inner', entity => {
    write(entity.inEnv('draft') ? 'Draft' : entity.require('name'));
  });

  blueprint('kotlin:init', entity => {
    let condition = entity.inEnv('draft') ? '!* field' : '!write-only field';
    if (exists(condition)) {
      write('(\n');
      dig(condition, () => {
        statement('member')
        write('\n');
      });
      write(')');
    }
  });

  // == import

  blueprint('kotlin:imports:entity', entity => {
    write('import android.net.Uri.Builder as ', KOTLIN_URL_BUILDER, '\n');
    const imports: string[] = [];
    const config = entity.config as Config;
    config.import?.forEach(name => {
      imports.push(`import ${name}\n`);
    });
    dig('...field', () => {
      imports.push(statement('imports', { capture: true }) || '');
    });
    imports
      .filter((o, i) => o && imports.indexOf(o) === i)
      .forEach(o => write(o));
  });

  blueprint('kotlin:imports:field', entity => {
    const type = statement('raw-type', { capture: true });
    if (type == PRIMITIVE_TYPE_TABLE['Timestamp']) {
      write('import java.time.LocalDateTime\n');
    };
    if (type == PRIMITIVE_TYPE_TABLE['URL']) {
      write('import android.net.Uri\n');
    }
  });

  // Sort imports block
  hook('kotlin:imports+post', (context, next) => {
    next(context);
    replace(current => {
      return current.split('\n').sort().join('\n')
    });
  });

  // === subschema

  blueprint('kotlin:schema:inner', inner => {
    block('open');
    if (exists('mutable field') || exists('write-only field')) {
      block('draft');
    }
    dig('field', () => block('enum'));
    dig('field', () => block('schema'));
    block('close');
  });

  blueprint('kotlin:schema:field', field => {
    const type = statement('raw-type', { capture: true });
    if (type != '*') return;
    block('open');
    dig('field', () => block('enum'));
    dig('field', () => block('schema'));
    block('close');
  });

  // === field

  blueprint('kotlin:name:field', field => {
    write(camelize(field.require('name')));
  });

  blueprint('kotlin:assign:field', field => {
    write('self.');
    statement('name');
    write(' = ');
    statement('name');
  });

  // === scaffold

  blueprint('kotlin:open', entity => {
    let condition = entity.inEnv('draft') ? '!* field' : '!write-only field';
    if (exists(condition)) {
      write('data class ');
    } else {
      write('class ');
    }
    statement('signature');
    statement('init');
    write(` {\n`);
  });

  blueprint('kotlin:close', entity => {
    write('}');
  });

  blueprint('kotlin:member', field => {
    if (statement('raw-type', { capture: true }) == PRIMITIVE_TYPE_TABLE['URL']) {
      write('@Contextual\n');
    }
    write('val ')
    statement('name');
    write(': ');
    statement('type')
    write(',');
  });

  blueprint('kotlin:property', field => {
    write((field.inEnv('draft') || field.inEnv('mutating')) ? 'var ' : 'val ');
    statement('name');
    write(': ');
    statement('type')
    const defaultValue = statement('default-value', { capture: true });
    if (defaultValue) {
      write(' = ', defaultValue);
    }
  });

  // === endpoint

  blueprint('kotlin:declaration:endpoint', endpoint => {
    block('open');

    write('val method: String = "', endpoint.require('method'), '"\n');
    write('val path: String = "', () => statement('path'), '"\n');

    block('url-builder');

    env('mutating', () => {
      dig('...query', () => block('property'));
    });

    dig('...field', () => block('enum'));
    dig('...parameter', () => block('enum'));
    dig('...query', () => block('enum'));

    dig('...field', () => block('schema'));

    env('request', () => block('request'));

    block('response');

    block('close');
  });

  blueprint('kotlin:path:endpoint', endpoint => {
    const path = endpoint.require('path')
      .split('/')
      .filter(f => f)
      .map(f => {
        if (f.startsWith('$')) {
          return '$' + camelize(f.substring(1));
        }
        return f;
      });
    write('/', path.join('/'));
  });

  blueprint('kotlin:open:endpoint', endpoint => {
    write('class ', () => statement('signature'));
    const args = statement('args', { capture: true });
    if (args) {
      write('(\n', args, ')');
    }
    write(' {');
  });

  blueprint('kotlin:args:endpoint', endpoint => {
    const path = endpoint.require('path').split('/');
    const parameters = path.filter(token => token.startsWith('$'));

    parameters.forEach(parameter => {
      const node = endpoint.currentNode.resolve(parameter.substring(1));
      if (typeof node == 'undefined') throw new Error(`Unresolved parameter name ${parameter} on ${statement('signature', { capture: true })}`);
      if (node.directive == 'field' || node.directive == 'parameter') {
        dive(node, () => write(() => statement('member'), '\n'));
      }
    });

    if (exists('request')) {
      write('val request: Request,\n');
    }
  });

  blueprint('kotlin:signature:endpoint', endpoint => {

    // "GET /users" -> "GetUsers"
    let name = capitalize(`${endpoint.require('method')} ${sentence(endpoint.require('path').replace(/\$/g, ''))}`, { separator: '' });

    dig('action-name', actionName => {
      name = capitalize(actionName.require('value'));
    });

    write(name, 'Endpoint');
  });

  blueprint('kotlin:url-builder:endpoint', endpoint => {
    write('fun build(builder: ', KOTLIN_URL_BUILDER, '): ', KOTLIN_URL_BUILDER, ' {\n');
    write('builder.path(this.path)', '\n')
    dig('query', query => {
      write(() => statement('name'), '?.also { ');
      statement('build');
      write(' }\n')
    })
    write('return builder\n')
    write('}');
  });

  blueprint('kotlin:name:parameter', parameter => {
    write(camelize(parameter.require('name')));
  });

  blueprint('kotlin:name:query', query => {
    write(camelize(query.require('name')));
  });

  blueprint('kotlin:default-value:query', query => {
    write('null');
  });

  blueprint('kotlin:build:query', query => {
    const type = statement('raw-type', { capture: true });
    write('builder.appendQueryParameter("', query.require('name'), '", ');
    switch (type) {
    case 'Enum':
      write('it.rawValue');
      break;
    case 'Int':
    case 'Double':
      write('it.toString()');
      break;
    case 'Boolean':
      write('if (it) "1" else ""');
      break;
    default:
      if (query.get('isList')) {
        write('it.joinToString("+")');
      } else {
        write('it')
      }
      break;
    }
    write(')')
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
    env('mutating', () => {
      dig('field', () => {
        statement('member');
        write('\n');
      });
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
      statement('member');
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
    isOptional: boolean;
  }

  const parseType = (context: Context): TypeObject => {
    let type = context.require('type');
    let isOptional = type.endsWith('?');

    if (isOptional) type = type.slice(0, type.length - 1);
    if (context.get('isList')) type = type.slice(5, type.length - 1);

    return { body: type, isOptional };
  }

  /**
   * Get type string from `type` attributes.
   * 
   * - When type is List or Map, returns element type: `List<String>` => `String`.
   * - soil-schema primitive types convert to kotlin types: `Integer` => `Int`.
   * - Self attributes type returns `*`.
   * - Enum type returns `Enum`.
   * - Strip optional signature: `String?` => `String`.
   * 
   * This blueprint is designed to be captured.
   * ```
   * blueprint('kotlin:example', () => {
   *   const type = statement('raw-type', { capture: true });
   *   write('result: ', type);
   * });
   * ```
   */
  blueprint('kotlin:raw-type', field => {
    let { body } = parseType(field);
    write(PRIMITIVE_TYPE_TABLE[body] || body);
  });

  blueprint('kotlin:type', context => {
    let body = statement('signature', { capture: true });
    if (body) {
      const node = context.currentNode.resolve(body);
      if (node) {
        dive(node, () => {
          body = statement('signature', { capture: true })
        });
      }
    }
    if (context.get('isList')) {
      body = `List<${body}>`;
    }
    write(body + ((context.get('isOptional') || context.currentNode.directive == 'query') ? '?' : ''));
  });

  blueprint('kotlin:signature', field => {
    let body = statement('raw-type', { capture: true }) || '';
    if (body == 'Enum') {
      statement('enum-name');
      return;
    }
    if (body == '*') {
      const name = field.get('name');
      if (name) {
        if (field.get('isList')) {
          write(capitalize(singular(name), { separator: '' }));
        } else {
          write(capitalize(name, { separator: '' }));
        }
        return;
      }
    }
    const node = field.node.resolve(body);
    if (node) {
      if (field.inEnv('mutating') && node.directive == 'entity') {
        dive(node, () => {
          if (exists('mutable field') || exists('write-only field')) {
            body += '.Draft';
          }
        });
      }
    }
    write(body);
  });

  blueprint('kotlin:enum', () => {
    const type = statement('raw-type', { capture: true });
    if (type != 'Enum') {
      return; // Nothing to do
    }

    write('enum class ', () => statement('signature'), '(val rawValue: String) {\n');
    dig('case', () => write(() => statement('value'), ',\n'));
    write('}\n');
  });

  blueprint('kotlin:enum-name', field => {
    if (field.get('isList')) {
      write(singular(capitalize(field.require('name'), { separator: '' })));
    } else {
      write(capitalize(field.require('name'), { separator: '' }));
    }
  });

  blueprint('kotlin:value:case', context => {
    write(context.require('value').toUpperCase().replace(/\-/g, '_'));
    write('("', context.require('value'), '")')
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

  blueprint('kotlin:debug', node => {
    write(node.get('name') || node.get('value') || 'unnamed');
  });

  blueprint('kotlin:debug:endpoint', endpoint => {
    write(endpoint.require('method'), ' ', endpoint.require('path'));
  });

  // === Extensions

  endpointInterface();
  kotlinSerialization();
  okhttp();
};

builder();

export default builder;