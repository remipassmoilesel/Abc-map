import 'source-map-support/register';
import { Logger } from './utils/Logger';
import { HttpServer } from './server/HttpServer';
import { ProjectController } from './projects/ProjectController';
import { servicesFactory } from './services/services';
import { ConfigLoader } from './config/ConfigLoader';
import { UserController } from './users/UserController';
import { AuthenticationController } from './authentication/AuthenticationController';
import { HealthCheckController } from './server/HealthCheckController';
import { DevInit } from './dev-init/DevInit';

const logger = Logger.get('main.ts', 'info');

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});

async function main() {
  logger.info('Starting Abc-Map ...');
  const config = await ConfigLoader.load();
  const services = await servicesFactory(config);
  if (config.development) {
    logger.warn('WARNING, development users will be created and sample projects will be loaded');
    await DevInit.create(config, services).init();
  }
  const publicControllers = [new HealthCheckController(services), new AuthenticationController(services)];
  const privateControllers = [new ProjectController(services), new UserController(services)];
  const server = HttpServer.create(config, publicControllers, privateControllers, services);
  return server.listen().finally(() => services.shutdown());
}
