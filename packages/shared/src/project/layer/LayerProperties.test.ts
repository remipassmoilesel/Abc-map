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

import { LayerProperties, PredefinedLayerProperties, WmsLayerProperties } from './LayerProperties';

/**
 * If this test fail, you should write a migration script then adapt it
 */
describe('LayerProperties', () => {
  it('LayerProperties should not change without migration', () => {
    /* eslint-disable */
    const witness = '{"Id":"abc:layer:id","Name":"abc:layer:name","Active":"abc:layer:active","Type":"abc:layer:type","Managed":"abc:layer:managed","LastLayerChange":"abc:layers:last-change"}';
    /* eslint-enable */

    expect(JSON.stringify(LayerProperties)).toEqual(witness);
  });

  it('PredefinedLayerProperties should not change without migration', () => {
    /* eslint-disable */
    const witness = '{"Model":"abc:layer:predefined:model"}';
    /* eslint-enable */

    expect(JSON.stringify(PredefinedLayerProperties)).toEqual(witness);
  });

  it('WmsLayerProperties should not change without migration', () => {
    /* eslint-disable */
    const witness = '{"Url":"abc:layer:wms:url","LayerName":"abc:layer:wms:layer-name","Username":"abc:layer:wms:username","Password":"abc:layer:wms:password","Projection":"abc:layer:wms:projection","Extent":"abc:layer:wms:extent"}';
    /* eslint-enable */

    expect(JSON.stringify(WmsLayerProperties)).toEqual(witness);
  });
});