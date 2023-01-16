import { env, Hook, hook, replace, write } from '../Blueprint.js';
import Config from './Config.js';

const KOTLIN_SERIALIZATION = 'kotlin-serialization';

export default () => {

  hook('kotlin:content', (context, next) => {
    const config = context.config as Config;

    if (config.use?.includes(KOTLIN_SERIALIZATION)) {
      env(KOTLIN_SERIALIZATION, () => next(context));
    } else {
      next(context);  
    }
  });

  hook('kotlin:imports:entity', (entity, next) => {
    next(entity);

    if (entity.inEnv(KOTLIN_SERIALIZATION)) {
      write('import kotlinx.serialization.*\n');
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
  hook('kotlin:enum', annotateSerializable);

  hook('kotlin:member:case', (context, next) => {
    next(context);
    if (context.inEnv(KOTLIN_SERIALIZATION)) {
      replace(body => body && `@SerialName("${context.require('body')}") ${body}`);
    }
  });

  hook('kotlin:close:endpoint', (endpoint, next) => {
    if (endpoint.inEnv(KOTLIN_SERIALIZATION)) {
      // write('fun decode()\n');
    }
    next(endpoint);
  });

  hook('kotlin:signature:field', (field, next) => {
    next(field);
    if (field.inEnv(KOTLIN_SERIALIZATION)) {
      if (field.require('name').includes('_')) {
        replace(body => `@SerialName("${field.require('name')}")\n${body}`);
      }
    }
  });
};