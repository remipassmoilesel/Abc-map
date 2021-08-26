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

import { FeatureStyle } from '@abc-map/shared';
import { MapTool } from '@abc-map/shared';
import { DimensionsPx } from '../../utils/DimensionsPx';
import { PointIconName } from '../../../assets/point-icons/PointIconName';

export interface MapState {
  /**
   * Current tool selected
   */
  tool: MapTool;

  currentStyle: FeatureStyle;

  /**
   * Largest dimensions of the main map. Used for rendering in previews and export to "guess" a style ratio.
   */
  mainMapDimensions: DimensionsPx;
}

export const mapInitialState: MapState = {
  tool: MapTool.None,
  currentStyle: {
    fill: {
      color1: '#FFFFFF',
      color2: '#FF5733',
    },
    stroke: {
      color: '#FF5733',
      width: 5,
    },
    text: {
      color: '#FF5733',
      font: 'AbcCantarell',
      size: 30,
    },
    point: {
      icon: PointIconName.Icon0CircleFill,
      size: 15,
      color: '#FF5733',
    },
  },
  mainMapDimensions: {
    // FIXME: this is an ugly hack, if user does not display map before rendering a layout we must "guess" values
    width: window.screen.width * 0.75,
    height: window.screen.height * 0.85,
  },
};