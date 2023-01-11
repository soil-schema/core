import chalk from "chalk";
import { Stream, Writable } from "stream";
import Node, { Matcher, Matcher as NodeMatcher } from '../structure/Node.js';

// == Classes.

export type HookCallback = (context: Context) => void;
export type Hook = (context: Context, next: HookCallback) => void;

export class BluePrintRepository {

  blueprints: { [key: string]: BluePrint } = {};
  hooks: { name: string, hook: Hook }[] = [];

  constructor() {
  }

  print(context: Context) {
    const { node } = context;
    if (typeof node == 'undefined') throw new Error('Don\' select a node.');
    const { langcode } = context;
    const name = `${langcode}:file:${node.directive}`;
    const blueprint = this.find(name);
    if (typeof blueprint == 'undefined') {
      throw new Error(`Primary blueprint is not found: ${name}`)
    }

    const hooks = [
      node.annotation && `${langcode}:file:${node.directive}:${node.annotation}`,
      `${langcode}:file:${node.directive}`,
      `${langcode}:file`,
    ].filter(e => e) as string[];

    callHooks(hooks, (context: Context) => blueprint.block(context))(context);

    callHooks([`${langcode}:comment`], (context: Context) => {
      write(context.logs.join('\n'));
    });
  }

  find(...fragments: string[]): BluePrint | undefined {
    while (fragments.length > 0) {
      const name = fragments.join(':');
      const blueprint = this.blueprints[name];
      if (blueprint) return blueprint;
      fragments.pop();
    }
  }
}

export class BluePrint {

  block: (context: Context) => void

  constructor(block: (context: Context) => void) {
    this.block = block;
  }

  print(context: Context): string {
    this.block(context);
    return '';
  }
}

export class File {

  filename: string;
  body: string = '';

  constructor(filename: string) {
    this.filename = filename;
  }
}

export class Block extends Writable {

  buffer: string = '';

  constructor() {
    super();
  }

  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): void {
    this.buffer += chunk;
    callback();
  }
}

export class Context {

  langcode: string;
  node: Node;

  currentFile: File | undefined;
  nodeStack: Node[] = [];
  envKeys: string[] = [];
  stack: Block[] = [];
  logs: string[] = []
  config: any;

  constructor(langcode: string, node: Node) {
    this.langcode = langcode;
    this.node = node;
  }

  beginFile(file: File) {
    this.currentFile = file;
  }

  commit() {
    const last = this.stack.shift();
    last?.end();
    if (last) {
      this.write('\n');
      this.write(last.buffer);
      this.write('\n');
    }
  }

  // Node Accessories.

  get currentNode(): Node {
    return this.nodeStack[0] || this.node;
  }

  get currentBody(): string {
    return this.stack[0]?.buffer || this.currentFile?.body || '';
  }

  get(key: string): string | undefined {
    if (key == 'directive') {
      return this.currentNode.directive;
    }
    if (key == 'annotation') {
      return this.currentNode.annotation;
    }
    return this.currentNode.definition[key];
  }

  inEnv(key: string): boolean {
    return this.envKeys.includes(key);
  }

  require(key: string): string {
    const value = this.get(key);
    if (typeof value == 'string') {
      return value;
    }
    throw new Error(`required attribute is not found: ${key}`);
  }

  beginBlock() {
    this.stack.unshift(new Block());
  }

  write(body: string) {
    if (this.stack.length == 0) {
      const file = this.currentFile;
      if (file) file.body += body;
    } else {
      this.stack[0].write(body);
    }
  }
}

let currentContext: Context | undefined = void 0;

const repository = new BluePrintRepository();

// == DSL

const capture = (): { langcode: string, context: Context, node: Node, file: File } => {

  const context = currentContext;
  if (typeof context == 'undefined') {
    throw new Error('Current context is not set');
  }

  const node = context.nodeStack[0] || context.node;

  const file = context.currentFile;
  if (typeof file == 'undefined') {
    throw new Error('Current node is not set, call `beginFile()` before `current`.');
  }

  return { langcode: context.langcode, context, node, file };
}

export const blueprint = (hook: string, block: (context: Context) => void) => {
  if (typeof repository.blueprints[hook] != 'undefined') {
    throw new Error(`Duplicate BluePrint '${hook}'`);
  }
  repository.blueprints[hook] = new BluePrint(block);
}

