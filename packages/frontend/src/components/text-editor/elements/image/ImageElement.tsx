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

import Cls from './ImageElement.module.scss';
import { ReactEditor, RenderElementProps, useSelected } from 'slate-react';
import { ImageElement as ImageElementDef } from '../../typings';
import clsx from 'clsx';
import { IconDefs } from '../../../icon/IconDefs';
import { MouseEvent, useCallback, useState } from 'react';
import { CustomEditor } from '../../CustomEditor';
import { useEditor } from '../../useEditor';
import { ButtonMenu } from '../../../button-menu/ButtonMenu';
import { prefixedTranslation } from '../../../../i18n/i18n';
import { Action } from '../../../button-menu/Action';
import { Separator } from '../../../button-menu/Separator';

const t = prefixedTranslation('TextEditor:');

type Props = RenderElementProps & { element: ImageElementDef };

const classes = [Cls.size1, Cls.size2, Cls.size3];

const labels = [t('Small_image'), t('Medium_image'), t('Large_image')];

export function ImageElement(props: Props) {
  const { url, size } = props.element;
  const { editor, readOnly } = useEditor();
  const [menuOpen, setMenuOpen] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  const path = ReactEditor.findPath(editor, props.element);

  const selected = useSelected();
  const hightlighted = !readOnly && selected;

  const handleDelete = useCallback(() => CustomEditor.image.delete(editor, path), [editor, path]);

  const handleImageSize = useCallback(
    (ev: MouseEvent, size: number) => {
      ev.preventDefault();
      ev.stopPropagation();
      CustomEditor.image.setSize(editor, size, path);
    },
    [editor, path]
  );

  const toggleFullScreenPreview = useCallback(() => setFullscreenPreview(!fullscreenPreview), [fullscreenPreview]);

  const sizeClass = classes[size - 1] ?? classes[0];

  return (
    <div {...props.attributes} className={clsx(Cls.container, sizeClass)}>
      {/* Image itself */}
      <img src={url} alt={url} onClick={toggleFullScreenPreview} className={clsx(Cls.img, readOnly && Cls.readonly, hightlighted && Cls.selected)} />

      {/* Image menu, if editable */}
      {(hightlighted || menuOpen) && (
        <ButtonMenu label={t('Manage_image')} icon={IconDefs.faEllipsisVertical} onToggle={(state) => setMenuOpen(state)} className={Cls.menu}>
          {/* Image sizes */}
          {[1, 2, 3].map((size) => (
            <Action
              key={size}
              icon={size === 1 ? IconDefs.faUpRightAndDownLeftFromCenter : undefined}
              label={labels[size - 1]}
              onClick={(ev) => handleImageSize(ev, size)}
            />
          ))}

          <Separator />

          {/* Delete image */}
          <Action label={t('Delete_image')} icon={IconDefs.faTrash} onClick={handleDelete} />
        </ButtonMenu>
      )}

      {/* Fullscreen preview */}
      {fullscreenPreview && (
        <div className={Cls.fullscreenModal} onClick={toggleFullScreenPreview}>
          <img src={url} alt={url} className={Cls.largePreview} />
        </div>
      )}

      {props.children}
    </div>
  );
}