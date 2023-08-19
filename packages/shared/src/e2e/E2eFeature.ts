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

export interface E2eFeature {
  getId(): string | number | undefined;
  getProperties(): { [k: string]: E2eFeatureProperty };
  getGeometry(): E2eGeometry | undefined;
  get(property: string): E2eFeatureProperty;
  getStyle(): object[] | object | undefined;
}

export declare type E2eFeatureProperty = object | string | number | undefined;

export interface E2eGeometry {
  getType(): string;
  getExtent(): number[];
}
