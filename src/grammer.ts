import Grammer from './grammer/Grammer.js';

export const entityDefinition = /^(?<name>[A-Z][A-Za-z0-9]+)$/;
export const fieldDefinition = /^(?<name>[a-z][a-z0-9\_]*)\s*:\s*(?<type>(List\<[A-Za-z][A-Za-z0-9\_\.]*\>\??|Map\<(Integer|String)\s*,\s*[A-Za-z][A-Za-z0-9\_\.]*\>\??|[A-Za-z][A-Za-z0-9\_\.]*\??|\*\??))$/;
export const queryDefinition = /^(?<name>[a-z][a-z0-9\_]*)\s*:\s*(?<type>(List\<[A-Za-z][A-Za-z0-9\_\.]*\>|[A-Za-z][A-Za-z0-9\_\.]*))$/;
export const endpointDefinition = /^(?<method>[A-Z]+)\s+(?<path>(?:\/\:?[A-Za-z0-9_\-]+)+\/?)\s*$/;

export default new Grammer()
  .directive([], 'scenario', /^(?<name>[A-Za-z0-9_\-\s]+)$/, () => {})
  .directive([], 'entity', entityDefinition, entity => {
    entity
      .directive(['mutable', 'write-only'], 'field', fieldDefinition, field => {
        field
          .directive([], 'case', /^(?<value>[A-Za-z][A-Za-z0-9_\-]+)$/)
      })
      .directive([], 'endpoint', endpointDefinition, endpoint => {
        endpoint
          .directive(['required'], 'query', queryDefinition)
          .directive([], 'request', undefined, response => {
            response
              .directive([], 'field', fieldDefinition, field => {
                field
                  .directive([], 'case', /^(?<value>[A-Za-z][A-Za-z0-9_\-]+)$/)
              })
              ;
          })
          .directive([], 'success', undefined, response => {
            response
              .directive([], 'field', fieldDefinition, field => {
                field
                  .directive([], 'case', /^(?<value>[A-Za-z][A-Za-z0-9_\-]+)$/)
              })
              ;
          })
          .directive([], 'action-name', /^(?<value>.+)$/)
          ;
      })
      ;
  })
  ;
