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

import { logger as geoLogger, GeoService } from './GeoService';
import { logger as mapLogger } from './map/MapWrapper';
import { AbcProject, AbcVectorLayer, LayerType, PredefinedLayerModel, PredefinedMetadata } from '@abc-map/shared-entities';
import { TestHelper } from '../utils/TestHelper';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import { MapFactory } from './map/MapFactory';
import { httpExternalClient } from '../http/HttpClients';
import { HistoryService } from '../history/HistoryService';
import { LayerFactory } from './layers/LayerFactory';
import VectorImageLayer from 'ol/layer/VectorImage';
import { VectorLayerWrapper } from './layers/LayerWrapper';

geoLogger.disable();
mapLogger.disable();

// TODO: improve tests
describe('GeoService', () => {
  let service: GeoService;

  beforeEach(() => {
    service = new GeoService(httpExternalClient(5_000), HistoryService.create());
  });

  it('exportLayers()', async () => {
    const map = MapFactory.createNaked();
    const osm = LayerFactory.newOsmLayer();
    const features = LayerFactory.newVectorLayer(new VectorSource({ features: TestHelper.sampleFeatures() }));
    map.addLayer(osm);
    map.addLayer(features);
    map.setActiveLayer(features);

    const layers = await service.exportLayers(map);
    expect(layers).toHaveLength(2);

    expect(layers[0].metadata.type).toEqual(LayerType.Predefined);
    expect(layers[0].metadata.active).toEqual(false);
    expect((layers[0].metadata as PredefinedMetadata).model).toEqual(PredefinedLayerModel.OSM);

    expect(layers[1].metadata.type).toEqual(LayerType.Vector);
    expect(layers[1].metadata.active).toEqual(true);
    expect((layers[1] as AbcVectorLayer).features.features).toHaveLength(3);
  });

  it('importProject()', async () => {
    const project: AbcProject = TestHelper.sampleProject();
    const map = MapFactory.createNaked();

    await service.importProject(map, project);

    const layers = map.getLayers();
    expect(layers[0].unwrap()).toBeInstanceOf(TileLayer);
    expect(layers[1].unwrap()).toBeInstanceOf(VectorImageLayer);
    const features = (layers[1] as VectorLayerWrapper).getSource().getFeatures();
    expect(features).toHaveLength(1);
    expect(features[0].getGeometry()?.getType()).toEqual('Point');
  });

  it('geocode()', async () => {
    const res = await service.geocode('Montpellier');
    expect(res.length).toBeGreaterThan(1);
    expect(res[0].boundingbox).toBeDefined();
    expect(res[0].class).toBeDefined();
    expect(res[0].display_name).toBeDefined();
    expect(res[0].icon).toBeDefined();
    expect(res[0].importance).toBeDefined();
    expect(res[0].lat).toBeDefined();
    expect(res[0].lon).toBeDefined();
    expect(res[0].licence).toBeDefined();
    expect(res[0].osm_id).toBeDefined();
    expect(res[0].osm_type).toBeDefined();
    expect(res[0].place_id).toBeDefined();
    expect(res[0].type).toBeDefined();
  });
});
