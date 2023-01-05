import Generator, { Context } from '../Generator.js';
import Config from './Config.js';
import { KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, ENDPOINT_DIRECTIVE, RESPONSE_DIRECTIVE } from './const.js';
import {
  OPEN as ENTITY_OPEN,
  IMPORT as ENTITY_IMPORT,
} from './EntityBuilder.js';
import {
  OPEN as ENDPOINT_OPEN,
} from './EndpointBuilder.js';

const isEnableKotlinSerializable = (context: Context): boolean => {
  const config = context.config as Config;
  if (config.use?.includes('kotlin-serialization') == true) {
    return true;
  }
  return false;
}

/**
 * Add `@Serializable` annotation to kotlin data class.
 * 
 * before:
 * ```
 * data class Person(
 *   ... fields
 * )
 * ```
 * 
 * after:
 * ```
 * @Serializable
 * data class Person(
 *   ... fields
 * )
 * ```
 * 
 * @see https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/basic-serialization.md#serializable-classes
 */
export const serializableDataClass = (content: string, context: Context): string => {
  if (!isEnableKotlinSerializable(context)) return content;
  return content.replace(/\b(data\s+class)\b/, '@Serializable\n$1');
};

export const serializationEntityImport = (content: string, context: Context): string => {
  if (!isEnableKotlinSerializable(context)) return content;
  return content + 'import kotlinx.serialization.*\n';
};

export default (generator: Generator) => {
  generator
    .hookContent([KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, ENTITY_OPEN], serializableDataClass)
    .hookContent([KOTLIN_LANG_CODE, RESPONSE_DIRECTIVE, ENDPOINT_OPEN], serializableDataClass)
    .hookContent([KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, ENTITY_IMPORT], serializationEntityImport)
    ;
}