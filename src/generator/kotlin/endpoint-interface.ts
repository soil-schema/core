import { block, blueprint, env, exists, Hook, hook, replace, statement, write } from '../Blueprint.js';
import Config from './Config.js';

const ENDPOINT_INTERFACE = 'endpoint-interface';

type EndpointInterfaceConfig = {
  endpointInterface?: string;
  overridableMembers?: string[];
};

export default () => {
  hook('kotlin:content', (context, next) => {
    const config = context.config as Config;

    if (config.use?.includes(ENDPOINT_INTERFACE)) {
      context.envKeys.push(ENDPOINT_INTERFACE);
    }
    next(context);
  });

  hook('kotlin:open:endpoint', (endpoint, next) => {
    next(endpoint);
    if (endpoint.inEnv(ENDPOINT_INTERFACE)) {
      const config = endpoint.config as EndpointInterfaceConfig;
      const name = config.endpointInterface;
      if (typeof name != 'undefined') {
        const response = exists('success') ? `${statement('signature', { capture: true })}.Response` : 'Unit';
        const actualName = name
          .replace('<Response>', `<${response}>`);
        replace(current => current.replace(' {', `: ${actualName} {`));
      } else {
        throw new Error('kotlin endpoint-interface extension is enabled, but `endpointInterface` configuration is undefined.');
      }
    }
  });

  hook('kotlin:declaration:endpoint', (endpoint, next) => {
    next(endpoint);
    if (endpoint.inEnv(ENDPOINT_INTERFACE)) {
      const config = endpoint.config as EndpointInterfaceConfig;
      const targets = config.overridableMembers || [];
      replace(current => {
        return targets.reduce((result, target) => {
          // [!] "val {target}" => "override val {target}".
          return result.replace(new RegExp(`\\b((?:(?:private|protected|public)\\s+)?(?:val|var|fun)\\s+${target})\\b`), 'override $1');
        }, current);
      });
    }
  });

};