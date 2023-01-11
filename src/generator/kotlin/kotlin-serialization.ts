import { block, blueprint, dig, env, exists, file, hook, HookCallback, replace, statement, write } from '../Blueprint.js';
import Pretty from '../Pretty.js';
import { camelize } from '../util.js';
import Config from './Config.js';

const KOTLIN_SERIALIZATION = 'kotlin-serialization';

export default () => {

  hook('kotlin:content', (context, next) => {
    const { config } = context;
    const kotin = config.generate?.kotlin || {} as Config;

    if (kotin.use?.includes(KOTLIN_SERIALIZATION)) {
      env(KOTLIN_SERIALIZATION, () => next(context));
    } else {
      next(context);  
    }
  });

  hook('kotlin:file-header:entity', (entity, next) => {
    next(entity);

    if (entity.inEnv(KOTLIN_SERIALIZATION)) {
      write('import kotlinx.serialization.*\n');
    }
  });

  hook('kotlin:open', (entity, next) => {
    next(entity);
    if (entity.inEnv(KOTLIN_SERIALIZATION)) {
      if (entity.currentBody.startsWith('data class ')) {
        replace(body => `@Serializable\n${body}`);
      }
    }
  });
};