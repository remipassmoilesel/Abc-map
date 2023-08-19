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

import React, { Component, ReactNode } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MainState } from '../../core/store/reducer';
import { MapActions } from '../../core/store/map/actions';
import ColorPicker from './ColorPickerButton';
import { ServiceProps, withServices } from '../../core/withServices';
import OptionRow from '../../views/map/tool-selector/_common/option-row/OptionRow';
import { withTranslation } from 'react-i18next';
import { prefixedTranslation } from '../../i18n/i18n';

export interface LocalProps {
  /**
   * Display stroke color selection.
   */
  stroke?: boolean;
  /**
   * Display fill color selection.
   */
  fillColor1?: boolean;
  /**
   * Display texture color selection.
   */
  fillColor2?: boolean;
  /**
   * Display point color selection.
   */
  point?: boolean;
}

const mapStateToProps = (state: MainState) => ({
  fillProps: state.map.currentStyle.fill,
  strokeProps: state.map.currentStyle.stroke,
  pointProps: state.map.currentStyle.point,
});

const mapDispatchToProps = {
  setFillColor1: MapActions.setFillColor1,
  setFillColor2: MapActions.setFillColor2,
  setStrokeColor: MapActions.setStrokeColor,
  setPointColor: MapActions.setPointColor,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector> & LocalProps & ServiceProps;

const t = prefixedTranslation('ColorSelector:');

/**
 * Color selector is a group of color pickers used for drawing purposes
 */
class ColorSelector extends Component<Props, {}> {
  public render(): ReactNode {
    const strokeColor = this.props.stroke;
    const fillColor1 = this.props.fillColor1;
    const fillColor2 = this.props.fillColor2;
    const pointColor = this.props.point;

    const strokeProps = this.props.strokeProps;
    const fillProps = this.props.fillProps;
    const pointProps = this.props.pointProps;

    return (
      <div className={'control-item'}>
        {strokeColor && (
          <OptionRow>
            <div>{t('Line')}: </div>
            <ColorPicker value={strokeProps?.color} onClose={this.handleStrokeColor} data-cy={'stroke-color'} />
          </OptionRow>
        )}

        {fillColor1 && (
          <OptionRow>
            <div>{t('Filling')}: </div>
            <ColorPicker value={fillProps?.color1} onClose={this.handleFillColor1} data-cy={'fill-color1'} />
          </OptionRow>
        )}

        {fillColor2 && (
          <OptionRow>
            <div>{t('Texture')}: </div>
            <ColorPicker value={fillProps?.color2} onClose={this.handleFillColor2} data-cy={'fill-color2'} />
          </OptionRow>
        )}

        {pointColor && (
          <OptionRow>
            <div>{t('Icon')}: </div>
            <ColorPicker value={pointProps?.color} onClose={this.handlePointColor} data-cy={'point-color'} />
          </OptionRow>
        )}
      </div>
    );
  }

  private handleStrokeColor = (color: string): void => {
    const { geo } = this.props.services;

    this.props.setStrokeColor(color);
    geo.updateSelectedFeatures((style) => {
      return {
        ...style,
        stroke: {
          ...style.stroke,
          color,
        },
      };
    });
  };

  private handleFillColor1 = (color: string): void => {
    const { geo } = this.props.services;

    this.props.setFillColor1(color);
    geo.updateSelectedFeatures((style) => {
      return {
        ...style,
        fill: {
          ...style.fill,
          color1: color,
        },
      };
    });
  };

  private handleFillColor2 = (color: string): void => {
    const { geo } = this.props.services;

    this.props.setFillColor2(color);
    geo.updateSelectedFeatures((style) => {
      return {
        ...style,
        fill: {
          ...style.fill,
          color2: color,
        },
      };
    });
  };

  private handlePointColor = (color: string): void => {
    const { geo } = this.props.services;

    this.props.setPointColor(color);
    geo.updateSelectedFeatures((style) => {
      return {
        ...style,
        point: {
          ...style.point,
          color,
        },
      };
    });
  };
}

export default withTranslation()(connector(withServices(ColorSelector)));
