import { Env, EnvKey } from './Env';
import { Config } from './Config';
import { Logger } from '../utils/Logger';
import * as path from 'path';
import * as _ from 'lodash';
import { promises as fs } from 'fs';

const logger = Logger.get('ConfigLoader.ts', 'info');

export class ConfigLoader {
  public static readonly DEFAULT_CONFIG = 'resources/configuration/local.js';
  private static _cache: { [k: string]: Config } = {};

  public static async load(): Promise<Config> {
    const env = new Env();
    const configPath = env.get(EnvKey.CONFIG) || ConfigLoader.DEFAULT_CONFIG;
    if (!this._cache[configPath]) {
      this._cache[configPath] = await new ConfigLoader().load(configPath);
    }
    return this._cache[configPath];
  }

  public async load(configPath: string): Promise<Config> {
    if (!path.isAbsolute(configPath)) {
      configPath = path.resolve(configPath);
    }
    logger.info(`Loading configuration: ${configPath}`);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config: Config = _.cloneDeep(require(configPath));

    const parameters: string[] = [
      'environmentName',
      'externalUrl',
      'server',
      'server.host',
      'server.port',
      'database',
      'database.url',
      'database.username',
      'database.password',
      'authentication',
      'authentication.passwordSalt',
      'authentication.jwtSecret',
      'authentication.jwtAlgorithm',
      'authentication.jwtExpiresIn',
      'registration',
      'registration.confirmationSalt',
      'smtp',
      'smtp.host',
      'smtp.port',
      'datastore',
      'datastore.path',
    ];

    parameters.forEach((param) => {
      const value = _.get(config, param);
      if (typeof value === 'undefined') {
        throw new Error(`Missing parameter ${param} in configuration`);
      }
    });

    if (!(await fs.stat(config.datastore.path)).isDirectory()) {
      throw new Error(`Datastore root '${config.datastore.path}' must be a directory`);
    }

    // We remove trailing slash if present
    config.externalUrl = config.externalUrl.trim();
    if (config.externalUrl.slice(-1) === '/') {
      config.externalUrl = config.externalUrl.slice(0, -1);
    }

    logger.info(`Loaded !`);
    return config;
  }
}