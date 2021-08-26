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

import { FeatureCollection } from 'geojson';
import { AbcProjection } from '../AbcProjection';

export type AbcLayer = AbcVectorLayer | AbcPredefinedLayer | AbcWmsLayer | AbcXyzLayer;

export type LayerMetadata = VectorMetadata | PredefinedMetadata | WmsMetadata | XyzMetadata;

export enum LayerType {
  Vector = 'Vector',
  Predefined = 'Predefined',
  Wms = 'Wms',
  Xyz = 'Xyz',
}

// Base types

export interface AbcBaseLayer {
  type: LayerType;
  metadata: LayerMetadata;
}

export interface BaseMetadata {
  id: string;
  name: string;
  opacity: number;
  visible: boolean;
  active: boolean;
  type: LayerType;
}

// Vector layer

export interface VectorMetadata extends BaseMetadata {
  type: LayerType.Vector;
}

export interface AbcVectorLayer extends AbcBaseLayer {
  type: LayerType.Vector;
  metadata: VectorMetadata;
  features: FeatureCollection;
}

// Predefined layers

export interface PredefinedMetadata extends BaseMetadata {
  type: LayerType.Predefined;
  model: PredefinedLayerModel;
}

export interface AbcPredefinedLayer extends AbcBaseLayer {
  type: LayerType.Predefined;
  metadata: PredefinedMetadata;
}

export enum PredefinedLayerModel {
  OSM = 'OSM',
  StamenToner = 'StamenToner',
  StamenTonerLite = 'StamenTonerLite',
  StamenTerrain = 'StamenTerrain',
  StamenWatercolor = 'StamenWatercolor',
}

// WMS

export interface WmsMetadata extends BaseMetadata {
  type: LayerType.Wms;
  projection?: AbcProjection;
  extent?: [number, number, number, number];
  remoteUrl: string;
  remoteLayerName: string;
  auth?: {
    username: string;
    password: string;
  };
}

export interface AbcWmsLayer extends AbcBaseLayer {
  type: LayerType.Wms;
  metadata: WmsMetadata;
}

// XYZ

export interface XyzMetadata extends BaseMetadata {
  type: LayerType.Xyz;
  projection?: AbcProjection;
  remoteUrl: string;
}

export interface AbcXyzLayer extends AbcBaseLayer {
  type: LayerType.Xyz;
  metadata: XyzMetadata;
}