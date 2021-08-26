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

import React, { ChangeEvent, Component, ReactNode } from 'react';
import { Logger } from '@abc-map/shared';
import { DataRow, getFields } from '../../../core/data/data-source/DataSource';
import DataTable from '../../../components/data-table/DataTable';
import { ServiceProps, withServices } from '../../../core/withServices';
import { VectorLayerWrapper } from '../../../core/geo/layers/LayerWrapper';
import VectorLayerSelector from '../../../components/vector-layer-selector/VectorLayerSelector';
import { LayerDataSource } from '../../../core/data/data-source/LayerDataSource';
import TipBubble from '../../../components/tip-bubble/TipBubble';
import { DataProcessingTips } from '@abc-map/user-documentation';
import FormLine from '../form-line/FormLine';
import MessageLabel from '../../../components/message-label/MessageLabel';

const logger = Logger.get('GeometryLayerForm.tsx');

export interface GeometryLayerFormValues {
  layer?: VectorLayerWrapper;
  joinBy?: string;
}

interface Props extends ServiceProps {
  values: GeometryLayerFormValues;
  onChange: (params: GeometryLayerFormValues) => void;
}

interface State {
  featureFields: string[];
  dataSamples: DataRow[];
  geometries: number;
}

const UnknownGeometries = -1;

class GeometryLayerForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      featureFields: [],
      dataSamples: [],
      geometries: UnknownGeometries,
    };
  }

  public render(): ReactNode {
    const layer = this.props.values.layer;
    const joinBy = this.props.values.joinBy;
    const geometries = this.state.geometries;
    const featureFields = this.state.featureFields;
    const dataSamples = this.state.dataSamples;

    return (
      <>
        <FormLine>
          <VectorLayerSelector label={'Couche: '} value={layer?.getId()} onSelected={this.handleGeometryLayerSelected} data-cy={'geometry-layer'} />
        </FormLine>

        <FormLine>
          <label htmlFor="geometries-join-by" className={'flex-grow-1'}>
            Jointure avec les données par:
          </label>

          <TipBubble id={DataProcessingTips.JoinBy} />
          <select
            value={joinBy}
            onChange={this.handleJoinByChanged}
            id={'geometries-join-by'}
            className={'form-control'}
            data-cy={'geometries-join-by'}
            data-testid={'geometries-join-by'}
          >
            {!featureFields.length && <option>Sélectionnez une couche</option>}
            {!!featureFields.length &&
              [<option key={0}>Sélectionnez un champ de jointure</option>].concat(
                featureFields.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))
              )}
          </select>
        </FormLine>

        <div className={'my-3'}>
          {layer && geometries < 1 && <MessageLabel icon={'fa-exclamation-triangle'}>Cette couche ne contient aucune géométrie.</MessageLabel>}
          {layer && geometries > 0 && <MessageLabel icon={'fa-info-circle'}>{geometries} géométries seront traitées.</MessageLabel>}
        </div>

        {!!dataSamples.length && (
          <>
            <div className={'mt-5 mb-3'}>Échantillons de données</div>
            <DataTable rows={dataSamples} />
          </>
        )}
      </>
    );
  }

  public componentDidMount() {
    const layer = this.props.values.layer;
    this.layerDataPreview(layer).catch((err) => logger.error('Data preview error: ', err));
  }

  public componentDidUpdate(prevProps: Readonly<Props>) {
    const layer = this.props.values.layer;
    if (layer?.getId() !== prevProps.values.layer?.getId()) {
      this.layerDataPreview(layer).catch((err) => logger.error('Data preview error: ', err));
    }
  }

  private handleGeometryLayerSelected = (layer: VectorLayerWrapper | undefined) => {
    this.layerDataPreview(layer)
      .then(() => {
        const values: GeometryLayerFormValues = {
          ...this.props.values,
          layer,
          joinBy: '', // We reset field when layer change
        };

        this.props.onChange(values);
      })
      .catch((err) => logger.error('Preview error: ', err));
  };

  private handleJoinByChanged = (ev: ChangeEvent<HTMLSelectElement>) => {
    const values: GeometryLayerFormValues = {
      ...this.props.values,
      joinBy: ev.target.value,
    };

    this.props.onChange(values);
  };

  private layerDataPreview(layer: VectorLayerWrapper | undefined): Promise<void> {
    const { toasts } = this.props.services;

    if (!layer) {
      this.setState({ featureFields: [], dataSamples: [] });
      return Promise.resolve();
    }

    return new LayerDataSource(layer)
      .getRows()
      .then((res) => {
        if (!res.length) {
          this.setState({ featureFields: [], dataSamples: [], geometries: 0 });
          return;
        }

        const featureFields = getFields(res[0]);
        const dataSamples = res.slice(0, 3);
        const geometries = res.length;
        this.setState({ featureFields, dataSamples, geometries });
      })
      .catch((err) => {
        logger.error(err);
        toasts.genericError();
        this.setState({ featureFields: [], dataSamples: [], geometries: UnknownGeometries });
      });
  }
}

export default withServices(GeometryLayerForm);