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
import * as _ from 'lodash';
import { NominatimResult } from '../../../core/geo/NominatimResult';
import SearchResult from './SearchResult';
import { ServiceProps, withServices } from '../../../core/withServices';
import Cls from './Search.module.scss';
import { Extent } from 'ol/extent';

const logger = Logger.get('Search.tsx');

export interface State {
  query: string;
  results: NominatimResult[];
  loading: boolean;
}

class Search extends Component<ServiceProps, State> {
  constructor(props: ServiceProps) {
    super(props);
    this.state = {
      query: '',
      results: [],
      loading: false,
    };
  }

  public render(): ReactNode {
    const results = this.state.results;
    const query = this.state.query;
    const loading = this.state.loading;
    return (
      <div className={`control-block`}>
        <div className={'control-item'}>
          <div className={'my-2'}>Rechercher sur la carte</div>
          <input type={'text'} className={`form-control ${Cls.input}`} value={query} onChange={this.handleSearch} data-cy={'search-on-map'} />
        </div>
        {query && (
          <>
            <div className={Cls.backdrop} onClick={this.handleClose} />
            <div className={Cls.dropdown}>
              {loading && <div className={Cls.message}>Chargement ...</div>}
              {!results.length && !loading && <div className={Cls.message}>Aucun résultat</div>}
              {results.map((res) => (
                <SearchResult key={res.osm_id} result={res} onClick={this.handleResultSelected} />
              ))}
            </div>
          </>
        )}
        <div className={'control-item'}>
          <button className={'btn btn-link'} onClick={this.handleGeolocate} data-testid={'geolocate'}>
            <i className={'fa fa-map-marker-alt mr-2'} /> Afficher ma position
          </button>
        </div>
      </div>
    );
  }

  private handleSearch = (ev: ChangeEvent<HTMLInputElement>) => {
    const query = ev.currentTarget.value;
    this.setState({ query });
    this.search(query);
  };

  private search = _.debounce((query) => {
    const { geo } = this.props.services;

    this.setState({ loading: true });
    geo
      .geocode(query)
      .then((results) => {
        results.sort((res) => res.importance);
        logger.debug('Results: ', results);
        this.setState({ results });
      })
      .catch((err) => logger.error('Error while geocoding: ', err))
      .finally(() => this.setState({ loading: false }));
  }, 500);

  private handleResultSelected = (res: NominatimResult) => {
    const { geo } = this.props.services;

    const bbox = res.boundingbox.map((n) => parseFloat(n)) as [number, number, number, number];
    const extent: Extent = [bbox[2], bbox[0], bbox[3], bbox[1]];

    geo.getMainMap().moveViewToExtent(extent);

    this.setState({ query: '' });
  };

  private handleClose = () => {
    this.setState({ query: '' });
  };

  private handleGeolocate = () => {
    const { geo, toasts } = this.props.services;

    geo
      .getUserPosition()
      .then((coords) => geo.getMainMap().moveViewToPosition(coords, 9))
      .catch((err) => {
        toasts.genericError();
        logger.error('Cannot get current position', err);
      });
  };
}

export default withServices(Search);
