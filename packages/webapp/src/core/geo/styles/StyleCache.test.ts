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

import { StyleCache } from './StyleCache';
import { TestHelper } from '../../utils/test/TestHelper';
import { Style } from 'ol/style';
import { AbcGeometryType, FeatureStyle } from '@abc-map/shared';
import { DefaultStyleOptions } from './StyleFactoryOptions';

describe('StyleCache', function () {
  let cache: StyleCache;
  let props: FeatureStyle;

  beforeEach(() => {
    cache = new StyleCache();
    props = TestHelper.sampleStyleProperties();
  });

  it('should return style', function () {
    const style = new Style();
    cache.put(AbcGeometryType.LINE_STRING, props, DefaultStyleOptions, style);

    const fromCache = cache.get(AbcGeometryType.LINE_STRING, props, DefaultStyleOptions);

    expect(fromCache).toStrictEqual(style);
  });

  it('should return nothing if properties are different', function () {
    const style = new Style();
    cache.put(AbcGeometryType.LINE_STRING, props, DefaultStyleOptions, style);
    const otherProps: FeatureStyle = {
      ...props,
      fill: {
        color1: 'other-color',
      },
    };

    const fromCache = cache.get(AbcGeometryType.LINE_STRING, otherProps, DefaultStyleOptions);

    expect(fromCache).toBeUndefined();
  });

  it('should return nothing if geometry is different', function () {
    const style = new Style();
    cache.put(AbcGeometryType.LINE_STRING, props, DefaultStyleOptions, style);

    const fromCache = cache.get(AbcGeometryType.POLYGON, props, DefaultStyleOptions);

    expect(fromCache).toBeUndefined();
  });

  it('should return nothing if options are different', function () {
    const style = new Style();
    cache.put(AbcGeometryType.LINE_STRING, props, DefaultStyleOptions, style);

    const fromCache = cache.get(AbcGeometryType.LINE_STRING, props, { ...DefaultStyleOptions, withSelection: false });

    expect(fromCache).toBeUndefined();
  });
});
