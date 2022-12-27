import Generator, { Context } from '../Generator.js';

export const fieldProperty = (context: Context): string => {
  return `let ${context.get('name')}: ${context.render('type')}`;
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
    .renderer('field', 'property', fieldProperty)
    .renderer('field', 'signature', fieldSignature)
    .renderer('field', 'type', fieldType)
    .renderer('field', 'assign-property', fieldAssignProperty)
    ;
}