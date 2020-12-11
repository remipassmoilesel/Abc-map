import { AbcProject, CURRENT_VERSION, DEFAULT_PROJECTION, LayerType, PredefinedLayerModel } from '@abc-map/shared-entities';
import * as uuid from 'uuid';

export class TestHelper {
  public static sampleProject(): AbcProject {
    return {
      metadata: {
        id: uuid.v4(),
        version: CURRENT_VERSION,
        name: `Test project ${uuid.v4()}`,
        projection: DEFAULT_PROJECTION,
      },
      layers: [
        {
          type: LayerType.Predefined,
          metadata: {
            id: uuid.v4(),
            name: 'OSM Layer',
            type: LayerType.Vector,
            visible: true,
            opacity: 1,
          },
          model: PredefinedLayerModel.OSM,
        },
        {
          type: LayerType.Vector,
          metadata: {
            id: uuid.v4(),
            name: 'OSM Layer',
            type: LayerType.Vector,
            visible: true,
            opacity: 1,
          },
          features: {
            type: 'FeatureCollection',
            features: [
              {
                id: uuid.v4(),
                bbox: [1, 2, 3, 4],
                type: 'Feature',
                properties: {
                  val: 'var',
                },
                geometry: {
                  type: 'Point',
                  coordinates: [1, 5],
                },
              },
            ],
          },
        },
      ],
    };
  }
}
