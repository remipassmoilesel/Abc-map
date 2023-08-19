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

import Cls from './Leaf.module.scss';
import { RenderLeafProps } from 'slate-react';
import { CSSProperties, useMemo } from 'react';
import clsx from 'clsx';

const sizeClasses = [Cls.size1, Cls.size2, Cls.size3, Cls.size4];

export function Leaf(props: RenderLeafProps) {
  const {
    attributes,
    children,
    leaf: { bold, italic, underline, foregroundColor, backgroundColor, size = 1 },
  } = props;

  const sizeClass = sizeClasses[size - 1] || sizeClasses[0];
  const className = clsx(Cls.leaf, bold && Cls.bold, italic && Cls.italic, underline && Cls.underline, sizeClass);
  const style: CSSProperties = useMemo(() => ({ color: foregroundColor, backgroundColor }), [foregroundColor, backgroundColor]);

  return (
    <span style={style} className={className} {...attributes}>
      {children}
    </span>
  );
}
