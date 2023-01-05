import Generator, { Context } from '../Generator.js';
import { SWIFT_LANG_CODE } from './const.js';
import { capitalize, sentence } from '../util.js';

export const endpointDecleration = (context: Context): string => {
  return context
    .content('open')
    .content('response')
    .content('close')
    .body;
}

export const endpointName = (context: Context): string => {

  // When endpoint as action-name directive, use its value as endpoint name.
  const actionName = context.getChild('action-name')?.get('value');
  if (actionName) {
    return capitalize(actionName);
  }

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

export const endpointResponse = (context: Context): string => {
  const response = context.getChild('response');
  if (response) {
    return response
      .content('open')
      .contentEach({ directive: 'field' }, 'property')
      .content('close')
      .body
  } else {
    return 'typealias Response = Void';
  }
}

export const endpointClose = (context: Context): string => {
  return '}';
}

export const responseOpen = (context: Context): string => {
  return 'struct Response: Decodable {\n';
}

export const responseClose = (context: Context): string => {
  return '}';
}

export default (generator: Generator) => {
  generator
    .renderer(SWIFT_LANG_CODE, 'endpoint', 'decleration', endpointDecleration)
    .renderer(SWIFT_LANG_CODE, 'endpoint', 'name', endpointName)
    .renderer(SWIFT_LANG_CODE, 'endpoint', 'open', endpointOpen)
    .renderer(SWIFT_LANG_CODE, 'endpoint', 'response', endpointResponse)
    .renderer(SWIFT_LANG_CODE, 'endpoint', 'close', endpointClose)
    .renderer(SWIFT_LANG_CODE, 'response', 'open', responseOpen)
    .renderer(SWIFT_LANG_CODE, 'response', 'close', responseClose)
    ;
}