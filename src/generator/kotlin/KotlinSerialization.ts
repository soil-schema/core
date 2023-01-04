import Generator, { Context } from '../Generator.js';
import Config from './Config.js';
import { KOTLIN_LANG_CODE, ENTITY_DIRECTIVE } from './const.js';
import {
  OPEN as ENTITY_OPEN,
  IMPORT as ENTITY_IMPORT,
} from './EntityBuilder.js';

const isEnableKotlinSerializable = (context: Context): boolean => {
  const config = context.config as Config;
  if (config.use?.includes('kotlin-serialization') == true) {
    return true;
  }
  return false;
}

/**
 * Add `@Serializable` annotation to Entity data class.
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
export const serializationEntityOpen = (content: string, context: Context): string => {
  if (!isEnableKotlinSerializable(context)) return content;
  return `@Serializable\n${content}`;
};

export const serializationEntityImport = (content: string, context: Context): string => {
  if (!isEnableKotlinSerializable(context)) return content;
  return 'import kotlinx.serialization.*';
};

export default (generator: Generator) => {
  generator
    .hookContent([KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, ENTITY_OPEN], serializationEntityOpen)
    .hookContent([KOTLIN_LANG_CODE, ENTITY_DIRECTIVE, ENTITY_IMPORT], serializationEntityImport)
    ;
}