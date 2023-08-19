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

import React, { useCallback, useState, MouseEvent } from 'react';
import { AbcSharedView } from '@abc-map/shared';
import Cls from './SharedViewListItem.module.scss';
import { WithTooltip } from '../../../../components/with-tooltip/WithTooltip';
import { FaIcon } from '../../../../components/icon/FaIcon';
import { IconDefs } from '../../../../components/icon/IconDefs';
import EditViewModal from '../edit-view-modal/EditViewModal';
import { useTranslation } from 'react-i18next';

interface Props {
  view: AbcSharedView;
  active: boolean;
  onSelected: (v: AbcSharedView) => void;
  onDelete: (v: AbcSharedView) => void;
  onUpdate: (before: AbcSharedView, after: AbcSharedView) => void;
}

function SharedViewListItem(props: Props) {
  const { view, onSelected, active, onUpdate, onDelete } = props;
  const { t } = useTranslation('SharedMapSettingsModule');
  const [editModal, showEditModal] = useState(false);

  const handleClick = useCallback(() => onSelected(view), [onSelected, view]);

  const handleDelete = useCallback(
    (ev: MouseEvent) => {
      // We must stop propagation in order to not trigger selection
      ev.stopPropagation();
      onDelete(view);
    },
    [onDelete, view]
  );

  const handleEdit = useCallback((ev: MouseEvent) => {
    ev.stopPropagation();
    showEditModal(true);
  }, []);

  const handleEditionConfirmed = useCallback(
    (after: AbcSharedView) => {
      onUpdate(view, after);
      showEditModal(false);
    },
    [onUpdate, view]
  );

  const handleEditionCanceled = useCallback(() => showEditModal(false), []);

  return (
    <div className={`${Cls.listItem} ${active ? Cls.active : ''}`} onClick={handleClick}>
      <div className={Cls.title}>{view.title}</div>

      <div className={'d-flex align-items-center'}>
        <WithTooltip title={t('Edit_view')}>
          <button onClick={handleEdit} className={Cls.btn}>
            <FaIcon icon={IconDefs.faPencilAlt} />
          </button>
        </WithTooltip>
        <WithTooltip title={t('Delete_view')}>
          <button onClick={handleDelete} className={Cls.btn}>
            <FaIcon icon={IconDefs.faTrash} />
          </button>
        </WithTooltip>
      </div>

      {editModal && <EditViewModal view={view} onConfirm={handleEditionConfirmed} onCancel={handleEditionCanceled} />}
    </div>
  );
}

export default SharedViewListItem;
