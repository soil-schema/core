export type PrettyOptions = {
  indentBlock: string[];
  comment: (string | string[])[];
  stripComment?: boolean;
  indent?: string;
};

export default class Pretty {

  content: SourceLine[];

  constructor(content: string) {
    this.content = content.split(/\r?\n/g).map(line => new SourceLine(line));
  }

  // @todo supports multiline comments.
  pretty(options: PrettyOptions): string {
    const blockOpener = options.indentBlock.map(s => s[0]);
    const blockCloser = options.indentBlock.map(s => s[1]);
    const { indent = '  ' } = options;
    var indentLevel = 0;

    this.content.forEach(line => {
      let body = line.body.trim();
      // [!] When first character is block closer, decrement indent level temporary.
      line.indent = blockCloser.includes(body[0]) ? Math.max(0, indentLevel - 1) : indentLevel;

      // - Drop one-line comments.

      options.comment.forEach(condition => {
        if (typeof condition == 'string') {
          const index = body.indexOf(condition);
          if (index > -1) {
            if (options.stripComment == true) {
              // [!] When enable stripping comments, modify source code.
              line.body = body.slice(0, index).trimEnd();
            }
            body = body.slice(0, index);
          }
        }
      });

      // - Check block opener / closer and update indentLevel variable.

      for (let index = 0; index < body.length; index++) {
        const c = body[index];
        if (blockOpener.includes(c)) {
          indentLevel += 1;
        }
        if (blockCloser.includes(c)) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
      }
    });

    return this.content
      .map(line => line.export({ indent }))
      .join('\n')
      .replace(/\r?\n\r?\n\r?\n/g, '\n\n')
      .trim();
  }
}

export class SourceLine {

  indent: number = 0;
  body: string;
  attributes: Set<string> = new Set<string>();

  constructor(body: string) {
    this.body = body;
  }

  export(options: { indent: string }): string {
    const { indent } = options;
    return this.body == '' ? '' : indent.repeat(this.indent) + this.body.trimStart();
  }
}