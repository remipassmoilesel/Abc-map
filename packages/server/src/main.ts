/**
 * Copyright © 2021 Rémi Pace.
 * This file is part of Abc-Map.
 *
 * Abc-Map is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 *
 * Abc-Map is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General
 * Public License along with Abc-Map. If not, see <https://www.gnu.org/licenses/>.
 */

import 'source-map-support/register';
import { Logger } from '@abc-map/shared';
import { HttpServer } from './server/HttpServer';
import { Services, servicesFactory } from './services/services';
import { ConfigLoader } from './config/ConfigLoader';
import { DevInit } from './dev-init/DevInit';

const logger = Logger.get('main.ts', 'info');

let services: Services | undefined;
let server: HttpServer | undefined;

main().catch((err: Error) => {
  logger.error('Server crashed: ', err);
  process.exit(1);
});

async function main() {
  logger.info('Starting Abc-Map ...');
  setupProcessExitHandler();

  logger.info(`Loading configuration: ${ConfigLoader.getPathFromEnv()}`);
  const config = await ConfigLoader.load();
  logger.info('Configuration used: ', JSON.stringify(ConfigLoader.safeConfig(config), null, 2));

  services = await servicesFactory(config);

  if (config.development) {
    await DevInit.create(config, services).init();
  }

  services.datastore.index().catch((err) => logger.error(err));

  server = HttpServer.create(config, services);
  await server.initialize();

  return server.listen().finally(() => terminate());
}

function terminate() {
  return Promise.all([services?.shutdown(), server?.shutdown()]);
}

function setupProcessExitHandler(): void {
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.warn('Received signal SIGTERM');
    terminate()
      .then(() => {
        logger.info('Exiting !');
        process.exit(0);
      })
      .catch((err) => {
        logger.error('Error: ', err);
        process.exit(1);
      });
  });

  // Hurry shutdown
  process.on('SIGINT', async () => {
    logger.warn('Received signal SIGINT');
    terminate()
      .catch((err) => logger.error('Error: ', err))
      .finally(() => {
        logger.info('Exiting !');
        process.exit(1);
      });
  });
}