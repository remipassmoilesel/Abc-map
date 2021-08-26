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

import { LocalStorageService, StorageKey } from '../../local-storage/LocalStorageService';
import { Logger, MapTool } from '@abc-map/shared';
import { MainState } from '../reducer';
import { DimensionsPx } from '../../utils/DimensionsPx';

const logger = Logger.get('StorePersistence', 'warn');

/**
 * This class persist Redux store in local storage in order to keep settings.
 *
 * Some state fields are erased before save (in order to get a consistent state at app startup)
 *
 */
export class StorePersistence {
  public static newPersistence() {
    return new StorePersistence(new LocalStorageService());
  }

  constructor(private storage: LocalStorageService) {}

  public loadState(): MainState | undefined {
    try {
      const serializedState = this.storage.get(StorageKey.REDUX_STATE);
      if (!serializedState) {
        return undefined;
      }
      const res = JSON.parse(serializedState);
      logger.debug('Loaded state: ', res);
      return res;
    } catch (err) {
      logger.error(err);
      return undefined;
    }
  }

  /**
   * Clone state then store it in local storage.
   *
   * WARNING: this method can cause performance issues, beware of the map reference
   * @param state
   */
  public saveState(state: MainState): void {
    const cleanState: MainState = {
      ...state,
      project: {
        ...state.project,
      },
      map: {
        ...state.map,
      },
      ui: {
        ...state.ui,
      },
    };

    // We can not store project as most of informations are only present in map
    cleanState.project = undefined as any;
    cleanState.map.tool = MapTool.None;
    // Dimensions will be set at next bootstrap
    cleanState.map.mainMapDimensions = undefined as unknown as DimensionsPx;
    cleanState.ui.historyCapabilities = {};
    try {
      const serializedState = JSON.stringify(cleanState);
      this.storage.set(StorageKey.REDUX_STATE, serializedState);
      logger.debug('Saved state: ', serializedState);
    } catch (err) {
      logger.error(err);
    }
  }
}