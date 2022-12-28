import { program } from 'commander';
import generate from './commands/generate.js';
import tokenize from './commands/tokenize.js';

program
  .name('soil')
  .description('CLI to soil-schema')
  .version(process.env.npm_package_version || 'nodata');

program
  .command('generate')
  .summary('Generate codes')
  .description('Generate codes from soil schema under entry directories.')
  .requiredOption('-g --generators <type...>', 'must have generating code types')
  .option('-c, --config <file>', 'config file path', 'soil.config.js')
  .action(async (options, command) => generate({
  }));

program
  .command('tokenize')
  .summary('Tokenize a schema file')
  .description('Actually tokenize a schema file and check the results. This command is for debugging mostly.')
  .argument('<file...>', 'schema file path')
  .option('--no-color', 'disable colorize flag')
  .option('-c, --config <file>', 'config file path', 'soil.config.js')
  .action(async (files, options) => tokenize(files, {
    config: options.config,
  }));

program.parse();