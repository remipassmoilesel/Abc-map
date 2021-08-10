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

import React, { Component, ReactNode } from 'react';
import { Logger } from '@abc-map/shared';
import TipBubble from '../../../../components/tip-bubble/TipBubble';
import { ToolTips } from '@abc-map/user-documentation';
import Cls from './EditPropertiesToolPanel.module.scss';

const logger = Logger.get('EditPropertiesPanel.tsx');

class EditPropertiesPanel extends Component<{}, {}> {
  public render(): ReactNode {
    return (
      <div className={Cls.editPropertiesPanel}>
        <TipBubble id={ToolTips.EditProperties} label={"Aide de l'outil"} />
      </div>
    );
  }
}

export default EditPropertiesPanel;
