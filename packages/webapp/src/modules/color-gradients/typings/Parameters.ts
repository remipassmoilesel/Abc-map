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

import { DataSource } from '../../../core/data/data-source/DataSource';
import { VectorLayerWrapper } from '../../../core/geo/layers/LayerWrapper';
import { ClassificationAlgorithm, GradientAlgorithm } from '../../../core/modules/Algorithm';
import { GradientClass } from './GradientClass';
import { prefixedTranslation } from '../../../i18n/i18n';

const t = prefixedTranslation('ColorGradientsModule:');

export interface Parameters {
  newLayerName: string;
  data: {
    source?: DataSource;
    valueField?: string;
    joinBy?: string;
  };
  geometries: {
    layer?: VectorLayerWrapper;
    joinBy?: string;
  };
  colors: {
    start: string;
    end: string;
    algorithm: GradientAlgorithm;
    classes: GradientClass[];
  };
}

export function newParameters(): Parameters {
  return {
    newLayerName: t('Color_gradients'),
    data: {},
    geometries: {},
    colors: {
      start: '#fee0d1',
      end: '#99390f',
      algorithm: ClassificationAlgorithm.NaturalBreaks,
      classes: [],
    },
  };
}
