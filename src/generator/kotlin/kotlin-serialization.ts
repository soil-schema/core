import { dig, env, exists, Hook, hook, replace, statement, write } from '../Blueprint.js';
import Config from './Config.js';

const KOTLIN_SERIALIZATION = 'kotlin-serialization';

type KotlinSerializationConfig = {
  serializer?: { [key: string]: string };
  format?: string;
  requireCoder?: boolean,
};

export default () => {

  hook('kotlin:content', (context, next) => {
    const config = context.config as Config;

    if (config.use?.includes(KOTLIN_SERIALIZATION)) {
      context.envKeys.push(KOTLIN_SERIALIZATION);
    }

    next(context);
  });

  hook('kotlin:imports:entity', (entity, next) => {
    next(entity);

    if (entity.inEnv(KOTLIN_SERIALIZATION)) {
      const config = entity.config as KotlinSerializationConfig;
      write('import kotlinx.serialization.*\n');
      if (config.format == 'Json') {
        write('import kotlinx.serialization.json.Json\n');
      }
    }
  });

  hook('kotlin:imports:field', (field, next) => {
    next(field);

    if (field.inEnv(KOTLIN_SERIALIZATION)) {
      const config = field.config as KotlinSerializationConfig;
      const type = statement('raw-type', { capture: true });
      if (typeof type != 'undefined' && type != '*' && (config.serializer || {})[type]) {
        write('import ', config.serializer![type], '\n');
      }
    }
  });

  const annotateSerializable: Hook = (context, next) => {
    next(context);
    if (context.inEnv(KOTLIN_SERIALIZATION)) {
      replace(body => body && `@Serializable\n${body}`);
    }
  }

  hook('kotlin:open:entity', annotateSerializable);
  hook('kotlin:open:success', annotateSerializable);
  hook('kotlin:open:field', annotateSerializable);
  hook('kotlin:open:inner', annotateSerializable);
  hook('kotlin:enum', annotateSerializable);

  hook('kotlin:value:case', (context, next) => {
    next(context);
    if (context.inEnv(KOTLIN_SERIALIZATION)) {
      replace(body => body && `@SerialName("${context.require('body')}") ${body}`);
    }
  });

  hook('kotlin:args:endpoint', (endpoint, next) => {
    next(endpoint);
    if (endpoint.inEnv(KOTLIN_SERIALIZATION)) {
      const config = endpoint.config as KotlinSerializationConfig;
      if (exists('success') || exists('request')) {
        write('val format: StringFormat', config.format ? ` = ${config.format}` : '' ,',\n');
      }
    }
  });

  hook('kotlin:close:endpoint', (endpoint, next) => {
    if (endpoint.inEnv(KOTLIN_SERIALIZATION)) {
      const config = endpoint.config as KotlinSerializationConfig;
      const { requireCoder = true } = config;

      if (exists('request')) {
        dig('request', () => {
          write('@OptIn(ExperimentalSerializationApi::class)\n');
          write('fun encode(): String = format.encodeToString(request)\n');
        });
      } else if (requireCoder) {
        write('@OptIn(ExperimentalSerializationApi::class)\n');
        write('fun encode(): String = ""\n');
      }
      write('\n');
      if (exists('success')) {
        write('@OptIn(ExperimentalSerializationApi::class)\n');
        write('fun decode(body: String): Response = format.decodeFromString(body)\n');
      } else if (requireCoder) {
        write('@OptIn(ExperimentalSerializationApi::class)\n');
        write('fun decode(body: String): Unit = Unit\n');
      }
    }
    next(endpoint);
  });

  hook('kotlin:member:field', (field, next) => {
    next(field);
    if (field.inEnv(KOTLIN_SERIALIZATION)) {
      if (field.require('name').includes('_')) {
        replace(body => `@SerialName("${field.require('name')}")\n${body}`);
      }
      const type = statement('raw-type', { capture: true });
      const config = field.config as KotlinSerializationConfig;
      if (typeof type != 'undefined' && type != '*' && (config.serializer || {})[type]) {
        replace(body => `@Serializable(with = ${config.serializer![type].split('.').pop()}::class)\n${body}`);
      }
    }
  });
};