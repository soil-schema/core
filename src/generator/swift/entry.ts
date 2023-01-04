import Generator from '../Generator.js';
import entity from './EntityBuilder.js';
import filed from './FieldBuilder.js';
import endpoint from './EndpointBuilder.js';

export default (generator: Generator) => {
  entity(generator);
  filed(generator);
  endpoint(generator);
};