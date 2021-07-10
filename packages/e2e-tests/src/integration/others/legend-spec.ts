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

import { AbcLegend, FrontendRoutes, LegendDisplay, MapTool } from '@abc-map/shared';
import { TestHelper } from '../../helpers/TestHelper';
import { MainMap } from '../../helpers/MainMap';
import { TopBar } from '../../helpers/TopBar';
import { ToolSelector } from '../../helpers/ToolSelector';
import { Draw } from '../../helpers/Draw';
import { Store } from '../../helpers/Store';

describe('Legend', function () {
  describe('As a visitor', function () {
    beforeEach(() => {
      TestHelper.init();
    });

    it('can create a legend', function () {
      cy.visit(FrontendRoutes.map().raw())
        .then(() => MainMap.fixedView())
        // First point
        .then(() => ToolSelector.enable(MapTool.Point))
        .then(() => Draw.click(100, 100))
        // Second point
        .get('[data-cy=point-icon-selector]')
        .click()
        .get('[data-cy=point-icon-5]')
        .click()
        .then(() => Draw.click(200, 200))
        // Third point
        .get('[data-cy=point-icon-selector]')
        .click()
        .get('[data-cy=point-icon-10]')
        .click()
        .then(() => Draw.click(300, 300))
        // Create layout
        .then(() => TopBar.layout())
        .get('[data-cy=layout-controls] [data-cy=new-layout]')
        .click()
        // Edit legend
        .get('[data-cy=edit-legend]')
        .click()
        .get('[data-cy=new-item-input]')
        .type('Legend item 1')
        .get('[data-cy=new-item-button]')
        .click()
        .get('[data-cy=legend-item-symbol]')
        .click()
        .get('[data-cy=legend-symbol]')
        .eq(2)
        .click()
        .get('[data-cy=back-to-layout]')
        .click()
        .get('[data-cy=legend-select]')
        .select('En bas à droite')
        .then(() => Store.getReference())
        .then((store) => {
          const legend: AbcLegend = store.getState().project.legend;
          expect(legend.display).equal(LegendDisplay.BottomRightCorner);
          expect(legend.width).equal(300);
          expect(legend.height).equal(300);
          expect(legend.items.length).deep.equal(1);
          expect(legend.items[0].id).not.undefined;
          expect(legend.items[0].text).equal('Legend item 1');
          expect(legend.items[0].symbol?.geomType).equal('Point');
          expect(legend.items[0].symbol?.properties.point?.icon).equal('twbs/0_stars.inline.svg');
        });
    });
  });
});
