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
import { Config } from '../config/Config';
import { Services, servicesFactory } from '../services/services';
import { HttpServer } from './HttpServer';
import { ConfigLoader } from '../config/ConfigLoader';
import { assert } from 'chai';

describe('HttpServer', () => {
  let config: Config;
  let services: Services;
  let server: HttpServer;

  before(async () => {
    config = await ConfigLoader.load();
    config.server.log.requests = false;
    config.server.log.errors = false;
    config.server.rateLimit.max = 2;
    config.server.rateLimit.timeWindow = '1min';

    services = await servicesFactory(config);
    server = HttpServer.create(config, services);
    await server.initialize();
  });

  after(async () => {
    await services.shutdown();
    await server.shutdown();
  });

  it('should serve index', async () => {
    const res = await server.getApp().inject({
      method: 'GET',
      path: '/',
    });

    assert.equal(res.statusCode, 200);
    assert.match(res.body, /^<!doctype html>/);
  });

  it('should return security headers', async () => {
    const res = await server.getApp().inject({
      method: 'GET',
      path: '/',
    });

    assert.isDefined(res.headers['x-dns-prefetch-control']);
    assert.isDefined(res.headers['x-frame-options']);
    assert.isDefined(res.headers['strict-transport-security']);
    assert.isDefined(res.headers['x-download-options']);
    assert.isDefined(res.headers['x-content-type-options']);
    assert.isDefined(res.headers['x-permitted-cross-domain-policies']);
    assert.isDefined(res.headers['referrer-policy']);
  });

  it('should apply rate limit', async () => {
    for (let i = 0; i <= config.server.rateLimit.max; i++) {
      await server.getApp().inject({
        method: 'GET',
        path: '/',
        headers: {
          'x-forwarded-for': '10.10.10.10',
        },
      });
    }
    const blocked = await server.getApp().inject({
      method: 'GET',
      path: '/',
      headers: {
        'x-forwarded-for': '10.10.10.10',
      },
    });
    const notBlocked = await server.getApp().inject({
      method: 'GET',
      path: '/',
      headers: {
        'x-forwarded-for': '10.10.10.20',
      },
    });

    assert.equal(blocked.statusCode, 429);
    assert.match(blocked.body, /Quota de requêtes dépassé/);
    assert.equal(notBlocked.statusCode, 200);
  });
});
