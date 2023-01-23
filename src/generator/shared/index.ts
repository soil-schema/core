import Node from '../../model/Node.js';
import { attribute, block, blueprint, Context, dig, dive, env, exists, file, hook, HookCallback, statement, write } from '../Blueprint.js';
import Pretty from '../Pretty.js';
import { camelize, capitalize, sentence, singular } from '../util.js';

const PRIMITIVE_TYPES = [
  'String',
  'Integer',
  'Number',
  'Boolean',
  'Timestamp',
  'URL',
];

export const isOptional = (node: Node) => node.attributes.type.endsWith('?') ? "optional" : undefined;

const builder = () => {
  attribute('isList', 'has(type)', node => {
    return node.attributes.type.startsWith('List<') ? "list" : undefined;
  });
  attribute('isMap', 'has(type)', node => {
    return node.attributes.type.startsWith('Map<') ? "map" : undefined;
  });
  attribute('key', 'has(type)', node => {
    if (node.attributes.type.startsWith('Map<')) {
      const match = node.attributes.type.match(/^Map\<\s*([^,]+)\s*,.+\>$/);
      if (match && match[1]) {
        return match[1];
      }
    }
  });
  attribute('isOptional', 'has(type)', isOptional);
  attribute('primitive', 'has(type)', node => {
    let type = node.attributes.type;
    if (type.startsWith('List<')) {
      type = type.substring(5, type.length - 2);
    }
    if (type.endsWith('?')) {
      type = type.substring(0, type.length - 2);
    }
    if (PRIMITIVE_TYPES.includes(type)) {
      return type;
    }
  });
};

builder();

export default builder;