import { block, blueprint, env, exists, Hook, hook, replace, write } from '../Blueprint.js';
import Config from './Config.js';

const OKHTTP = 'okhttp';

export default () => {
  hook('kotlin:content', (context, next) => {
    const config = context.config as Config;

    if (config.use?.includes(OKHTTP)) {
      context.envKeys.push(OKHTTP);
    }
    next(context);
  });

  hook('kotlin:imports:entity', (entity, next) => {
    next(entity);

    if (entity.inEnv(OKHTTP)) {
      write('import okhttp3.MediaType.Companion.toMediaType\n');
      write('import okhttp3.RequestBody.Companion.toRequestBody\n');
    }
  });

  hook('kotlin:close:endpoint', (endpoint, next) => {
    if (endpoint.inEnv(OKHTTP)) {
      block('okhttp-request-builder');
    }
    next(endpoint);
  });

  blueprint('kotlin:okhttp-request-builder:endpoint', endpoint => {
    write('fun build(builder: okhttp3.Request.Builder) {\n');
    write('builder\n');
    const method = endpoint.require('method').toLowerCase();
    if (method == 'get') {
      write('.', method ,'()\n');
    } else if (exists('request')) {
      // `encode()` method is rendered by any serialization extension e.g. a `kotlin-serialization` soil extension.
      // okhttp extension expects `encode()` returns string.
      write('.', method ,'(this.encode().toRequestBody("application/json".toMediaType()))\n');
    } else if (method == 'post') {
      write('.', method ,'("".toRequestBody("application/json".toMediaType()))\n');
    } else {
      write('.', method ,'(null)\n');
    }
    write('}\n');
  });
};