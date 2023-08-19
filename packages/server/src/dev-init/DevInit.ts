/**
 * Copyright © 2023 Rémi Pace.
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

import { Services } from '../services/services';
import { UserInit } from './UserInit';
import { ProjectInit } from './ProjectInit';
import { Config, LOCAL_ENVIRONMENT, STAGING_ENVIRONMENT, TEST_ENVIRONMENT } from '../config/Config';
import { Logger } from '@abc-map/shared';

const logger = Logger.get('DevInit');

export class DevInit {
  public static create(config: Config, services: Services) {
    return new DevInit(config, services);
  }

  constructor(private config: Config, private services: Services) {}

  // TODO: test
  public async init(): Promise<void> {
    logger.warn(`/!\\ WARNING, development data will be created with parameters: ${JSON.stringify(this.config.development?.generateData)}`);

    const authorizedEnvs = [LOCAL_ENVIRONMENT, TEST_ENVIRONMENT, STAGING_ENVIRONMENT];
    if (authorizedEnvs.indexOf(this.config.environmentName) === -1) {
      return Promise.reject(new Error("WARNING: do not enable 'development' configuration on an environment other than 'local' or 'test'"));
    }

    const user = UserInit.create(this.config, this.services);
    await user.init();

    const project = ProjectInit.create(this.config, this.services);
    await project.init();
  }
}
