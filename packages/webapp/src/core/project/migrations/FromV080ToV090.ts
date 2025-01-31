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

import { AbcFile, Logger } from '@abc-map/shared';
import { MigrationProject, ProjectMigration } from './typings';
import semver from 'semver';
import { AbcProjectManifest080 } from './dependencies/080-project-types';
import { AbcProjectManifest090 } from './dependencies/090-project-types';

const NEXT = '0.9.0';

const logger = Logger.get('FromV080ToV090.ts');

/**
 * This migration:
 * - adds shared map dimensions
 * - adds textFrames field to shared views
 * - adds fullscreen field to shared views
 */
export class FromV080ToV090 implements ProjectMigration<AbcProjectManifest080, AbcProjectManifest090> {
  public async interestedBy(manifest: AbcProjectManifest080): Promise<boolean> {
    const version = manifest.metadata.version;
    return semver.lt(version, NEXT);
  }

  public async migrate(manifest: AbcProjectManifest080, files: AbcFile<Blob>[]): Promise<MigrationProject<AbcProjectManifest090>> {
    return {
      manifest: {
        ...manifest,
        sharedViews: {
          list: manifest.sharedViews.map((view) => ({ ...view, textFrames: [] })),
          fullscreen: false,
          mapDimensions: {
            width: Math.round(window.innerWidth * 0.6),
            height: Math.round(window.innerHeight * 0.6),
          },
        },
        metadata: {
          ...manifest.metadata,
          version: NEXT,
        },
      },
      files,
    };
  }
}
