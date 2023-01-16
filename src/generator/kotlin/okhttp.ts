import { block, blueprint, env, Hook, hook, replace, write } from '../Blueprint.js';
import Config from './Config.js';

const OKHTTP = 'okhttp';

export default () => {
  hook('kotlin:content', (context, next) => {
    const config = context.config as Config;

    if (config.use?.includes(OKHTTP)) {
      env(OKHTTP, () => next(context));
    } else {
      next(context);  
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
    write('.', endpoint.require('method').toLowerCase() ,'()\n');
    write('}\n');
  });
};