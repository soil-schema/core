import chalk from "chalk";
import path from "path";

type ConfigOptions = {
  config: string,
};

type Config = {
  rootDir: string;
  exportDir?: string | { [key: string]: string };
  generate?: { [key: string]: { [key: string]: any } };
}

const basePath = process.cwd();

export const resolveRelativePath = (targetPath: string): string => path.join(basePath, targetPath);

export const makeConfiguration = async (configPath: string): Promise<Config> => {
  let configObject: Config;
  try {
    configObject = (await import(configPath)).default;
  } catch(error: any) {
    if (error.code == 'ERR_MODULE_NOT_FOUND') {
      console.error(chalk.red(`config file not found at ${configPath}`));
    }
    process.exit(1);
  }

  // Make rootDir absolute.

  if (configObject.rootDir) {
    // Don't touch absolute path.
    if (!path.isAbsolute(configObject.rootDir)) {
      configObject.rootDir = path.resolve(
        path.dirname(configPath),
        configObject.rootDir,
      );
    }
  } else {
    configObject.rootDir = path.dirname(configPath);
  }

  // Resolve exportDir.

  if (typeof configObject.exportDir == 'string') {
    configObject.exportDir = resolveRelativePath(configObject.exportDir);
  }
  if (typeof configObject.exportDir == 'object') {
    const { exportDir } = configObject;
    configObject.exportDir = {};
    for (const langcode in exportDir) {
      configObject.exportDir[langcode] = resolveRelativePath(exportDir[langcode]);
    }
  }

  // Apply rootDir.

  process.chdir(configObject.rootDir);

  return new Promise<Config>(resolve => resolve(configObject));
}

export default async (options: ConfigOptions): Promise<Config> => {
  const configPath = options.config || 'soil.config.js';
  const config = await makeConfiguration(path.join(process.cwd(), configPath));
  return config;
};