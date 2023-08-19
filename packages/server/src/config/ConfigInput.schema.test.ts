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
import { assert } from 'chai';
import { Validation } from '../utils/Validation';
import { ConfigInput } from './Config';

const sampleConfig: ConfigInput = {
  environmentName: 'local',
  externalUrl: 'http://localhost:3005/',
  server: {
    host: '127.0.0.1',
    port: 10_082,
    log: {
      requests: false,
      errors: false,
      warnings: false,
    },
    globalRateLimit: {
      max: 1,
      timeWindow: '10m',
    },
    authenticationRateLimit: {
      max: 1,
      timeWindow: '10m',
    },
  },
  project: {
    maxPerUser: 10,
  },
  database: {
    url: 'mongodb://localhost:27019',
    username: 'admin',
    password: 'admin',
  },
  jwt: {
    algorithm: 'HS512',
  },
  authentication: {
    secret: 'azerty1234',
    tokenExpiresIn: '45min',
    passwordLostExpiresIn: '30min',
  },
  registration: {
    passwordSalt: 'azerty1234',
    secret: 'azerty1234',
    confirmationExpiresIn: '24h',
  },
  smtp: {
    from: 'no-reply@abc-map.fr',
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'lelia16@ethereal.email',
      pass: '63rntn3G4DU3uue2MJ',
    },
  },
  datastore: {
    path: 'resources/datastore',
  },
  development: {
    generateData: {
      users: 10,
      projectsPerUser: 5,
    },
    persistEmails: false,
  },
  legalMentions: '<div>Put legal mentions here !</div>',
};

describe('ConfigInput.schema', () => {
  it('should validate', () => {
    assert.isTrue(Validation.ConfigInput(sampleConfig), Validation.formatErrors(Validation.ConfigInput));
  });

  it('should not validate', () => {
    const config = {
      ...sampleConfig,
      wrongProperty: false,
    };

    assert.isFalse(Validation.ConfigInput(config));
  });
});
