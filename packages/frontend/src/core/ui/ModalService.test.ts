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

import { ModalService } from './ModalService';
import { ModalEvent, ModalEventType, ModalStatus } from './typings';
import * as sinon from 'sinon';

describe('ModalService', function () {
  const event: ModalEvent = { type: ModalEventType.FeaturePropertiesClosed, properties: {}, status: ModalStatus.Confirmed };
  let service: ModalService;

  beforeEach(() => {
    service = new ModalService();
  });

  it('addListener()', () => {
    expect(service.getListeners().size).toEqual(0);
    const listener = sinon.stub();

    service.addListener(ModalEventType.FeaturePropertiesClosed, listener);
    service.dispatch(event);

    expect(service.getListeners().size).toEqual(1);
    expect(service.getListeners().get(listener)).toBeDefined();
    expect(listener.callCount).toEqual(1);
    expect(listener.args[0][0]).toEqual(event);
  });

  it('removeListener()', () => {
    const listener = sinon.stub();
    service.addListener(ModalEventType.FeaturePropertiesClosed, listener);

    service.removeListener(ModalEventType.FeaturePropertiesClosed, listener);
    service.dispatch(event);

    expect(service.getListeners().size).toEqual(0);
    expect(service.getListeners().get(listener)).toBeUndefined();
    expect(listener.callCount).toEqual(0);
  });
});