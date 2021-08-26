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

import { getServices, Services } from '../../../core/Services';
import { HistoryKey } from '../../../core/history/HistoryKey';
import { RemoveFeaturesTask } from '../../../core/history/tasks/features/RemoveFeaturesTask';
import { Logger } from '@abc-map/shared';
import { Shortcuts } from './Shortcuts';

const logger = Logger.get('MapKeyboardListener.ts');

export class MapKeyboardListener {
  public static create() {
    return new MapKeyboardListener(getServices());
  }

  constructor(private services: Services) {}

  public initialize(): void {
    document.body.addEventListener('keypress', this.handleKeyPress);
  }

  public destroy(): void {
    document.body.removeEventListener('keypress', this.handleKeyPress);
  }

  /**
   * Handle keyboard events.
   *
   * This method is public for tests purposes.
   * @param ev
   */
  public handleKeyPress = (ev: KeyboardEvent) => {
    const fromForm = ev.target instanceof Node && ['INPUT', 'TEXTAREA'].indexOf(ev.target.nodeName) !== -1;
    if (fromForm) {
      return;
    }

    if (Shortcuts.isDelete(ev)) {
      this.deleteSelectedFeatures();

      ev.preventDefault();
      ev.stopPropagation();
    } else if (Shortcuts.isRedo(ev)) {
      this.redo();

      ev.preventDefault();
      ev.stopPropagation();
    } else if (Shortcuts.isUndo(ev)) {
      this.undo();

      ev.preventDefault();
      ev.stopPropagation();
    }
  };

  private deleteSelectedFeatures() {
    const { history, geo } = this.services;

    const map = geo.getMainMap();
    const layer = map.getActiveVectorLayer();
    const features = map.getSelectedFeatures();
    if (!layer || !features.length) {
      return;
    }

    features.forEach((f) => layer.getSource().removeFeature(f.unwrap()));
    history.register(HistoryKey.Map, new RemoveFeaturesTask(layer.getSource(), features));
  }

  private undo() {
    const { toasts, history } = this.services;

    if (history.canUndo(HistoryKey.Map)) {
      history.undo(HistoryKey.Map).catch((err) => logger.error(err));
    } else {
      toasts.info("Il n'y a plus rien à annuler");
    }
  }

  private redo() {
    const { toasts, history } = this.services;

    if (history.canRedo(HistoryKey.Map)) {
      history.redo(HistoryKey.Map).catch((err) => logger.error(err));
    } else {
      toasts.info("Il n'y a plus rien à refaire");
    }
  }
}