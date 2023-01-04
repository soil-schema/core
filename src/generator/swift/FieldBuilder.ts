import Generator, { Context } from '../Generator.js';
import { SWIFT_LANG_CODE } from './const.js';

export const fieldProperty = (context: Context): string => {
  return `let ${context.get('name')}: ${context.render('type')}\n`;
}

export const fieldSignature = (context: Context): string => {
  return `${context.get('name')}: ${context.render('type')}`;
}

export const fieldType = (context: Context): string => {
  switch (context.get('type')) {
  case 'Integer':
    return 'Int';
  default:
    return context.get('type') || 'Unknown';
  }
}

export const fieldAssignProperty = (context: Context): string => {
  return `self.${context.get('name')} = ${context.get('name')}`
}

export default (generator: Generator) => {
  generator
    .renderer(SWIFT_LANG_CODE, 'field', 'property', fieldProperty)
    .renderer(SWIFT_LANG_CODE, 'field', 'signature', fieldSignature)
    .renderer(SWIFT_LANG_CODE, 'field', 'type', fieldType)
    .renderer(SWIFT_LANG_CODE, 'field', 'assign-property', fieldAssignProperty)
    ;
}