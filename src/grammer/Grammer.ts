import Directive from './Directive.js';
import NodeStructure from '../structure/Node.js';
import TokenProvider from './TokenProvider.js';
import TokenSeeker from './TokenSeeker.js';
import util from 'node:util';

export type DirectiveBuilder = (directive: Directive) => void;

export default class Grammer {

  directives: Directive[] = [];
  rootNames: string[] = [];

  register(directive: Directive): Grammer {
    this.directives.push(directive);
    return this;
  }

  structure(structure: { [key: string]: string[] }): Grammer {
    for (const name in structure) {
      this.directives.find(directive => directive.name == name)?.directives.push(...structure[name]);
    }
    return this;
  }

  root(...names: string[]): Grammer {
    this.rootNames = names;
    return this;
  }

  find(target: string): Directive | undefined {
    return this.directives.find(directive => directive.test(target));
  }
}