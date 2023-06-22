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
import Cls from './MessageLabel.module.scss';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FaIcon } from '../icon/FaIcon';
import clsx from 'clsx';

export interface Props {
  icon: IconDefinition;
  className?: string;
  'data-testid'?: string;
  children: ReactNode | ReactNode[];
}

class MessageLabel extends Component<Props, {}> {
  public render(): ReactNode {
    const icon = this.props.icon;
    const children = this.props.children;
    const className = this.props.className || '';
    const dataTestId = this.props['data-testid'] || undefined;

    return (
      <div className={clsx(Cls.message, className)} data-testid={dataTestId}>
        <FaIcon icon={icon} className={'mr-2'} size={'1.2rem'} />
        {children}
      </div>
    );
  }
}

export default MessageLabel;
