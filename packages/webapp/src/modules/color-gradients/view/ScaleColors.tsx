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

import React, { Component } from 'react';
import { Logger } from '@abc-map/shared';
import ColorPicker from '../../../components/color-picker/ColorPickerButton';
import FormLine from '../../../components/form-line/FormLine';
import { prefixedTranslation } from '../../../i18n/i18n';

const logger = Logger.get('ColorScaleSelection.tsx');

interface Props {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}

const t = prefixedTranslation('ColorGradientsModule:');

class ScaleColors extends Component<Props, {}> {
  public render() {
    const start = this.props.start;
    const end = this.props.end;

    return (
      <>
        <FormLine>
          <div className={'flex-grow-1'}>{t('Start_color')}:</div>
          <ColorPicker value={start} onClose={this.handleStartChanged} />
        </FormLine>

        <FormLine>
          <div className={'flex-grow-1'}>{t('End_color')}:</div>
          <ColorPicker value={end} onClose={this.handleEndChanged} />
        </FormLine>
      </>
    );
  }

  private handleStartChanged = (value: string) => {
    this.props.onChange(value, this.props.end);
  };

  private handleEndChanged = (value: string) => {
    this.props.onChange(this.props.start, value);
  };
}

export default ScaleColors;
