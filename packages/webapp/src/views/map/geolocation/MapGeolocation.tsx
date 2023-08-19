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

import React, { useCallback, useEffect, useState } from 'react';
import { prefixedTranslation } from '../../../i18n/i18n';
import { MapWrapper } from '../../../core/geo/map/MapWrapper';
import { Switch } from '../../../components/switch/Switch';
import { Logger } from '@abc-map/shared';
import { FoldingInfo } from '../../../components/folding-info/FoldingInfo';
import { toDegrees, toPrecision } from '../../../core/utils/numbers';
import { FaIcon } from '../../../components/icon/FaIcon';
import { IconDefs } from '../../../components/icon/IconDefs';
import { useServices } from '../../../core/useServices';
import { useAppDispatch, useAppSelector } from '../../../core/store/hooks';
import { MapActions } from '../../../core/store/map/actions';
import { GeolocationChanged, GeolocationError, Position } from '../../../core/geo/geolocation/events';
import clsx from 'clsx';

const logger = Logger.get('MapGeolocation.tsx');

const t = prefixedTranslation('MapView:');

export interface Props {
  map: MapWrapper;
}

export function MapGeolocation(props: Props) {
  const { geo, toasts } = useServices();
  const { map } = props;
  const dispatch = useAppDispatch();
  const geolocEnabled = useAppSelector((st) => st.map.geolocation.enabled);
  const followPosition = useAppSelector((st) => st.map.geolocation.followPosition);
  const rotateMap = useAppSelector((st) => st.map.geolocation.rotateMap);
  const [accuracy, setAccuracy] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [altitudeAccuracy, setAltitudeAccuracy] = useState(0);
  const [heading, setHeading] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [position, setPosition] = useState([0, 0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!geolocEnabled) {
      return;
    }

    const geolocation = map.getGeolocation();
    if (!geolocation) {
      logger.error('Geolocation not set');
      return;
    }

    const handleError = (ev: GeolocationError) => {
      setError(ev.error.message || t('Unknown_error'));
    };

    const updateUiState = (ev: Position) => {
      setAccuracy(ev.accuracy || 0);
      setAltitude(ev.altitude || 0);
      setAltitudeAccuracy(ev.altitudeAccuracy || 0);
      setHeading(ev.heading || 0);
      setSpeed(ev.speed || 0);
      setPosition(ev.positionLonLat || [Infinity, Infinity]);
    };

    const handleChange = (ev: GeolocationChanged) => updateUiState(ev.position);

    geolocation.addErrorListener(handleError);
    geolocation.addChangeListener(handleChange);

    // We update manually UI the first time
    updateUiState(geolocation.getPosition());

    return () => {
      geolocation.removeErrorListener(handleError);
      geolocation.removeChangeListener(handleChange);
    };
  }, [followPosition, geolocEnabled, map]);

  const handleGeolocEnabled = useCallback(
    (val: boolean) => {
      if (val) {
        map.enableGeolocation();
        map.getGeolocation()?.onNextChange(() => map.getGeolocation()?.updateMapView());
        map.getGeolocation()?.onNextAccuracyChange(() => map.getGeolocation()?.updateMapView());
      } else {
        map.disableGeolocation();
        dispatch(MapActions.setFollowPosition(false));
        dispatch(MapActions.setRotateMap(false));
      }

      dispatch(MapActions.setGeolocation(val));
    },
    [dispatch, map]
  );

  const handleFollowPosition = useCallback(
    (val: boolean) => {
      if (val) {
        map.getGeolocation()?.updateMapView();
      } else {
        dispatch(MapActions.setRotateMap(false));
      }

      map.getGeolocation()?.followPosition(val);
      dispatch(MapActions.setFollowPosition(val));
    },
    [dispatch, map]
  );

  const handleRotateMap = useCallback(
    (val: boolean) => {
      if (val) {
        map.getGeolocation()?.updateMapView();
      }

      map.getGeolocation()?.rotateMap(val);
      dispatch(MapActions.setRotateMap(val));
    },
    [dispatch, map]
  );

  const handleMapAroundMe = useCallback(() => {
    geo
      .getUserPosition()
      .then((coords) => geo.getMainMap().moveViewToPosition(coords, 9))
      .catch((err) => {
        toasts.genericError();
        logger.error('Cannot get current position', err);
      });
  }, [geo, toasts]);

  return (
    <>
      <div className={'control-block'}>
        <div className={'control-item'}>
          <button onClick={handleMapAroundMe} className={'btn btn-link mb-4'}>
            <FaIcon icon={IconDefs.faMapMarkerAlt} className={'mr-2'} />
            {t('Show_map_around_me')}
          </button>
        </div>

        <div className={'control-item'}>
          <div className={'d-flex justify-content-between align-items-center mb-4'}>
            {t('Enable_geolocation')}
            <Switch value={geolocEnabled} onChange={() => handleGeolocEnabled(!geolocEnabled)} />
          </div>
        </div>

        <div className={'control-item'}>
          <div className={'d-flex justify-content-between align-items-center mb-4'}>
            {t('Follow_position')}
            <Switch value={followPosition} onChange={() => handleFollowPosition(!followPosition)} disabled={!geolocEnabled} />
          </div>
        </div>

        <div className={'control-item'}>
          <div className={'d-flex justify-content-between align-items-center mb-4'}>
            {t('Orient_map')}
            <Switch value={rotateMap} onChange={() => handleRotateMap(!rotateMap)} disabled={!geolocEnabled || !followPosition} />
          </div>
        </div>

        <FoldingInfo title={t('About_confidentiality')}>
          <div>{t('AbcMap_will_not_disclose_your_location')}</div>
          <div>{t('But_your_device_can_do_it')}</div>
        </FoldingInfo>
      </div>

      {geolocEnabled && (
        <>
          <div className={'control-block'}>
            <div className={'control-item'}>
              <b className={'d-block mb-2'}>{t('Your_position')}</b>

              {!!error && <div className={'mb-4'}>{error}</div>}

              {[
                [t('Latitude'), `${toPrecision(position[1], 3)} °`],
                [t('Longitude'), `${toPrecision(position[0], 3)} °`],
              ].map(([label, value]) => (
                <div key={label} className={'d-flex'}>
                  <div className={clsx('flex-grow-1')}>{label}</div>
                  <div>{value}</div>
                </div>
              ))}

              <div className={'mb-3'}></div>

              {[
                [t('Accuracy'), `${Math.round(accuracy)} m`],
                [t('Altitude'), `${toPrecision(altitude)} m +/- ${Math.round(altitudeAccuracy)} m`],
                [t('Heading'), `${toPrecision(toDegrees(heading))} °`],
                [t('Speed'), `${toPrecision(speed, 3)} m/s`],
              ].map(([label, value]) => (
                <div key={label} className={'d-flex'}>
                  <div className={'flex-grow-1'}>{label}</div>
                  <div>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
