import Generator, { Context, File, Template } from '../Generator.js';
import Pretty from '../Pretty.js';
import Config from './Config.js';
import { KOTLIN_LANG_CODE, ENTITY_DIRECTIVE } from './const.js';

export const OPEN = 'open';
export const IMPORT = 'import';

export const entityTemplate = (context: Context): File => {
  const content = context
    .content('file-header')
    .content(OPEN)
    .content('close')
    .body;
  return new File(`${context.get('name')}.kt`, content);
}

export const entityFileHeader = (context: Context): string => {
  return context
    .dup()
    .content('package')
    .content('import')
    .content('file-header-comment')
    .body;
}

export const entityPackage = (context: Context): string => {
  const config = context.config as Config;
  return `package ${config.package || 'com.soil // Set generate.kotlin.package in soil.config.js'}`;
}

export const entityImport = (context: Context): string => {
  return '\n';
}

export const entityOpen = (context: Context): string => {
  return `
data class ${context.get('name')}(
  ${context.render('init')}
) {
`.trim();
}

export const entityFileComment = (context: Context): string => {
  return '';
}

export const entityInit = (context: Context): string => {
  return context.renderEach({ directive: 'field' }, 'signature');
}

export const pretty = (content: string, context: Context) => {
  return new Pretty(content).pretty({
    indentBlock: ['{}', '()'],
    comment: ['//', '///'],
    stripComment: context.hasAttribute('strip-comment'),
    indent: '  ',
  });
}

export default (generator: Generator) => {
  generator
    .template(new Template(KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, entityTemplate))
    .renderer(KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, 'file-header', entityFileHeader)
    .renderer(KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, 'package', entityPackage)
    .renderer(KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, IMPORT, entityImport)
    .renderer(KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, 'file-header-comment', entityFileComment)
    .renderer(KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, OPEN, entityOpen)
    .renderer(KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, 'init', entityInit)
    .renderer(KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, 'close', () => '}')

    .hookContent('kotlin:entity:template', pretty);
}