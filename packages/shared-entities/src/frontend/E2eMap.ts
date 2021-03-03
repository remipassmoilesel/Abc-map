import { BaseMetadata, LayerMetadata } from '../project';

export interface E2eMap {
  getLayersMetadata(): LayerMetadata[];

  getActiveLayerMetadata(): BaseMetadata | undefined;

  getActiveLayerFeatures(): E2eFeature[];

  getViewExtent(): [number, number, number, number];
}

export interface E2eFeature {
  getId(): string | number | undefined;
  getStyle(): any;
  getGeometryName(): string;
  getGeometry(): E2eGeometry | undefined;
  getProperties(): { [key: string]: any };
  get(k: string): any;
}

export interface E2eGeometry {
  getType(): GeometryType;
  getExtent(): [number, number, number, number];
}

export type GeometryType =
  | 'Point'
  | 'LineString'
  | 'LinearRing'
  | 'Polygon'
  | 'MultiPoint'
  | 'MultiLineString'
  | 'MultiPolygon'
  | 'GeometryCollection'
  | 'Circle';
