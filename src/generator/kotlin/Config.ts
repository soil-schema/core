export default class Config {

  package: string | undefined;
  use: string[];

  constructor(options: { [key: string]: any }) {
    this.package = options.package;
    this.use = options.use || [];
  }
}