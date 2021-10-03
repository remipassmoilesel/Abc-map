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

import React, { ChangeEvent, Component, ReactNode } from 'react';
import { Modal } from 'react-bootstrap';
import { LayerWrapper } from '../../../../core/geo/layers/LayerWrapper';
import { Logger } from '@abc-map/shared';
import Cls from './EditLayerModal.module.scss';

const logger = Logger.get('EditLayerModal.tsx');

interface Props {
  layer: LayerWrapper;
  onHide: () => void;
}

interface State {
  nameInput: string;
  opacityInput: number;
  attributionsInput: string;
}

class EditLayerModal extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      nameInput: '',
      opacityInput: 1,
      attributionsInput: '',
    };
  }

  public render(): ReactNode {
    const onHide = this.props.onHide;
    const layer = this.props.layer;
    const nameInput = this.state.nameInput;
    const opacityInput = this.state.opacityInput;
    const attributionsInput = this.state.attributionsInput;

    return (
      <Modal show={true} onHide={onHide} dialogClassName={Cls.modal}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier la couche {layer.getName()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={`p-3`}>
            {/* Name of layer */}
            <div className={'mb-2'}>Nom de la couche:</div>
            <input
              type={'text'}
              value={nameInput}
              onChange={this.handleNameChange}
              className={'form-control mb-4'}
              data-testid={'name-input'}
              data-cy={'name-input'}
            />

            {/* Opacity */}
            <div className={'mb-2'}>Opacité:</div>
            <div className={'d-flex align-items-center mb-4'}>
              <input
                type="range"
                value={opacityInput}
                onChange={this.handleOpacityChange}
                min="0"
                max="1"
                step={'0.1'}
                className={Cls.opacitySlider}
                data-testid={'opacity-input'}
              />
              <div className={'ml-2'}>{opacityInput} / 1</div>
            </div>

            {/* Additional attributions */}
            <div className={'my-2'}>Attributions:</div>
            <textarea
              value={attributionsInput}
              onChange={this.handleAttributionsChange}
              rows={3}
              className={'form-control mb-4'}
              data-testid={'attributions-input'}
            />

            <div className={'d-flex justify-content-end'}>
              <button className={'btn btn-secondary mr-3'} onClick={onHide} data-testid={'cancel-button'}>
                Annuler
              </button>
              <button onClick={this.handleConfirm} className={'btn btn-primary'} data-testid={'submit-button'} data-cy={'submit-button'}>
                Confirmer
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  public componentDidMount() {
    this.updateState();
  }

  public componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.layer.getId() !== this.props.layer.getId()) {
      this.updateState();
    }
  }

  private updateState() {
    const layer = this.props.layer;
    this.setState({
      nameInput: layer.getName() || '',
      opacityInput: layer.getOpacity(),
      attributionsInput: layer.getAttributions()?.join('\r\n') || '',
    });
  }

  private handleNameChange = (ev: ChangeEvent<HTMLInputElement>) => {
    this.setState({ nameInput: ev.target.value });
  };

  private handleOpacityChange = (ev: ChangeEvent<HTMLInputElement>) => {
    this.setState({ opacityInput: parseFloat(ev.target.value) });
  };

  private handleAttributionsChange = (ev: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ attributionsInput: ev.target.value });
  };

  private handleConfirm = () => {
    const layer = this.props.layer;
    const newName = this.state.nameInput;
    const opacity = this.state.opacityInput;
    const attributionsInput = this.state.attributionsInput;

    layer.setName(newName).setOpacity(opacity).setAttributions(attributionsInput.split(/\r?\n/));

    this.props.onHide();
  };
}

export default EditLayerModal;
