import Generator from './Generator.js';

export default (generator: Generator) => {
  generator
    .hookContext('field', (field => {
      if (field.get('_prepare')) return;
      field.node.definition._prepare = 'done';
      field.node.definition.generic = /^List\</.test(field.get('type') || '') ? 'list' : '';
      field.node.definition.generic = /^Map\</.test(field.get('type') || '') ? 'map' : '';
    }))
    ;
};