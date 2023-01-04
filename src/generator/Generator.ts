import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import Node from '../structure/Node.js';
import { SWIFT_LANG_CODE } from './swift/const.js';

type EachCondition = {
  directive?: string;
  separator?: string;
};

export class Context {

  langcode: string;
  node: Node;
  container: HookContainer;
  attributes: string[] = [];
  config: any = {};

  private _blocks: string[] = [];

  constructor(langcode: string, node: Node, container: HookContainer) {
    this.langcode = langcode;
    this.node = node;
    this.container = container;
  }

  get directive(): string {
    return this.node.directive;
  }

  get annotation(): string | null {
    return this.node.annotation || null
  }

  addAttribute(name: string) {
    this.attributes.push(name);
  }

  hasAttribute(name: string): boolean {
    return this.attributes.includes(name);
  }

  get(key: string): string | undefined {
    return this.node.definition[key];
  }

  string(code: string): Context {
    if (code != '') {
      this._blocks.push(code);
    }
    return this;
  }

  content(name: string): Context {
    this.string(this.render(name));
    return this;
  }

  contentEach(conditions: EachCondition, name: string): Context {
    this.string(this.renderEach(conditions, name));
    return this;
  }

  render(name: string): string {
    return this.container.render(name, this);
  }

  renderEach(conditions: EachCondition, name: string): string {
    const block = (context: Context) => context.render(name);
    return this.node.block
      .filter(node => {
        if (typeof conditions.directive == 'string' && node.directive != conditions.directive) return false;
        return true
      })
      .map(node => {
        const context = new Context(this.langcode, node, this.container);
        context.config = this.config;
        return block(context);
      })
      .join(conditions.separator || '\n');
  }

  dup(): Context {
    const context = new Context(this.langcode, this.node, this.container);
    context.config = this.config;
    return context;
  }

  hasChild(directive: string): boolean {
    return this.node.block.findIndex(node => node.directive == directive) > -1;
  }

  getChild(directive: string): Context | undefined {
    const node = this.node.block.find(node => node.directive == directive);
    if (typeof node == 'undefined') {
      return void 0;
    } else {
      const context = new Context(SWIFT_LANG_CODE, node, this.container);
      context.config = this.config;
      return context;
    }
  }

  get body(): string {
    return this._blocks.join('\n');
  }

  toString(): string {
    return this.body;
  }
}

class ContextHook {
  name: string;
  run: (context: Context) => void;

  constructor(name: string, run: (context: Context) => void) {
    this.name = name;
    this.run = run;
  }

  test(hooks: string[]): boolean {
    return hooks.includes(this.name);
  }
}

class ContentHook {
  name: string;
  run: (content: string, context: Context) => string;

  constructor(name: string, run: (content: string, context: Context) => string) {
    this.name = name;
    this.run = run;
  }

  test(hooks: string[]): boolean {
    return hooks.includes(this.name);
  }
}

export class Renderer {
  langcode: string;
  directive: string;
  name: string;
  run: (context: Context) => string;

  constructor(langcode: string, directive: string, name: string, run: (context: Context) => string) {
    this.langcode = langcode;
    this.directive = directive;
    this.name = name;
    this.run = run;
  }

  test(context: Context): boolean {
    return context.langcode == this.langcode && context.directive == this.directive;
  }
}

export class HookContainer {

  contextHooks: ContextHook[] = [];
  contentHooks: ContentHook[] = [];
  renderers: Renderer[] = [];

  hookContext(hook: string, run: (context: Context) => void) {
    this.contextHooks.push(new ContextHook(hook, run));
  }

  hookContent(hook: string, run: (content: string, context: Context) => string) {
    this.contentHooks.push(new ContentHook(hook, run))
  }

  renderer(langcode: string, directive: string, name: string, run: (context: Context) => string) {
    this.renderers.push(new Renderer(langcode, directive, name, run));
  }

  prepare(context: Context, ...hooks: string[]) {
    this.contextHooks.forEach(hook => {
      if (hook.test(hooks)) hook.run(context);
    });
  }

  render(name: string, context: Context): string {
    const hooks = [
      (context.annotation && `${context.langcode}:${context.directive}:${name}`),
      `${context.langcode}:${context.directive}:${name}`,
      `${context.langcode}:${name}`,
    ].filter(e => e) as string[];
    const renderer = this.renderers.find(renderer => renderer.test(context) && renderer.name == name)
    if (typeof renderer == 'undefined') return '';
    this.prepare(context, ...hooks);
    return this.post(renderer.run(context), context, ...hooks);
  }

  post(content: string, context: Context, ...hooks: string[]): string {
    let result = content;
    this.contentHooks.forEach(hook => {
      if (hook.test(hooks)) result = hook.run(content, context);
    });
    return result;
  }
}

type FileWriteOptions = {
  exportDir: string;
  encoding: BufferEncoding;
};

// Generated file.
export class File {
  filename: string;
  body: string;

  constructor(filename: string, body: string) {
    this.filename = filename;
    this.body = body;
  }

  async write(options: FileWriteOptions) {
    const fullpath = path.join(options.exportDir, this.filename);
    const dirpath = path.dirname(fullpath);
    try {
      await stat(dirpath);
    } catch (error: any) {
      if (error.code == 'ENOENT' && error.syscall == 'stat') {
        await mkdir(dirpath, { recursive: true });
      } else {
        console.log(error);
      }
    }
    await writeFile(fullpath, this.body, { encoding: options.encoding, flag: 'w' })
    console.log('Write File:', fullpath);
  }
}

// File builder. (meaning file body template)
export class Template {
  langcode: string;
  directive: string;
  template: (context: Context) => File;

  constructor(langcode: string, directive: string, template: (context: Context) => File) {
    this.langcode = langcode;
    this.directive = directive;
    this.template = template;
  }

  render(hookContainer: HookContainer, context: Context): File {
    const hooks = [
      (context.annotation && `${this.langcode}:${context.directive}:template`),
      `${this.langcode}:${context.directive}:template`,
      `${this.langcode}:template`,
    ].filter(e => e) as string[];
    hookContainer.prepare(context, ...hooks);
    const file = this.template(context);
    file.body = hookContainer.post(file.body, context, ...hooks);
    return file;
  }
}

export default class Generator {

  ast: Node[];
  templates: { [key: string]: Template } = {};
  hooks: HookContainer = new HookContainer();

  constructor(ast: Node[]) {
    this.ast = ast;
  }

  template(template: Template): Generator {
    this.templates[`${template.langcode}:${template.directive}`] = template;
    return this;
  }

  renderer(langcode: string, directive: string, name: string, run: (context: Context) => string) {
    this.hooks.renderer(langcode, directive, name, run);
    return this;
  }

  hookContext(hook: string, run: (context: Context) => void): Generator {
    this.hooks.hookContext(hook, run);
    return this;
  }

  hookContent(hook: string | string[], run: (content: string, context: Context) => string): Generator {
    if (Array.isArray(hook)) {
      hook = hook.join(':');
    }
    this.hooks.hookContent(hook, run);
    return this;
  }

  generate(config: { [key: string]: any }, langcode: string): File[] {
    return this.ast
      .map(node => new Context(langcode, node, this.hooks))
      .map(context => {
        context.config = config;
        this.hooks.prepare(context, `${langcode}:config`);
        return this.templates[`${langcode}:${context.directive}`]?.render(this.hooks, context)
      })
      .filter(file => file) as File[];
  }
}