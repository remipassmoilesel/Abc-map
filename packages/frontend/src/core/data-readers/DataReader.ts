import { AbstractDataReader } from './AbstractDataReader';
import { AbcProjection } from '@abc-map/shared-entities';
import BaseLayer from 'ol/layer/Base';
import { GpxReader } from './GpxReader';
import { KmlReader } from './KmlReader';
import { ShapefileReader } from './ShapefileReader';
import { AbcFile } from './AbcFile';
import { FileFormat, FileFormats } from '../datastore/FileFormats';
import { Zipper } from '../datastore/Zipper';
import { GeoJsonReader } from './GeoJsonReader';
import { WmsDefinitionReader } from './WmsDefinitionReader';

export class DataReader {
  public static create(): DataReader {
    const readers = [new GpxReader(), new KmlReader(), new ShapefileReader(), new GeoJsonReader(), new WmsDefinitionReader()];
    return new DataReader(readers);
  }

  constructor(private readers: AbstractDataReader[]) {}

  public async read(files: AbcFile[], projection: AbcProjection): Promise<BaseLayer[]> {
    if (!files.length) {
      return [];
    }

    // First we unzip if needed
    const _files: AbcFile[] = [];
    for (const f of files) {
      if (FileFormats.fromPath(f.path) === FileFormat.ZIP) {
        const unzipped = await Zipper.unzip(f.content);
        _files.push(...unzipped);
      } else {
        _files.push(f);
      }
    }

    // Then we create layers from data
    const result: BaseLayer[] = [];
    for (const r of this.readers) {
      if (await r.isSupported(_files)) {
        const layers = await r.read(_files, projection);
        result.push(...layers);
      }
    }
    return result;
  }
}
