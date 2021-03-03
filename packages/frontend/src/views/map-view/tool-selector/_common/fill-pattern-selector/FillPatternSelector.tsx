import React, { ChangeEvent, Component, ReactNode } from 'react';
import { Logger } from '../../../../../core/utils/Logger';
import { FillPatterns } from '@abc-map/shared-entities';
import { LabelledFillPatterns } from './LabelledFillPatterns';
import { FillPatternFactory } from '../../../../../core/geo/style/FillPatternFactory';
import { MainState } from '../../../../../core/store/reducer';
import { MapActions } from '../../../../../core/store/map/actions';
import { connect, ConnectedProps } from 'react-redux';
import { services } from '../../../../../core/Services';
import Cls from './FillPatternSelector.module.scss';

const logger = Logger.get('FillPatternSelector.tsx', 'info');

const mapStateToProps = (state: MainState) => ({
  fill: state.map.currentStyle.fill,
});

const mapDispatchToProps = {
  setPattern: MapActions.setFillPattern,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux;

interface State {
  patternFactory: FillPatternFactory;
}

class FillPatternSelector extends Component<Props, State> {
  private services = services();
  private canvas = React.createRef<HTMLCanvasElement>();

  constructor(props: Props) {
    super(props);
    this.state = {
      patternFactory: new FillPatternFactory(),
    };
  }

  public render(): ReactNode {
    const options = this.getOptions();
    return (
      <div className={'control-item d-flex justify-content-between align-items-center'}>
        <select onChange={this.handleSelection} value={this.props.fill?.pattern} className={`form-control form-control-sm ${Cls.select}`}>
          {options}
        </select>
        <canvas ref={this.canvas} width={40} height={40} />
      </div>
    );
  }

  public componentDidMount() {
    this.preview();
  }

  public componentDidUpdate() {
    this.preview();
  }

  private handleSelection = (ev: ChangeEvent<HTMLSelectElement>) => {
    const pattern = ev.target.value as FillPatterns;
    this.props.setPattern(pattern);

    this.services.geo.updateSelectedFeatures((style) => {
      style.fill = {
        ...style.fill,
        pattern,
      };
      return style;
    });
  };

  private getOptions() {
    return LabelledFillPatterns.All.map((item) => {
      return (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      );
    });
  }

  private preview() {
    const pattern = this.props.fill?.pattern;
    const color1 = this.props.fill?.color1;
    const color2 = this.props.fill?.color2;
    const canvas = this.canvas.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      logger.error('Canvas not ready');
      return;
    }

    if (FillPatterns.Flat === pattern) {
      ctx.fillStyle = this.props.fill?.color1 || 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const canvasPattern = this.state.patternFactory.create({
      pattern,
      color1,
      color2,
    });

    if (!canvasPattern) {
      logger.error(`Invalid pattern: ${pattern}`);
      return;
    }

    ctx.fillStyle = canvasPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

export default connector(FillPatternSelector);
