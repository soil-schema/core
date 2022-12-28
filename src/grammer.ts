import Grammer from './grammer/Grammer.js';

export default new Grammer()
  .directive([], 'scenario', /^(?<name>[A-Za-z0-9_\-\s]+)$/, () => {})
  .directive([], 'entity', /^(?<name>[A-Z][A-Za-z0-9]+)$/, entity => {
    entity
      .directive([], 'field', /^(?<name>[a-z][a-z0-9\_]*)\s*:\s*(?<type>[A-Za-z][A-Za-z0-9\_\.]*\??|\*\??)$/)
      ;
  })
  ;
