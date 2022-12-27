import { writeFile } from 'node:fs/promises';
import path from 'node:path';

export default class Source {

  filename: string;
  content: string;

  constructor(filename: string, content: string) {
    this.filename = filename;
    this.content = content;
  }

  async export(dir: string) {
    await writeFile(path.join(dir, this.filename), this.content);
  }
}