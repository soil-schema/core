export default class Config {

  package: string | undefined;
  use: string[];
  indentLength: number;

  constructor(options: { [key: string]: any }) {
    this.package = options.package;
    this.use = options.use || [];
    this.indentLength = options.indentLength || 4;
  }
}