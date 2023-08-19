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

import { ProjectionDocument } from './ProjectionDocument';
import { ProjectionDto } from '@abc-map/shared';

export class ProjectionMapper {
  public static docToDto(doc: ProjectionDocument): ProjectionDto {
    return {
      code: doc.code || undefined,
      kind: doc.kind || undefined,
      bbox: doc.bbox || undefined,
      wkt: doc.wkt || undefined,
      unit: doc.unit || undefined,
      proj4: doc.proj4 || undefined,
      name: doc.name || undefined,
      area: doc.area || undefined,
      default_trans: doc.default_trans || undefined,
      trans: doc.trans || undefined,
      accuracy: doc.accuracy || undefined,
    };
  }
}
