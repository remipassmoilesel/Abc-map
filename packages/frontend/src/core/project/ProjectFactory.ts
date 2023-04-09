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

import { AbcProjectManifest, AbcProjectMetadata, ProjectConstants } from '@abc-map/shared';
import uuid from 'uuid-random';
import { DateTime } from 'luxon';
import { Views } from '../geo/Views';
import { prefixedTranslation } from '../../i18n/i18n';

const t = prefixedTranslation('ProjectFactory:');

export class ProjectFactory {
  public static newProjectMetadata(): AbcProjectMetadata {
    return {
      id: uuid(),
      version: ProjectConstants.CurrentVersion,
      name: t('Project', { date: DateTime.local().toLocaleString() }),
      containsCredentials: false,
      public: false,
    };
  }

  public static newProjectManifest(): AbcProjectManifest {
    const width = Math.round(document.body.clientWidth * 0.6);
    const height = Math.round(document.body.clientHeight * 0.6);

    return {
      metadata: ProjectFactory.newProjectMetadata(),
      layers: [],
      layouts: [],
      view: Views.random(),
      sharedViews: {
        fullscreen: false,
        mapDimensions: { width, height },
        list: [],
      },
    };
  }
}
