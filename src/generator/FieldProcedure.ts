import Generator, { Context } from './Generator.js';
export const FIELD_LIST_ATTRIBUTE = 'list';
export const FIELD_MAP_ATTRIBUTE = 'map';
export const FIELD_OPTIONAL_ATTRIBUTE = 'optional';

export default (generator: Generator) => {
  generator
    .hookContext('field:*', (field: Context) => {
      if (field.get('type')?.startsWith('List<')) {
        field.addAttribute(FIELD_LIST_ATTRIBUTE);
      }
      if (field.get('type')?.startsWith('Map<')) {
        field.addAttribute(FIELD_MAP_ATTRIBUTE);
      }
      if (field.get('type')?.endsWith('?')) {
        field.addAttribute(FIELD_OPTIONAL_ATTRIBUTE);
      }
    })
    ;
};