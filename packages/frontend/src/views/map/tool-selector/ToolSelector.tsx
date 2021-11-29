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

import React, { useCallback } from 'react';
import { ToolRegistry } from '../../../core/tools/ToolRegistry';
import { Logger, MapTool } from '@abc-map/shared';
import SelectionPanel from './selection/SelectionToolPanel';
import LineStringPanel from './line-string/LineStringToolPanel';
import PointPanel from './point/PointToolPanel';
import PolygonPanel from './polygon/PolygonToolPanel';
import { LayerWrapper } from '../../../core/geo/layers/LayerWrapper';
import { LayerFactory } from '../../../core/geo/layers/LayerFactory';
import { HistoryKey } from '../../../core/history/HistoryKey';
import { AddLayersChangeset } from '../../../core/history/changesets/layers/AddLayersChangeset';
import { prefixedTranslation } from '../../../i18n/i18n';
import { useAppSelector } from '../../../core/store/hooks';
import { useServices } from '../../../core/hooks';
import CommonActions from './_common/common-actions/CommonActions';
import TipBubble from '../../../components/tip-bubble/TipBubble';
import { ToolTips } from '@abc-map/user-documentation';
import { ToolButton } from './ToolButton';
import TextToolPanel from './text/TextToolPanel';
import { IconDefs } from '../../../components/icon/IconDefs';
import { FaIcon } from '../../../components/icon/FaIcon';
import Cls from './ToolSelector.module.scss';

const logger = Logger.get('ToolSelector');

interface Props {
  activeLayer?: LayerWrapper;
}

const t = prefixedTranslation('MapView:ToolSelector.');
const tTools = prefixedTranslation('core:tools.');

function ToolSelector(props: Props) {
  const { geo, history } = useServices();
  const currentTool = useAppSelector((st) => st.map.tool);
  const activeLayer = props.activeLayer;

  // Tools can be disabled if user clicks on raster layer
  const toolsEnabled = (activeLayer && activeLayer.isVector()) || false;
  const activeTool = ToolRegistry.getById(currentTool);

  // Called when user select a tool
  const handleToolSelection = useCallback(
    (toolId: MapTool) => {
      const tool = ToolRegistry.getById(toolId);
      geo.setMainMapTool(tool);
    },
    [geo]
  );

  // Called if tools are enabled
  const getToolOptions = useCallback(() => {
    switch (currentTool) {
      case MapTool.Point:
        return <PointPanel />;
      case MapTool.LineString:
        return <LineStringPanel />;
      case MapTool.Polygon:
        return <PolygonPanel />;
      case MapTool.Selection:
        return <SelectionPanel />;
      case MapTool.Text:
        return <TextToolPanel />;
    }
  }, [currentTool]);

  // Called if tools are enabled
  const getToolTip = useCallback(() => {
    const size = '1.5rem';
    switch (currentTool) {
      case MapTool.Point:
        return <TipBubble id={ToolTips.Point} size={size} />;
      case MapTool.LineString:
        return <TipBubble id={ToolTips.LineString} size={size} />;
      case MapTool.Polygon:
        return <TipBubble id={ToolTips.Polygon} size={size} />;
      case MapTool.Text:
        return <TipBubble id={ToolTips.Text} size={size} />;
      case MapTool.Selection:
        return <TipBubble id={ToolTips.Selection} size={size} />;
      case MapTool.EditProperties:
        return <TipBubble id={ToolTips.EditProperties} size={size} />;
    }
  }, [currentTool]);

  // If tools are disabled, user can create a new vector layer here
  const handleCreateVectorLayer = useCallback(() => {
    const add = async () => {
      const map = geo.getMainMap();
      const layer = LayerFactory.newVectorLayer();

      const cs = new AddLayersChangeset(map, [layer]);
      await cs.apply();
      history.register(HistoryKey.Map, cs);

      map.setActiveLayer(layer);
    };

    add().catch((err) => logger.error('Cannot add layer', err));
  }, [geo, history]);

  const toolOptions = toolsEnabled && getToolOptions();
  const toolTip = toolsEnabled && getToolTip();

  return (
    <div className={Cls.toolSelector} data-cy={'tool-selector'}>
      <div className={Cls.titleRow}>{t('Drawing_tools')}</div>

      {/* User has selected a raster layer, tools are disabled  */}
      {!toolsEnabled && (
        <div className={Cls.toolsDisabled}>
          {t('You_must_select_geometry_layer_before')}
          <button onClick={handleCreateVectorLayer} className={'btn btn-outline-secondary my-3'}>
            <FaIcon icon={IconDefs.faPlus} className={'mr-2'} />
            {t('Create_geometry_layer')}
          </button>
        </div>
      )}

      {/* Tools are enabled */}
      {toolsEnabled && (
        <>
          <div className={Cls.toolsEnabled}>
            {/* Left part with tool buttons and common actions */}
            <div className={Cls.buttonBar}>
              {ToolRegistry.getAll().map((tool) => {
                const isActive = tool.getId() === currentTool;
                return <ToolButton key={tool.getId()} tool={tool} active={isActive} onSelect={handleToolSelection} />;
              })}
              <div className={Cls.spacer} />
              <CommonActions />
            </div>

            {/* Right part with options  */}
            <div className={Cls.toolOptions}>
              <div className={'d-flex align-items-center mb-2'}>
                <div className={Cls.toolName}>{tTools(activeTool.getI18nLabel())}</div>
                {toolTip}
              </div>
              {toolOptions}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ToolSelector;
