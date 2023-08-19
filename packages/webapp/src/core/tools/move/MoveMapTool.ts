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

import { Tool } from '../Tool';
import Icon from '../../../assets/tool-icons/move.inline.svg';
import Map from 'ol/Map';
import { MapTool } from '@abc-map/shared';
import { MoveMapInteractionsBundle } from '../common/interactions/MoveMapInteractionsBundle';

export class MoveMapTool implements Tool {
  private map?: Map;
  private move?: MoveMapInteractionsBundle;

  public getId(): MapTool {
    return MapTool.MoveMap;
  }

  public getIcon(): string {
    return Icon;
  }

  public getI18nLabel(): string {
    return 'MoveMap';
  }

  public getModes() {
    return [];
  }

  public setup(map: Map) {
    this.map = map;

    this.move = new MoveMapInteractionsBundle({});
    this.move.setup(map);
  }

  public dispose() {
    this.move?.dispose();
  }
}
