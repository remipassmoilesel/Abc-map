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

import React, { useCallback, useEffect, useRef } from 'react';
import { AbcLayout, AbcProjection, LayoutFormat, LayoutFormats, LegendDisplay, Logger } from '@abc-map/shared';
import LayoutList from './layout-list/LayoutList';
import LayoutPreview from './layout-preview/LayoutPreview';
import { HistoryKey } from '../../core/history/HistoryKey';
import { AddLayoutsChangeset } from '../../core/history/changesets/layouts/AddLayoutsChangeset';
import { RemoveLayoutsChangeset } from '../../core/history/changesets/layouts/RemoveLayoutsChangeset';
import { SetLayoutIndexChangeset } from '../../core/history/changesets/layouts/SetLayoutIndexChangeset';
import { LayoutRenderer } from '../../core/project/rendering/LayoutRenderer';
import { UpdateLayoutChangeset } from '../../core/history/changesets/layouts/UpdateLayoutChangeset';
import { FileIO } from '../../core/utils/FileIO';
import { pageSetup } from '../../core/utils/page-setup';
import LayoutControls from './layout-controls/LayoutControls';
import { ExportFormat } from './ExportFormat';
import Cls from './LayoutView.module.scss';
import { prefixedTranslation } from '../../i18n/i18n';
import { OperationStatus } from '../../core/ui/typings';
import uuid from 'uuid-random';
import SideMenu from '../../components/side-menu/SideMenu';
import { IconDefs } from '../../components/icon/IconDefs';
import { useServices } from '../../core/hooks';
import { useAppSelector } from '../../core/store/hooks';
import { withTranslation } from 'react-i18next';
import { LayoutKeyboardListener } from './keyboard-listener/LayoutKeyboardListener';

const logger = Logger.get('LayoutView.tsx', 'warn');

const t = prefixedTranslation('LayoutView:');

