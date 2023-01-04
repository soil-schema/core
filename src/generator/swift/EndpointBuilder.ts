import Generator, { Context } from '../Generator.js';
import { SWIFT_LANG_CODE } from './const.js';
import { capitalize, sentence } from '../util.js';

export const endpointDecleration = (context: Context): string => {
  return context
    .content('open')
    .content('close')
    .body;
}

export const endpointName = (context: Context): string => {
  return capitalize(`${context.get('method')} ${sentence(context.get('path'))}`, { separator: '' });
}

export const endpointOpen = (context: Context): string => {
  return `
struct ${context.render('name')}Endpoint {

    let method: String = "GET"
    let path: String = "/users"

    typealias Request = Void

`;
}

export const endpointClose = (context: Context): string => {
  return '}';
}

export default (generator: Generator) => {
  generator
    .renderer(SWIFT_LANG_CODE, 'endpoint', 'decleration', endpointDecleration)
    .renderer(SWIFT_LANG_CODE, 'endpoint', 'name', endpointName)
    .renderer(SWIFT_LANG_CODE, 'endpoint', 'open', endpointOpen)
    .renderer(SWIFT_LANG_CODE, 'endpoint', 'close', endpointClose)
    ;
}