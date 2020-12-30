import React, { Component, ReactNode } from 'react';
import { services } from '../../../core/Services';
import { Logger } from '../../../core/utils/Logger';
import BaseLayer from 'ol/layer/Base';
import { DrawingTool, DrawingTools } from '../../../core/map/DrawingTools';
import { MainState } from '../../../core/store';
import { connect, ConnectedProps } from 'react-redux';
import { MapActions } from '../../../core/store/map/actions';
import './DrawingToolSelector.scss';

// TODO: add help for tools

const logger = Logger.get('DrawingToolSelector.tsx', 'info');

interface LocalProps {
  layers: BaseLayer[];
}

const mapStateToProps = (state: MainState) => ({
  currentTool: state.map.drawingTool,
});

const mapDispatchToProps = {
  setTool: MapActions.setTool,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & LocalProps;

class DrawingToolSelector extends Component<Props, {}> {
  private services = services();

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public render(): ReactNode {
    const buttons = DrawingTools.All.map((tool) => {
      const classes = tool.id === this.props.currentTool?.id ? 'btn btn-primary' : 'btn btn-outline-primary';
      return (
        <button key={tool.id} className={classes} onClick={() => this.onToolSelected(tool)} title={tool.label}>
          {/*TODO: create and use icons*/}
          {tool.icon}
        </button>
      );
    });
    return (
      <div className={'control-block abc-drawing-tool-selector'}>
        <div>Outils de dessin</div>
        <div className={'tool-selector'}>{buttons}</div>
      </div>
    );
  }

  private onToolSelected(tool: DrawingTool): void {
    this.props.setTool(tool);
  }
}

export default connector(DrawingToolSelector);
