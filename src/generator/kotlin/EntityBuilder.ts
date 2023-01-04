import Generator, { Context, File, Template } from '../Generator.js';
import { KOTLIN_LANG_CODE } from './const.js';

export const entityTemplate = (context: Context): File => {
  const content = context
    .content('file-header')
    .content('open')
    .contentEach({ directive: 'field' }, 'property')
    .content('init')
    .content('close')
    .body;
  return new File(`${context.get('name')}.kt`, content);
}

export const entityFileHeader = (context: Context): string => {
  if (context.hasAttribute('strip-comment')) return '';
  return `
package com.soil
`.trim();
}

export const entityOpen = (context: Context): string => {
  return `data class ${context.get('name')}(${context.render('init')}) {`;
}

export const entityInit = (context: Context): string => {
  return context
    .dup()
    .contentEach({ directive: 'field', separator: ', ' }, 'signature')
    .body;
}

export const pretty = (content: string, context: Context) => {
  return content;
}

export default (generator: Generator) => {
  generator
    .template(new Template(KOTLIN_LANG_CODE, 'entity', entityTemplate))
    .renderer(KOTLIN_LANG_CODE, 'entity', 'file-header', entityFileHeader)
    .renderer(KOTLIN_LANG_CODE, 'entity', 'open', entityOpen)
    .renderer(KOTLIN_LANG_CODE, 'entity', 'init', entityInit)
    .renderer(KOTLIN_LANG_CODE, 'entity', 'close', () => '}')

    .hookContent('kotlin:entity:template', pretty);
}