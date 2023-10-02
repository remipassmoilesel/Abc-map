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

import Cls from './LayoutList.module.scss';
import React from 'react';
import { Logger } from '@abc-map/shared';
import { AbcLayout } from '@abc-map/shared';
import LayoutListItem from './LayoutListItem';
import { useTranslation, withTranslation } from 'react-i18next';
import { FaIcon } from '../../../../components/icon/FaIcon';
import { IconDefs } from '../../../../components/icon/IconDefs';

const logger = Logger.get('LayoutList.tsx', 'warn');

interface Props {
  active?: AbcLayout;
  layouts: AbcLayout[];
  onSelected: (lay: AbcLayout) => void;
  onNewLayout: () => void;
  onDeleted: (lay: AbcLayout) => void;
}

function LayoutList(props: Props) {
  const { layouts, onSelected, onDeleted, onNewLayout } = props;
  const { t } = useTranslation('MapExport');

  return (
    <div className={Cls.layoutList} data-cy={'layout-list'}>
      <div className={'m-4 fw-bold'}>{t('Layouts')}</div>

      {/* List of layouts */}
      {layouts.map((lay) => {
        const active = props.active?.id === lay.id;
        return <LayoutListItem key={lay.id} active={active} layout={lay} onSelected={onSelected} onDeleted={onDeleted} />;
      })}

      {/* No layouts, information message */}
      {!layouts.length && (
        <div className={'m-4'} data-cy={'no-layout'}>
          {t('List_of_layouts_displayed_here')}
        </div>
      )}

      {/* New layout button */}
      <div className={'d-flex justify-content-end align-items-center p-3 mb-3'}>
        <button onClick={onNewLayout} className={`btn btn-link`}>
          <FaIcon icon={IconDefs.faPlus} size={'1.1rem'} className={'mr-2'} /> {t('New_layout')}
        </button>
      </div>
    </div>
  );
}

export default withTranslation()(LayoutList);
