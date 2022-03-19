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

import React, { useState } from 'react';
import { FaIcon } from '../../../../components/icon/FaIcon';
import { IconDefs } from '../../../../components/icon/IconDefs';
import { Modal } from 'react-bootstrap';
import { WithTooltip } from '../../../../components/with-tooltip/WithTooltip';
import { prefixedTranslation } from '../../../../i18n/i18n';
import Cls from './Attributions.module.scss';
import { MapWrapper } from '../../../../core/geo/map/MapWrapper';

interface Props {
  map: MapWrapper;
}

const t = prefixedTranslation('MapView:MainMap.');

/**
 * This component show a button that can be used to display attributions of specified map.
 *
 * It is used for interactive maps.
 *
 * @constructor
 */
export function Attributions(props: Props) {
  const { map } = props;
  const [open, setOpen] = useState(false);
  const attributions = map.getTextAttributions();

  return (
    <>
      <WithTooltip title={t('Attributions')} placement={'top'}>
        <button className={Cls.button} onClick={() => setOpen(true)}>
          <FaIcon icon={IconDefs.faInfo} size={'1.1rem'} className={Cls.icon} />
        </button>
      </WithTooltip>

      <Modal show={open} onHide={() => setOpen(false)} centered>
        <Modal.Header closeButton>{t('Attributions')}</Modal.Header>
        <Modal.Body className={'d-flex flex-column justify-content-center'}>
          {attributions.map((attr) => (
            <div key={attr} className={'mb-3'}>
              {attr}
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <button onClick={() => setOpen(false)} className={'btn btn-outline-secondary'}>
            Fermer
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