export const hook = (name: string, hook: Hook) => {
  repository.hooks.push({ name, hook});
}

export const replace = (replacement: (current: string) => string) => {
  const { context } = capture();
  const block = context.stack[0];
  block.buffer = replacement(block.buffer);
}

/// Start to build new source file.
export const file = (name: string, options: { ext: string }) => {
  const file = new File(`${name}.${options.ext}`)
  currentContext?.beginFile(file);
}

/// Write string into current source file body.
export const write = (...body: (string | HookCallback)[]) => {
  const { context } = capture();
  body.forEach(item => {
    if (typeof item == 'string') {    
      context.write(item);
    } else {
      (item as HookCallback)(context);
    }
  });
}

const callHooks = (hookNames: string[], callback: HookCallback): HookCallback => {

  let hooks: { name: string, hook: Hook }[] = [];
  hookNames.forEach(hookName => {
    hooks.push(...repository.hooks.filter(({ name }) => name == hookName));
  });
  hooks.reverse();

  let cb: HookCallback = callback;
  for (const hook of hooks) {
    let next = cb;
    cb = (context: Context) => { hook.hook(context, next) }
  }

  return cb;
}

/// Run blueprint with finding current langcode and current node directive.
export const block = (name: string) => {
  const { context, langcode, node } = capture();
  context.beginBlock();

  context.logs.push(`begin block: "${langcode}:${name}:${node.directive}"`);

  try {

    const hooks = [
      node.annotation && `${langcode}:${name}:${node.directive}:${node.annotation}`,
      `${langcode}:${name}:${node.directive}`,
      `${langcode}:${name}`,
    ].filter(e => e) as string[];

    callHooks(hooks, repository.find(langcode, name, node.directive)?.block || (() => {}))(context);

  } finally {
    context.commit();
  }
}

/// Run blueprint with finding current langcode and current node directive.
export const statement = (name: string) => {
  const { context, langcode, node } = capture();

  context.logs.push(`run statement: "${langcode}:${name}:${node.directive}"`);

  const hooks = [
    node.annotation && `${langcode}:${name}:${node.directive}:${node.annotation}`,
    `${langcode}:${name}:${node.directive}`,
    `${langcode}:${name}`,
  ].filter(e => e) as string[];

  callHooks(hooks, repository.find(langcode, name, node.directive)?.block || (() => {}))(context);
}

/// Dig child nodes.
export const dig = (condition: string, block: (context: Context) => void) => {

  const { node, context } = capture();
  const matcher = new NodeMatcher(condition);

  const targets = Array.from(node.block)
    .filter(target => target.test(matcher))
  targets
    .forEach(target => {
      try {
        context.nodeStack.unshift(target);
        if (targets[0] === target) {
          context.envKeys.push(`first-${target.directive}`);
        }
        if (targets[targets.length - 1] === target) {
          context.envKeys.push(`last-${target.directive}`);
        }
        if (targets.length == 1) {
          context.envKeys.push(`single-${target.directive}`);
        }
        block(context);
      } finally {
        const checker = context.nodeStack.shift();
        {
          const index = context.envKeys.indexOf(`first-${target.directive}`);
          if (index) delete context.envKeys[index];
        }
        {
          const index = context.envKeys.indexOf(`last-${target.directive}`);
          if (index) delete context.envKeys[index];
        }
        {
          const index = context.envKeys.indexOf(`single-${target.directive}`);
          if (index) delete context.envKeys[index];
        }
        if (checker !== target) throw new Error('Checker mismatch in dig process.');
      }
    });
}

/// Check target node is in children.
export const exists = (condition: string): boolean => {
  const matcher = new Matcher(condition);
  const { node } = capture();
  return node.block.find(node => node.test(matcher)) ? true : false;
}

/// Enter an environment with key
export const env = (key: string, block: () => void) => {
  const { context } = capture();
  context.logs.push(`enter env: ${key}`);
  context.envKeys.push(key);
  try {
    block()
  } finally {
    delete context.envKeys[context.envKeys.indexOf(key)];
  }
}

export const run = (context: Context) => {
  currentContext = context;
  repository.print(context);
};

export const dsl = { blueprint, hook, file, write, block, statement, dig, env }

// for Debug and Test
export const cleanBlueprints = () => {
  repository.blueprints = {};
  repository.hooks = [];
};