function LayoutView() {
  const { geo, project, history, toasts, modals } = useServices();
  const exportSupport = useRef<HTMLDivElement>(null);
  const keyboardShortcuts = useRef<LayoutKeyboardListener | null>(null);

  const layouts = useAppSelector((st) => st.project.layouts);
  const activeLayoutId = useAppSelector((st) => st.project.activeLayoutId);
  const activeLayout = layouts.find((lay) => lay.id === activeLayoutId);
  const legend = useAppSelector((st) => st.project.legend);

  // Setup page
  useEffect(() => {
    pageSetup(t('Layout'), t('Create_layout_to_export_your_map'));

    keyboardShortcuts.current = LayoutKeyboardListener.create();
    keyboardShortcuts.current.initialize();
    return () => {
      keyboardShortcuts.current?.destroy();
    };
  }, []);

  // If one layout was deleted, update active layout
  useEffect(() => {
    if (!activeLayout && layouts.length) {
      project.setActiveLayout(layouts[layouts.length - 1].id);
    }
  }, [activeLayout, layouts, project]);

  // User has selected a layout
  const handleSelected = useCallback((lay: AbcLayout) => project.setActiveLayout(lay.id), [project]);

  // User creates a new layout
  const handleNewLayout = useCallback(() => {
    const name = `Page ${layouts.length + 1}`;
    const view = geo.getMainMap().unwrap().getView();
    const center = view.getCenter();
    const resolution = view.getResolution();
    if (!center || !resolution) {
      logger.error('Cannot create new layout: ', { center, resolution });
      return;
    }

    const apply = async () => {
      // If resolution is below one, we keep it. Otherwise we use a greater one.
      const layoutRes = resolution < 1 ? resolution : Math.round(resolution - resolution * 0.2);
      const projection: AbcProjection = { name: view.getProjection().getCode() };
      const layout: AbcLayout = {
        id: uuid(),
        name,
        format: LayoutFormats.A4_LANDSCAPE,
        view: {
          center,
          resolution: layoutRes,
          projection,
        },
      };

      const cs = AddLayoutsChangeset.create([layout]);
      await cs.apply();
      history.register(HistoryKey.Layout, cs);

      project.setActiveLayout(layout.id);
    };

    apply().catch((err) => logger.error('Cannot create layout: ', err));
  }, [geo, history, layouts.length, project]);

  // User change layout position in list
  const updateLayoutIndex = useCallback(
    (diff: number) => {
      if (!activeLayout) {
        toasts.info(t('You_muse_select_a_layout'));
        return;
      }

      const apply = async () => {
        const oldIndex = layouts.findIndex((lay) => lay.id === activeLayout.id);
        let newIndex = oldIndex + diff;
        if (newIndex < 0) {
          newIndex = 0;
        }
        if (newIndex > layouts.length - 1) {
          newIndex = layouts.length - 1;
        }

        if (newIndex !== oldIndex) {
          const cs = SetLayoutIndexChangeset.create(activeLayout, oldIndex, newIndex);
          await cs.apply();
          history.register(HistoryKey.Layout, cs);
        }
      };

      apply().catch((err) => logger.error('Cannot change layout index', err));
    },
    [activeLayout, history, layouts, toasts]
  );

  const handleLayoutUp = useCallback(() => updateLayoutIndex(-1), [updateLayoutIndex]);
  const handleLayoutDown = useCallback(() => updateLayoutIndex(+1), [updateLayoutIndex]);

  // User delete all layouts
  const handleClearAll = useCallback(() => {
    const apply = async () => {
      const cs = RemoveLayoutsChangeset.create(layouts);
      await cs.apply();
      history.register(HistoryKey.Layout, cs);
    };

    apply().catch((err) => logger.error('Cannot delete layouts: ', err));
  }, [history, layouts]);

  // User change legend position
  const handleLegendChanged = useCallback((display: LegendDisplay) => project.setLegendDisplay(display), [project]);

  // User delete layout
  const handleDeleted = useCallback(
    (lay: AbcLayout) => {
      const apply = async () => {
        const cs = RemoveLayoutsChangeset.create([lay]);
        await cs.apply();
        history.register(HistoryKey.Layout, cs);
      };

      apply().catch((err) => logger.error('Cannot delete layout: ', err));
    },
    [history]
  );

  // User change layout format
  const handleFormatChanged = useCallback(
    (format: LayoutFormat) => {
      const formatChanged = activeLayout?.format.id !== format.id;
      if (!activeLayout || !formatChanged) {
        return;
      }

      const update: AbcLayout = {
        ...activeLayout,
        format,
      };

      const apply = async () => {
        const cs = UpdateLayoutChangeset.create(activeLayout, update);
        await cs.apply();
        history.register(HistoryKey.Layout, cs);
      };

      apply().catch((err) => logger.error('Cannot update layout: ', err));
    },
    [activeLayout, history]
  );

  // User change layout view (scroll or drag)
  const handleLayoutChanged = useCallback(
    (layout: AbcLayout) => {
      const before = layouts.find((lay) => lay.id === layout.id);
      if (!before) {
        logger.error('Cannot register changeset', { before, layout });
        return;
      }

      const apply = async () => {
        const cs = UpdateLayoutChangeset.create(before, layout);
        await cs.apply();
        history.register(HistoryKey.Layout, cs);
      };

      apply().catch((err) => logger.error('Cannot update layout: ', err));
    },
    [history, layouts]
  );

  // User exports layouts to PDF or PNG
  const handleExport = useCallback(
    (format: ExportFormat) => {
      const support = exportSupport.current;
      if (!support) {
        toasts.genericError();
        logger.error('DOM not ready');
        return;
      }

      const renderer = new LayoutRenderer();
      renderer.init(support);

      if (!layouts.length) {
        toasts.info(t('You_must_create_layouts_first'));
        return;
      }

      const exportLayouts = async () => {
        let result: Blob | undefined;
        switch (format) {
          case ExportFormat.PDF:
            result = await renderer.renderLayoutsAsPdf(layouts, legend, geo.getMainMap());
            FileIO.outputBlob(result, 'map.pdf');
            break;

          case ExportFormat.PNG:
            result = await renderer.renderLayoutsAsPng(layouts, legend, geo.getMainMap());
            FileIO.outputBlob(result, 'map.zip');
            break;

          default:
            logger.error('Unhandled format: ', format);
            toasts.genericError();
            return OperationStatus.Interrupted;
        }

        return OperationStatus.Succeed;
      };

      modals
        .longOperationModal(exportLayouts)
        .then(() => modals.solicitation())
        .catch((err) => {
          toasts.genericError();
          logger.error(err);
        })
        .finally(() => renderer.dispose());
    },
    [geo, layouts, legend, modals, toasts]
  );

  return (
    <div className={Cls.layoutView}>
      <div className={Cls.content}>
        {/* Layout list on left */}
        <SideMenu
          title={t('Layouts_menu')}
          buttonIcon={IconDefs.faCopy}
          buttonStyle={{ top: '20vmin', left: '2vw' }}
          menuPlacement={'left'}
          menuId={'layoutview-layouts-menu'}
          data-cy={'layouts-menu'}
        >
          <LayoutList layouts={layouts} active={activeLayout} onSelected={handleSelected} onDeleted={handleDeleted} />
        </SideMenu>

        {/* Layout preview on center */}
        <LayoutPreview layout={activeLayout} legend={legend} mainMap={geo.getMainMap()} onLayoutChanged={handleLayoutChanged} onNewLayout={handleNewLayout} />

        {/* Controls on right */}
        <SideMenu
          title={t('Controls_menu')}
          buttonIcon={IconDefs.faRuler}
          buttonStyle={{ top: '20vmin', right: '2vw' }}
          menuPlacement={'right'}
          menuId={'layoutview-controls-menu'}
          data-cy={'controls-menu'}
        >
          <LayoutControls
            format={activeLayout?.format}
            legendDisplay={legend.display}
            onFormatChanged={handleFormatChanged}
            onNewLayout={handleNewLayout}
            onLayoutUp={handleLayoutUp}
            onLayoutDown={handleLayoutDown}
            onClearAll={handleClearAll}
            onLegendChanged={handleLegendChanged}
            onExport={handleExport}
          />
        </SideMenu>
      </div>
      <div ref={exportSupport} />
    </div>
  );
}

export default withTranslation()(LayoutView);
