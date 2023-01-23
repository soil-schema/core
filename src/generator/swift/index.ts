import { block, blueprint, Context, dig, dive, env, exists, file, hook, HookCallback, statement, write } from '../Blueprint.js';
import Pretty from '../Pretty.js';
import { camelize, capitalize, sentence, singular } from '../util.js';

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

    env('request', () => block('request'));

    block('response');

    block('close');
  });

  blueprint('swift:name:endpoint', endpoint => {

    // "GET /users" -> "GetUsers"
    let name = capitalize(`${endpoint.require('method')} ${sentence(endpoint.require('path').replace('$', ''))}`, { separator: '' });

    dig('action-name', actionName => {
      name = capitalize(actionName.require('value'));
    });

    write(name, 'Endpoint');
  });

  blueprint('swift:request:endpoint', endpoint => {
    if (exists('request')) {
      dig('request', () => block('declaration'));
    } else {
      write('typealias Request = Void');
    }
  });

  blueprint('swift:response:endpoint', endpoint => {
    if (exists('success')) {
      dig('success', () => block('declaration'));
    } else {
      write('typealias Response = Void');
    }
  });

  // == schema request

  blueprint('swift:declaration:request', schema => {
    block('open');
    env('mutating', () => {
      dig('field', () => block('property'));
    });
    block('close');
  });

  blueprint('swift:open:request', schema => {
    write('struct Request: Encodable {');
  });

  // == schema response

  blueprint('swift:declaration:success', schema => {
    block('open');
    dig('field', () => block('property'));
    block('close');
  });

  blueprint('swift:open:success', schema => {
    write('struct Response: Decodable {');
  });

  // === type

  type TypeObject = {
    body: string;
  }

  const parseType = (context: Context): TypeObject => {
    let type = context.require('type');

    if (type.endsWith('?')) type = type.slice(0, type.length - 1);
    if (type.startsWith('List<')) type = type.slice(5, type.length - 1);

    return { body: type };
  }

  const PRIMITIVE_TYPE_TABLE: { [key: string]: string } = {
    'Integer': 'Int',
  }

  /**
   * Get type string from `type` attributes.
   * 
   * - When type is List or Map, returns element type: `List<String>` => `String`.
   * - soil-schema primitive types convert to swift types: `Integer` => `Int`.
   * - Self attributes type returns `*`.
   * - Enum type returns `Enum`.
   * - Strip optional signature: `String?` => `String`.
   * 
   * This blueprint is designed to be captured.
   * ```
   * blueprint('swift:example', () => {
   *   const type = statement('raw-type', { capture: true });
   *   write('result: ', type);
   * });
   * ```
   */
  blueprint('swift:raw-type', field => {
    let { body } = parseType(field);
    write(PRIMITIVE_TYPE_TABLE[body] || body);
  });

  blueprint('swift:type:field', field => {
    let body = statement('raw-type', { capture: true });
    if (body == 'Enum') {
      body = statement('enum-name', { capture: true });
    }
    if (body) {
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
    }
    if (field.get('isList')) {
      body = `Array<${body}>`;
    }
    write(body + (field.get('isOptional') ? '?' : ''));
  });

  blueprint('swift:type-signature', field => {
    let body = statement('raw-type', { capture: true });
    if (body == 'Enum') {
      statement('enum-name');
    }
    if (body == '*') {
      const name = field.get('name');
      if (name) {
        write(capitalize(name, { separator: '' }));
      }
    }
  });

  blueprint('swift:enum', field => {
    const type = statement('raw-type', { capture: true });
    if (type != 'Enum') {
      return; // Nothing to do
    }

    write('enum class ', () => statement('type-signature'), ' {\n');
    dig('case', () => write(() => statement('member'), ',\n'));
    write('}\n');
  });

  blueprint('swift:enum-name', field => {
    if (field.get('isList')) {
      write(singular(capitalize(field.require('name'), { separator: '' })));
    } else {
      write(capitalize(field.require('name'), { separator: '' }));
    }
  });

  blueprint('swift:member:case', context => {
    write(context.require('body').toUpperCase().replace(/\-/g, '_'));
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