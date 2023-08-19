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

import { MapFactory } from './MapFactory';
import { EPSG_4326, LayerProperties, MapTool, PredefinedLayerModel } from '@abc-map/shared';
import Map from 'ol/Map';
import { logger, MapWrapper } from './MapWrapper';
import { ToolRegistry } from '../../tools/ToolRegistry';
import TileLayer from 'ol/layer/Tile';
import { LayerFactory } from '../layers/LayerFactory';
import VectorImageLayer from 'ol/layer/VectorImage';
import { TestHelper } from '../../utils/test/TestHelper';
import sinon from 'sinon';
import BaseEvent from 'ol/events/Event';
import { Views } from '../Views';
import { FeatureWrapper } from '../features/FeatureWrapper';
import { Point } from 'ol/geom';
import { MoveMapTool } from '../../tools/move/MoveMapTool';
import { CommonModes } from '../../tools/common/common-modes';
import { ToolModeHelper } from '../../tools/common/ToolModeHelper';
import { DefaultStyleOptions } from '../styles/StyleFactoryOptions';
import { AttributionFormat } from '../AttributionFormat';

logger.disable();

describe('MapWrapper', function () {
  describe('from()', () => {
    it('from()', () => {
      const map = new Map({});

      const wrapper = MapWrapper.from(map);

      expect(wrapper.unwrap()).toStrictEqual(map);
    });

    it('fromUnknown()', () => {
      const map = new Map({});

      expect(MapWrapper.fromUnknown(map)?.unwrap()).toStrictEqual(map);
      expect(MapWrapper.fromUnknown(null)).toBeUndefined();
      expect(MapWrapper.fromUnknown({})).toBeUndefined();
    });
  });

  it('setDefaultLayers()', () => {
    const map = MapFactory.createNaked();
    map.addLayer(LayerFactory.newVectorLayer());

    map.setDefaultLayers();

    const layers = map.getLayers();
    expect(layers).toHaveLength(2);
    expect(layers[0].unwrap()).toBeInstanceOf(TileLayer);
    expect(layers[1].unwrap()).toBeInstanceOf(VectorImageLayer);
    expect(layers[0].isActive()).toBe(false);
    expect(layers[1].isActive()).toBe(true);
  });

  describe('setTarget(), dispose()', () => {
    it('setTarget() should set proper target and add resize observer', () => {
      const support = document.createElement('div');
      const olMap = new Map({});

      const map = MapWrapper.from(olMap);
      map.addLayer(LayerFactory.newVectorLayer());
      map.setTarget(support);

      expect(olMap.getTarget()).toEqual(support);
      expect(map.getSizeObserver()).toBeDefined();
    });

    it('setTarget() should unset target and resize observer', () => {
      const support = document.createElement('div');
      const olMap = new Map({});

      const map = MapWrapper.from(olMap);
      map.addLayer(LayerFactory.newVectorLayer());
      map.setTarget(support);
      map.setTarget(undefined);

      expect(olMap.getTarget()).toEqual(undefined);
      expect(map.getSizeObserver()).toBeUndefined();
    });

    it('dispose() should dispose map and size observer', () => {
      const support = document.createElement('div');
      const olMap = new Map({});
      olMap.dispose = jest.fn();

      const map = MapWrapper.from(olMap);
      map.addLayer(LayerFactory.newVectorLayer());
      map.setTarget(support);

      expect(map.getSizeObserver()).toBeDefined();

      map.dispose();
      expect(olMap.dispose).toHaveBeenCalled();
      expect(map.getSizeObserver()).toBeUndefined();
    });
  });

  describe('Add layer', function () {
    it('should add layer', function () {
      const map = MapFactory.createNaked();
      map.addLayer(LayerFactory.newVectorLayer());

      expect(map.unwrap().getLayers().getLength()).toEqual(1);
      expect(map.unwrap().getLayers().getArray()[0]).toBeInstanceOf(VectorImageLayer);
    });
  });

  describe('setActiveLayer()', () => {
    it('on wrong layer', () => {
      const map = MapFactory.createNaked();
      const layer1 = LayerFactory.newPredefinedLayer(PredefinedLayerModel.OSM);

      expect(() => map.setActiveLayer(layer1)).toThrow(new Error('Layer does not belong to map'));
    });

    it('once', () => {
      const map = MapFactory.createNaked();
      const layer1 = LayerFactory.newPredefinedLayer(PredefinedLayerModel.OSM);
      const layer2 = LayerFactory.newVectorLayer();
      const layer3 = LayerFactory.newVectorLayer();
      map.addLayer(layer1);
      map.addLayer(layer2);
      map.addLayer(layer3);

      map.setActiveLayer(layer2);
      const layers = map.getLayers();
      expect(layers).toHaveLength(3);
      expect(map.unwrap().getLayers().get(LayerProperties.LastLayerChange)).toBeDefined();
      expect(layers[0].isActive()).toEqual(false);
      expect(layers[1].isActive()).toEqual(true);
      expect(layers[2].isActive()).toEqual(false);
    });

    it('twice', () => {
      const map = MapFactory.createNaked();
      const layer1 = LayerFactory.newPredefinedLayer(PredefinedLayerModel.OSM);
      const layer2 = LayerFactory.newVectorLayer();
      const layer3 = LayerFactory.newVectorLayer();
      map.addLayer(layer1);
      map.addLayer(layer2);
      map.addLayer(layer3);

      map.setActiveLayer(layer2);
      map.setActiveLayer(layer3);
      const layers = map.getLayers();
      expect(layers).toHaveLength(3);
      expect(map.unwrap().getLayers().get(LayerProperties.LastLayerChange)).toBeDefined();
      expect(layers[0].isActive()).toEqual(false);
      expect(layers[1].isActive()).toEqual(false);
      expect(layers[2].isActive()).toEqual(true);
    });

    it('with undefined value', () => {
      // Prepare
      const map = MapFactory.createNaked();
      const layer = LayerFactory.newPredefinedLayer(PredefinedLayerModel.OSM);
      map.addLayer(layer);
      map.setActiveLayer(layer);

      // Act
      map.setActiveLayer(undefined);

      // Assert
      expect(map.getActiveLayer()).toEqual(undefined);
      expect(layer.isActive()).toEqual(false);
    });

    it('should reset selection', () => {
      // Prepare
      const map = MapFactory.createNaked();
      const layer1 = LayerFactory.newVectorLayer();
      const layer2 = LayerFactory.newVectorLayer();
      map.addLayer(layer1);
      map.addLayer(layer2);
      map.setActiveLayer(layer1);

      const feature1 = FeatureWrapper.create();
      const feature2 = FeatureWrapper.create();
      layer1.getSource().getFeaturesCollection()?.push(feature1.unwrap());
      layer1.getSource().getFeaturesCollection()?.push(feature2.unwrap());

      map.getSelection().add([feature1]);
      map.getSelection().add([feature2]);

      // Act
      map.setActiveLayer(layer2);

      // Assert
      expect(map.getSelection().getFeatures()).toEqual([]);
      expect(feature1.isSelected()).toBe(false);
      expect(feature2.isSelected()).toBe(false);
    });
  });

  describe('getActiveLayer()', () => {
    it('should return undefined if no layer active', () => {
      const map = MapFactory.createNaked();

      expect(map.getActiveLayer()).toBeUndefined();
    });

    it('should return layer if one is active', () => {
      const map = MapFactory.createNaked();
      const layer1 = LayerFactory.newPredefinedLayer(PredefinedLayerModel.OSM);
      map.addLayer(layer1);
      map.setActiveLayer(layer1);

      expect(map.getActiveLayer()).toEqual(layer1);
    });
  });

  describe('getActiveVectorLayer()', () => {
    it('should return undefined if no layer active', () => {
      const map = MapFactory.createNaked();

      expect(map.getActiveVectorLayer()).toBeUndefined();
    });

    it('should return undefined if no vector layer active', () => {
      const map = MapFactory.createNaked();
      const layer = LayerFactory.newPredefinedLayer(PredefinedLayerModel.OSM);
      map.addLayer(layer);
      map.setActiveLayer(layer);

      expect(map.getActiveVectorLayer()).toBeUndefined();
    });

    it('should return layer if one vector is active', () => {
      const map = MapFactory.createNaked();
      const layer1 = LayerFactory.newVectorLayer();
      map.addLayer(layer1);
      map.setActiveLayer(layer1);

      expect(map.getActiveVectorLayer()).toEqual(layer1);
    });
  });

  describe('Tool handling', () => {
    it('setDefaultTool()', () => {
      const map = MapFactory.createNaked();
      expect(map.getTool()?.getId()).toEqual(undefined);

      map.setDefaultTool();

      expect(map.getTool()).toBeInstanceOf(MoveMapTool);
      expect(map.getTool()?.getId()).toEqual(MapTool.MoveMap);
      expect(TestHelper.interactionNames(map.unwrap())).toEqual(['DragRotate', 'DragPan', 'PinchRotate', 'PinchZoom', 'MouseWheelZoom']);
    });

    it('setDefaultTool() should dispatch', () => {
      // Prepare
      const map = MapFactory.createNaked();

      const toolListener = jest.fn();
      map.addToolListener(toolListener);

      // Act
      map.setDefaultTool();

      // Assert
      expect(toolListener).toHaveBeenCalled();
    });

    it('setTool() should dispose previous tool', () => {
      // Prepare
      const map = MapFactory.createNaked();
      const layer = LayerFactory.newVectorLayer();
      map.addLayer(layer);
      map.setActiveLayer(layer);

      const previous = ToolRegistry.getById(MapTool.LineString);
      previous.dispose = jest.fn();
      map.setTool(previous);

      // Act
      map.setTool(ToolRegistry.getById(MapTool.LineString));

      // Assert
      expect(previous.dispose).toHaveBeenCalledTimes(1);
    });

    it('setTool() should do nothing if active layer is raster', () => {
      // Prepare
      const map = MapFactory.createNaked();
      const layer = LayerFactory.newPredefinedLayer(PredefinedLayerModel.OSM);
      map.addLayer(layer);
      map.setActiveLayer(layer);

      // Act
      map.setTool(ToolRegistry.getById(MapTool.LineString));

      // Assert
      expect(map.getTool()).toBeInstanceOf(MoveMapTool);
      expect(TestHelper.interactionNames(map.unwrap())).toEqual(['DragRotate', 'DragPan', 'PinchRotate', 'PinchZoom', 'MouseWheelZoom']);
    });

    it('setTool() should setup tool', () => {
      // Prepare
      const map = MapFactory.createNaked();
      const layer = LayerFactory.newVectorLayer();
      map.addLayer(layer);
      map.setActiveLayer(layer);

      const tool = ToolRegistry.getById(MapTool.LineString);
      tool.setup = jest.fn();

      // Act
      map.setTool(tool);

      // Assert
      expect(tool.setup).toHaveBeenCalled();
      expect(map.getTool()).toStrictEqual(tool);
    });

    it('setTool() should dispatch', () => {
      // Prepare
      const map = MapFactory.createNaked();
      const layer = LayerFactory.newVectorLayer();
      map.addLayer(layer);
      map.setActiveLayer(layer);

      const toolListener = jest.fn();
      map.addToolListener(toolListener);

      // Act
      map.setTool(ToolRegistry.getById(MapTool.LineString));

      // Assert
      expect(toolListener).toHaveBeenCalled();
    });

    it('Set tile layer as active layer should set up default tool', () => {
      // Prepare
      const map = MapFactory.createNaked();
      const vector = LayerFactory.newVectorLayer();
      const tile = LayerFactory.newPredefinedLayer(PredefinedLayerModel.OSM);

      map.addLayer(vector);
      map.addLayer(tile);
      map.setActiveLayer(vector);
      map.setTool(ToolRegistry.getById(MapTool.LineString));
      expect(TestHelper.interactionCount(map.unwrap(), 'Draw')).toEqual(1);

      // Act
      map.setActiveLayer(tile);

      // Assert
      expect(map.getTool()).toBeInstanceOf(MoveMapTool);
      expect(TestHelper.interactionCount(map.unwrap(), 'Draw')).toEqual(0);
    });

    it('setToolMode() should call modeChanged()', () => {
      // Prepare
      const map = MapFactory.createNaked();
      const vector = LayerFactory.newVectorLayer();
      map.addLayer(vector);
      map.setActiveLayer(vector);

      const tool = ToolRegistry.getById(MapTool.LineString);
      tool.modeChanged = jest.fn();
      map.setTool(tool);

      const toolListener = jest.fn();
      map.addToolListener(toolListener);

      // Act
      map.setToolMode(CommonModes.ModifyGeometry);

      // Assert
      expect(tool.modeChanged).toHaveBeenCalled();
      expect(ToolModeHelper.get(map.unwrap())).toEqual(CommonModes.ModifyGeometry);
      expect(toolListener).toHaveBeenCalled();
    });
  });

  describe('getAttributions()', () => {
    it('with no layer', () => {
      const map = MapFactory.createNaked();

      expect(map.getAttributions(AttributionFormat.Text)).toEqual([]);
    });

    it('with several layers', () => {
      const map = MapFactory.createNaked();
      map.addLayer(LayerFactory.newPredefinedLayer(PredefinedLayerModel.OSM));
      map.addLayer(LayerFactory.newPredefinedLayer(PredefinedLayerModel.StamenToner));

      expect(map.getAttributions(AttributionFormat.Text)).toEqual(['© OpenStreetMap contributors.', 'Map tiles by Stamen Design, under CC BY 3.0.']);
    });

    it('with hidden layers', () => {
      const map = MapFactory.createNaked();
      map.addLayer(LayerFactory.newPredefinedLayer(PredefinedLayerModel.OSM).setVisible(false));
      map.addLayer(LayerFactory.newVectorLayer());

      expect(map.getAttributions(AttributionFormat.Text)).toEqual([]);
    });

    it('with same attributions', () => {
      // Prepare
      const map = MapFactory.createNaked();

      const layer1 = LayerFactory.newVectorLayer();
      layer1.setAttributions([
        '&#169; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.',
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors.',
        'Map tiles by <a href="https://stamen.com/" target="_blank" rel="noreferrer">Stamen Design</a>, under CC BY 3.0.',
      ]);
      map.addLayer(layer1);

      const layer2 = LayerFactory.newVectorLayer();
      layer2.setAttributions([
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors.',
        'Map tiles by <a href="https://stamen.com/" target="_blank" rel="noreferrer">Stamen Design</a>, under CC BY 3.0.',
      ]);
      map.addLayer(layer2);

      // Act & assert
      expect(map.getAttributions(AttributionFormat.Text)).toEqual(['© OpenStreetMap contributors.', 'Map tiles by Stamen Design, under CC BY 3.0.']);
    });
  });

  describe('Tile error listener', () => {
    it('addTileErrorListener()', () => {
      // Prepare
      const map = MapFactory.createNaked();
      map.addLayer(LayerFactory.newPredefinedLayer(PredefinedLayerModel.OSM));
      map.addLayer(LayerFactory.newPredefinedLayer(PredefinedLayerModel.StamenToner));

      const event = new BaseEvent('tileloaderror');
      event.target = map.getLayers()[0].getSource();

      const listener = sinon.stub();

      // Act
      map.addTileErrorListener(listener);
      map.getLayers()[0].getSource().dispatchEvent(event);

      // Assert
      expect(listener.callCount).toEqual(1);
      expect(listener.args[0][0].layer.getId()).toEqual(map.getLayers()[0].getId());
    });
  });

  it('moveViewToExtent()', () => {
    const map = MapFactory.createNaked();
    map.setView(Views.defaultView());

    map.moveViewToExtent([5.8795028, 43.1010435, 5.9873841, 43.171494], EPSG_4326, 0);

    expect(map.getView()).toEqual({
      center: [660507.903504684, 5332737.942197564],
      resolution: 120.092913821,
      rotation: 0,
      projection: { name: 'EPSG:3857' },
    });
  });

  it('moveViewToPosition()', () => {
    const map = MapFactory.createNaked();
    map.setView(Views.defaultView());

    map.moveViewToPosition([3.8371328, 43.6207616], 5);

    expect(map.getView()).toEqual({
      center: [427147.669402168, 5406940.509560228],
      resolution: 4891.969810251,
      rotation: 0,
      projection: { name: 'EPSG:3857' },
    });
  });

  it('forEachFeatureSelected()', () => {
    // Prepare
    const map = MapFactory.createNaked();
    const layer = LayerFactory.newVectorLayer();
    map.addLayer(layer);
    map.setActiveLayer(layer);

    const f1 = FeatureWrapper.create(new Point([1, 1])).setSelected(true);
    const f2 = FeatureWrapper.create(new Point([1, 1])).setSelected(true);
    const f3 = FeatureWrapper.create(new Point([1, 1])).setSelected(false);
    layer.getSource().addFeatures([f1.unwrap(), f2.unwrap(), f3.unwrap()]);

    const handler = sinon.stub();

    // Act
    const result = map.forEachFeatureSelected(handler);

    // Assert
    expect(result).toEqual(2);
    expect(handler.args).toEqual([
      [f1, layer],
      [f2, layer],
    ]);
  });

  it('importLayersFrom()', () => {
    // Prepare
    const origin = MapFactory.createNaked();
    origin.addLayer(LayerFactory.newPredefinedLayer(PredefinedLayerModel.OSM).setName('Test layer 1'));
    origin.addLayer(LayerFactory.newVectorLayer().setName('Test layer 2'));

    const destination = MapFactory.createNaked();

    // Act
    destination.importLayersFrom(origin);

    // Assert
    expect(destination.getLayers().map((l) => l.getName())).toEqual(['Test layer 1', 'Test layer 2']);
    expect(destination.getLayers().map((l) => l.unwrap().get(LayerProperties.StyleOptions))).toEqual([undefined, DefaultStyleOptions]);
  });
});
