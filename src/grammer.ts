import Grammer from './grammer/Grammer.js';

export const entityDefinition = /^(?<name>[A-Z][A-Za-z0-9]+)$/;
export const fieldDefinition = /^(?<name>[a-z][a-z0-9\_]*)\s*:\s*(?<type>(List\<[A-Za-z][A-Za-z0-9\_\.]*\>\??|Map\<(Integer|String)\s*,\s*[A-Za-z][A-Za-z0-9\_\.]*\>\??|[A-Za-z][A-Za-z0-9\_\.]*\??|\*\??))$/;
export const endpointDefinition = /^(?<method>[A-Z]+)\s+(?<path>(?:\/\:?[A-Za-z0-9_\-]+)+\/?)\s*$/;

export default new Grammer()
  .directive([], 'scenario', /^(?<name>[A-Za-z0-9_\-\s]+)$/, () => {})
  .directive([], 'entity', entityDefinition, entity => {
    entity
      .directive([], 'field', fieldDefinition)
      .directive([], 'endpoint', endpointDefinition, endpoint => {
        endpoint
          .directive([], 'response', undefined, response => {
            response
              .directive([], 'field', fieldDefinition)
              ;
          })
          .directive([], 'action-name', /^(?<value>.+)$/)
          ;
      })
      ;
  })
  ;
