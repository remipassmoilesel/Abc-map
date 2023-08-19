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

import React, { Component } from 'react';
import { Logger } from '@abc-map/shared';
import { GradientClass } from '../../typings/GradientClass';
import ColorPickerButton from '../../../../components/color-picker/ColorPickerButton';
import { prefixedTranslation } from '../../../../i18n/i18n';
import { withTranslation } from 'react-i18next';
import Cls from './ClassRow.module.scss';

const logger = Logger.get('ClassRow.tsx');

interface Props {
  gradientClass: GradientClass;
  onChange: (gradientClass: GradientClass) => void;
}

const t = prefixedTranslation('ColorGradientsModule:');

class ClassRow extends Component<Props, {}> {
  public render() {
    const gradientClass = this.props.gradientClass;

    return (
      <div className={`d-flex flex-row my-1 ${Cls.row}`}>
        <ColorPickerButton value={gradientClass.color} onClose={this.handleColorChange} />
        <div className={'mx-3'}>
          {t('From')} <code>{gradientClass.lower}</code> {t('To')} <code>{gradientClass.upper}</code>
        </div>
      </div>
    );
  }

  private handleColorChange = (color: string) => {
    this.props.onChange({
      ...this.props.gradientClass,
      color,
    });
  };
}

export default withTranslation()(ClassRow);
