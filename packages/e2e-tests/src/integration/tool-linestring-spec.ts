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

import { StyleProperties } from '@abc-map/shared';
import { MapTool } from '@abc-map/shared';
import { TestHelper } from '../helpers/TestHelper';
import { ToolSelector } from '../helpers/ToolSelector';
import { Draw } from '../helpers/Draw';
import { MainMap } from '../helpers/MainMap';
import { DefaultDrawingStyle } from '../helpers/DefaultDrawingStyle';
import { Routes } from '../helpers/Routes';

describe('Tool LineString', function () {
  beforeEach(() => {
    TestHelper.init();
  });

  it('user can draw', function () {
    cy.visit(Routes.map().format())
      .then(() => MainMap.fixedView())
      .get('[data-cy=draw-menu]')
      .click()
      .then(() => ToolSelector.enable(MapTool.LineString))
      // First
      .then(() => Draw.click(100, 100))
      .then(() => Draw.click(150, 150))
      .then(() => Draw.click(100, 150))
      .then(() => Draw.dblclick(150, 100))
      // Second
      .then(() => Draw.click(300, 300))
      .then(() => Draw.click(350, 350))
      .then(() => Draw.click(300, 350))
      .then(() => Draw.dblclick(350, 300))
      .then(() => MainMap.getReference())
      .should((map) => {
        const features = map.getActiveLayerFeatures();

        expect(features).length(2);
        expect(features[0].getGeometry()?.getType()).equal('LineString');
        expect(features[0].get(StyleProperties.StrokeWidth)).equal(DefaultDrawingStyle.stroke.width);
        expect(features[0].get(StyleProperties.StrokeColor)).equal(DefaultDrawingStyle.stroke.color);

        expect(features[1].getGeometry()?.getType()).equal('LineString');
        expect(features[1].get(StyleProperties.StrokeWidth)).equal(DefaultDrawingStyle.stroke.width);
        expect(features[1].get(StyleProperties.StrokeColor)).equal(DefaultDrawingStyle.stroke.color);

        expect(features.map((f) => f.getGeometry()?.getExtent())).deep.equals([
          [-3564850.1496206587, 3558914.916784167, -3075653.1685955306, 4048111.897809295],
          [-1608062.2255201465, 1602126.9926836547, -1118865.2444950184, 2091323.9737087828],
        ]);
      });
  });

  it('user can modify', function () {
    cy.visit(Routes.map().format())
      // Create line
      .then(() => MainMap.fixedView())
      .get('[data-cy=draw-menu]')
      .click()
      .then(() => ToolSelector.enable(MapTool.LineString))
      .then(() => Draw.click(100, 100))
      .then(() => Draw.click(150, 150))
      .then(() => Draw.click(100, 150))
      .then(() => Draw.dblclick(150, 100))
      // Select it
      .then(() => Draw.click(150, 150, { shiftKey: true }))
      // Modify it
      .then(() => Draw.drag(100, 100, 600, 600))
      .then(() => MainMap.getReference())
      .should((map) => {
        const features = map.getActiveLayerFeatures();
        expect(features).length(1);
        expect(features[0].getGeometry()?.getType()).equal('LineString');
        expect(features[0].getGeometry()?.getExtent()).deep.equals([-3564850.1496206587, -843857.9124419857, 1327119.660630622, 4048111.897809295]);
      });
  });
});
