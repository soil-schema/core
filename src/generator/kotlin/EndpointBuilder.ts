import Generator, { Context } from '../Generator.js';
import { ENDPOINT_DIRECTIVE, RESPONSE_DIRECTIVE, KOTLIN_LANG_CODE } from './const.js';
import { capitalize, sentence } from '../util.js';

export const OPEN = 'open';

export const endpointDecleration = (context: Context): string => {
  return context
    .content(OPEN)
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
data class ${context.render('name')}Endpoint {

    val method: String = "GET"
    val path: String = "/users"

`;
}

export const endpointResponse = (context: Context): string => {
  const response = context.getChild('response');
  if (response) {
    return response
      .content(OPEN)
      .contentEach({ directive: 'field' }, 'signature')
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
  return 'data class Response(';
}

export const responseClose = (context: Context): string => {
  return ')';
}

export default (generator: Generator) => {
  generator
    .renderer(KOTLIN_LANG_CODE, ENDPOINT_DIRECTIVE, 'decleration', endpointDecleration)
    .renderer(KOTLIN_LANG_CODE, ENDPOINT_DIRECTIVE, 'name', endpointName)
    .renderer(KOTLIN_LANG_CODE, ENDPOINT_DIRECTIVE, OPEN, endpointOpen)
    .renderer(KOTLIN_LANG_CODE, ENDPOINT_DIRECTIVE, 'response', endpointResponse)
    .renderer(KOTLIN_LANG_CODE, ENDPOINT_DIRECTIVE, 'close', endpointClose)
    .renderer(KOTLIN_LANG_CODE, RESPONSE_DIRECTIVE, OPEN, responseOpen)
    .renderer(KOTLIN_LANG_CODE, RESPONSE_DIRECTIVE, 'close', responseClose)
    ;
}