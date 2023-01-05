import Generator from '../Generator.js';
import Config from './Config.js';
import entity from './EntityBuilder.js';
import field from './FieldBuilder.js';
import endpoint from './EndpointBuilder.js';
import kotlinSerialization from './KotlinSerialization.js';

export default (generator: Generator) => {
  entity(generator);
  field(generator);
  endpoint(generator);

  // Apply kotlin-serialization custom hooks
  kotlinSerialization(generator);

  // Apply kotlin config generator.
  generator.hookContext('kotlin:config', context => context.config = new Config(context.config));
};