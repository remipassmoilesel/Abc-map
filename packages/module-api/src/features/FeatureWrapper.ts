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

import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { Circle, GeometryCollection, LinearRing, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from 'ol/geom';
import { FeatureStyle } from './FeatureStyle';

export declare type OlGeometry =
  | Geometry
  | Point
  | LineString
  | LinearRing
  | Polygon
  | MultiPoint
  | MultiLineString
  | MultiPolygon
  | GeometryCollection
  | Circle;

export declare type PropertiesMap = { [key: string]: any };
export declare type SimplePropertiesMap = { [key: string]: string | number | undefined };

/**
 * FeatureWrapper wraps Openlayers features, mainly for Abc-Map specific critical operations (selection, styling, ...)
 *
 * The goal is not to replace the use of Openlayers features, but to extend them by composition.
 *
 * Call unwrap() to access the underlying feature.
 */
export interface FeatureWrapper<Geom extends OlGeometry = OlGeometry> {
  unwrap(): Feature<Geom>;
  setId(id?: string | number): FeatureWrapper;
  getId(): string | number | undefined;
  clone(): FeatureWrapper;
  isSelected(): boolean;
  setSelected(value: boolean): FeatureWrapper;
  getStyleProperties(): FeatureStyle;
  setStyleProperties(properties: FeatureStyle): FeatureWrapper;
  setDefaultStyle(): FeatureWrapper;
  getGeometry(): Geom | undefined;
  hasGeometry(...geoms: string[]): boolean;
  setText(text: string): FeatureWrapper;
  getText(): string | undefined;
  getAllProperties(): PropertiesMap;
  getSimpleProperties(): SimplePropertiesMap;
  setProperties(properties: SimplePropertiesMap): FeatureWrapper;
  overwriteSimpleProperties(properties: SimplePropertiesMap): FeatureWrapper;
}

/* eslint-disable @typescript-eslint/no-unused-vars */

export class DumbFeatureWrapper implements FeatureWrapper {
  public clone(): FeatureWrapper {
    return {} as any;
  }

  public getAllProperties(): PropertiesMap {
    return {} as any;
  }

  public getGeometry(): OlGeometry | undefined {
    return {} as any;
  }

  public getId(): string | number | undefined {
    return {} as any;
  }

  public getSimpleProperties(): SimplePropertiesMap {
    return {} as any;
  }

  public getStyleProperties(): FeatureStyle {
    return {} as any;
  }

  public getText(): string | undefined {
    return {} as any;
  }

  public hasGeometry(...geoms: string[]): boolean {
    return {} as any;
  }

  public isSelected(): boolean {
    return {} as any;
  }

  public overwriteSimpleProperties(properties: SimplePropertiesMap): FeatureWrapper {
    return {} as any;
  }

  public setDefaultStyle(): FeatureWrapper {
    return {} as any;
  }

  public setId(id?: string | number): FeatureWrapper {
    return {} as any;
  }

  public setProperties(properties: SimplePropertiesMap): FeatureWrapper {
    return {} as any;
  }

  public setSelected(value: boolean): FeatureWrapper {
    return {} as any;
  }

  public setStyleProperties(properties: FeatureStyle): FeatureWrapper {
    return {} as any;
  }

  public setText(text: string): FeatureWrapper {
    return {} as any;
  }

  public unwrap(): Feature<OlGeometry> {
    return {} as any;
  }
}
