import Generator from '../Generator.js';
import Config from './Config.js';
import entity from './EntityBuilder.js';
import filed from './FieldBuilder.js';
import kotlinSerialization from './KotlinSerialization.js';

export default (generator: Generator) => {
  entity(generator);
  filed(generator);

  // Apply kotlin-serialization custom hooks
  kotlinSerialization(generator);

  // Apply kotlin config generator.
  generator.hookContext('kotlin:config', context => context.config = new Config(context.config));
};