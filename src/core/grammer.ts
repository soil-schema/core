import Directive from '../grammer/Directive.js';
import Grammer from '../grammer/Grammer.js';

export default new Grammer()

  .register(new Directive('scenario', /^(?<name>[A-Za-z0-9_\-\s]+)$/))
  .register(new Directive('entity', /^(?<name>[A-Z][A-Za-z0-9]+)$/))
  .register(new Directive('endpoint', /^(?<method>[A-Z]+)\s+(?<path>(?:\/\:?[A-Za-z0-9_\-]+)+\/?)\s*$/))

  // == field

  .register(new Directive('mutable|write-only field', /^(?<name>[a-z][a-z0-9\_]*)\s*:\s*(?<type>[A-Za-z:\s\<\>\(\),\.\-_)]+\??)$/))
  .register(new Directive('case', /^(?<value>[A-Za-z][A-Za-z0-9_\-]+)$/))
  .register(new Directive('values', /^(?:(?:[a-z\_0-9]+)\s*,\s*)*(?:[a-z\_0-9]+)$/))

  // == endpoint schema

  .register(new Directive('required query', /^(?<name>[a-z][a-z0-9\_]*)\s*:\s*(?<type>[A-Za-z:\s\<\>\(\),\.\-_)]+)$/))
  .register(new Directive('parameter', /^(?<name>[a-z][a-z0-9\_]*)\s*:\s*(?<type>[A-Za-z:\s\<\>\(\),\.\-_)]+)$/))
  .register(new Directive('request', undefined))
  .register(new Directive('success', undefined))
  .register(new Directive('action-name', /^(?<value>.+)$/))

  .structure({
    'scenario': [],
    'entity': ['field', 'endpoint'],
    'field': ['case', 'field', 'values'],
    'endpoint': ['request', 'success', 'action-name'],
    'request': ['field'],
    'success': ['field'],
  })

  .root('scenario', 'entity')

  ;
