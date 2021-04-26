import React, { Component, ReactNode } from 'react';
import { Logger } from '@abc-map/frontend-commons';
import Cls from './DifferentSymbolsUi.module.scss';

const logger = Logger.get('Panel.tsx');

class DifferentSymbolsUi extends Component<{}, {}> {
  public render(): ReactNode {
    return (
      <div className={Cls.panel}>
        <h4 className={'text-center my-5'}>Ce module n&apos;est pas encore prêt !</h4>
      </div>
    );
  }
}

export default DifferentSymbolsUi;
