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

import Cls from './SmallAdvice.module.scss';
import React from 'react';
import { HelpIcon } from '../help-icon/HelpIcon';
import { WithTooltip } from '../with-tooltip/WithTooltip';

interface Props {
  advice: string;
  label?: string;
  className?: string;
  size?: string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
}

export function SmallAdvice(props: Props) {
  const { label, advice, className, size = '1.2rem', placement = 'right' } = props;

  return (
    <WithTooltip title={advice} placement={placement}>
      <div className={Cls.container}>
        {label && <span className={'mr-1'}>{label}</span>}
        <HelpIcon className={className} size={size} />
      </div>
    </WithTooltip>
  );
}
