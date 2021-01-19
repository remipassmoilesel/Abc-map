import React, { Component, ReactNode } from 'react';
import { services } from '../../../core/Services';
import { Logger } from '../../../core/utils/Logger';
import { AbcLayout } from '@abc-map/shared-entities';
import { LayoutHelper } from '../LayoutHelper';
import View from 'ol/View';
import { ManagedMap } from '../../../core/geo/map/ManagedMap';
import './LayoutPreview.scss';
import { MapFactory } from '../../../core/geo/map/MapFactory';

const logger = Logger.get('LayoutPreview.tsx', 'warn');

interface Props {
  layout?: AbcLayout;
  mainMap: ManagedMap;
  onLayoutChanged: (lay: AbcLayout) => void;
}

interface State {
  preview?: ManagedMap;
}

interface MapSupportDimensions {
  width: string;
  height: string;
}

class LayoutPreview extends Component<Props, State> {
  private services = services();
  private mapRef = React.createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public render(): ReactNode {
    const layout = this.props.layout;
    return (
      <div className={'abc-layout-preview'}>
        <h3>{layout?.name}</h3>
        <div className={'preview-container'}>
          <div className={'preview-frame'} ref={this.mapRef} />
        </div>
      </div>
    );
  }

  public componentDidMount() {
    if (!this.mapRef.current) {
      return logger.error('Cannot setup preview, ref is not ready');
    }
    this.initializeMap(this.mapRef.current);

    // After init, we trigger a render later because map may not be ready just after init
    if (this.props.layout) {
      this.updateMap(this.props.layout);
    }
  }

  public componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.layout?.id !== this.props.layout?.id) {
      this.updateMap(this.props.layout);
    }
  }

  public componentWillUnmount() {
    this.cleanupMap();
  }

  private initializeMap(div: HTMLDivElement): ManagedMap {
    logger.info('Initializing preview map');
    const preview = MapFactory.createNaked();
    preview.setTarget(div);

    // We listen for view changes, in order to persist them in layout
    preview.getInternal().on('moveend', this.onPreviewChanged);

    this.setState({ preview });
    return preview;
  }

  private updateMap(layout?: AbcLayout): void {
    logger.info('Updating preview map', layout);
    const div = this.mapRef.current;
    const mainMap = this.props.mainMap;
    const preview = this.state.preview;
    if (!div || !preview) {
      return;
    }
    const divSize = this.getPreviewDimensionsFor(layout);
    div.style.width = divSize.width;
    div.style.height = divSize.height;
    preview.getInternal().updateSize();

    this.services.geo.cloneLayers(mainMap, preview);

    const format = layout?.format;
    const view = layout?.view;
    const mapSize = preview.getInternal().getSize();
    if (!format || !view || !mapSize) {
      return;
    }
    const dimension = LayoutHelper.formatToPixel(format);
    const scaling = Math.min(dimension.width / mapSize[0], dimension.height / mapSize[1]);

    preview.getInternal().setView(
      new View({
        center: view.center,
        resolution: view.resolution * scaling,
        projection: view.projection.name,
      })
    );
  }

  private getPreviewDimensionsFor(layout?: AbcLayout): MapSupportDimensions {
    if (!layout) {
      return { width: '0', height: '0' };
    }

    const format = layout.format;
    const unit = 'vmin';
    const maxHeight = 80;
    const maxWidth = 100;

    // Portrait format
    if (format.height > format.width) {
      const height = maxHeight;
      const width = (format.width * height) / format.height;
      return {
        width: `${width}${unit}`,
        height: `${height}${unit}`,
      };
    }
    // Landscape format
    else {
      const width = maxWidth;
      const height = (format.height * width) / format.width;
      return {
        width: `${width}${unit}`,
        height: `${height}${unit}`,
      };
    }
  }

  // TODO: test, test references to layout (-> immutability)
  private onPreviewChanged = () => {
    const map = this.state.preview;
    const layout = this.props.layout;
    if (!map || !layout) {
      return;
    }
    const format = layout.format;
    const mapSize = map.getInternal().getSize();
    const view = map.getInternal().getView();
    const center = view.getCenter();
    const resolution = view.getResolution();
    const projection = view.getProjection();

    if (!mapSize || !center || !resolution) {
      return;
    }

    const dimension = LayoutHelper.formatToPixel(format);
    const scaling = Math.min(dimension.width / mapSize[0], dimension.height / mapSize[1]);

    const updated: AbcLayout = {
      ...layout,
      format: {
        ...layout.format,
      },
      view: {
        center,
        projection: { name: projection.getCode() },
        resolution: resolution / scaling,
      },
    };

    this.props.onLayoutChanged(updated);
  };

  private cleanupMap(): void {
    logger.info('Cleaning preview map');
    this.state.preview && this.state.preview.dispose();
  }
}

export default LayoutPreview;