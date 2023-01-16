import crypto from 'node:crypto';

export type PrettyOptions = {
  indentBlock: string[];
  comment: (string | string[])[];
  stripComment?: boolean;
  indent?: string;
};

const BLOCK_COMMENT_PREFIX = '// BLOCK COMMENT - '

export default class Pretty {

  raw: string;
  content: SourceLine[] = [];

  constructor(content: string) {
    this.raw = content;
  }

  // @todo supports multiline comments.
  pretty(options: PrettyOptions): string {

    // Store block comments.

    const blockComments: { [key: string]: string } = {};

    options.comment.forEach(condition => {
      if (Array.isArray(condition) && condition.length == 2) {
        const [opener, closer] = condition;
        let index = this.raw.indexOf(opener);
        while (index > -1) {
          let closerIndex = this.raw.indexOf(closer, index + opener.length);
          if (closerIndex == -1) break;
          const comment = this.raw.substring(index, closerIndex + closer.length);
          const hash = crypto.createHash('sha256').update(comment).digest('hex');
          this.raw = this.raw.substring(0, index) + BLOCK_COMMENT_PREFIX + hash + this.raw.substring(closerIndex + closer.length);

          blockComments[hash] = comment;

          index = this.raw.indexOf(opener);
        }
      }
    });

    // Make content from raw string.

    this.content = this.raw
      .split(/\r?\n/g)
      .map(line => new SourceLine(line));

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
              // [!] When enable stripping comments, drop trailing one line comments.
              line.body = body.slice(0, index).trimEnd();
            }
            body = body.slice(0, index);
          }
        }
      });

      // - In method chaining, increment indent level.

      if (body.startsWith('.')) { // TODO: Any Languages
        line.indent += 1;
      }

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

    let result = this.content
      .map(line => line.export({ indent }))
      .join('\n')
      .replace(/\r?\n\r?\n(\r?\n)+/g, '\n\n')
      .trim();

    // Restore block comments.

    Object.keys(blockComments).forEach(hash => {
      result = result.replace(`${BLOCK_COMMENT_PREFIX}${hash}`, blockComments[hash]);
    });

    return result;
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