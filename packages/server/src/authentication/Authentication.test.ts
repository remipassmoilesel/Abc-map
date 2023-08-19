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

import { Authentication } from './Authentication';
import { FastifyRequest } from 'fastify';
import { assert } from 'chai';

describe('Authentication', () => {
  it('should return user', () => {
    const req = { user: { user: { id: 'test-user-id' } } } as unknown as FastifyRequest;

    const user = Authentication.from(req);

    assert.equal(user?.id, 'test-user-id');
  });

  it('should return nothing', () => {
    const req = {} as unknown as FastifyRequest;

    const user = Authentication.from(req);

    assert.isUndefined(user);
  });
});
