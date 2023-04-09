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

import { TestData } from '../test-data/TestData';
import { MainMap } from '../helpers/MainMap';
import { TestHelper } from '../helpers/TestHelper';
import { Routes } from '../helpers/Routes';

describe('Data import', () => {
  beforeEach(() => {
    TestHelper.init();
  });

  it('User can import data via graphical control, then undo', () => {
    cy.visit(Routes.map().format())
      .get('[data-cy=data-menu]')
      .click()
      .get('[data-cy=browse-files]')
      .click()
      .then(() => TestData.sampleGpx())
      .then((gpx) => {
        return cy.get('[data-cy=file-input]').attachFile({ filePath: 'sample.gpx', fileContent: gpx });
      })
      .wait(1_000)
      .then(() => MainMap.getReference())
      .should((map) => {
        const layerNames = map.getLayersMetadata().map((l) => l.name);
        expect(layerNames).length(3);
        expect(layerNames[2]).match(/Import/);

        const features = map.getActiveLayerFeatures();
        expect(features).length(12);
        features.forEach((f) => expect(f.getId()).not.undefined);
      })
      .get('[data-cy=undo]')
      .click()
      .then(() => MainMap.getReference())
      .should((map) => {
        const layerNames = map.getLayersMetadata().map((l) => l.name);
        expect(layerNames).length(2);
      })
      .get('[data-cy=redo]')
      .click()
      .then(() => MainMap.getReference())
      .should((map) => {
        const layerNames = map.getLayersMetadata().map((l) => l.name);
        expect(layerNames).length(3);
      });
  });

  it('User can import data via drag and drop, then undo', () => {
    cy.visit(Routes.map().format())
      .then(() => TestData.sampleGpx())
      .then((gpx) => {
        return cy.window().then((win) => {
          const file = new win.File([gpx], 'sample.gpx');
          const dataTransfer = new win.DataTransfer();
          dataTransfer.items.add(file);
          return dataTransfer;
        });
      })
      .then((dataTransfer) => {
        return MainMap.getComponent().trigger('dragover').get('[data-cy=drag-overlay]').trigger('drop', { dataTransfer });
      })
      .wait(1_000)
      .then(() => MainMap.getReference())
      .should((map) => {
        const layerNames = map.getLayersMetadata().map((l) => l.name);
        expect(layerNames).length(3);
        expect(layerNames[2]).match(/Import/);

        const features = map.getActiveLayerFeatures();
        expect(features).length(12);
        features.forEach((f) => expect(f.getId()).not.undefined);
      })
      .get('[data-cy=undo]')
      .click()
      .then(() => MainMap.getReference())
      .should((map) => {
        const layerNames = map.getLayersMetadata().map((l) => l.name);
        expect(layerNames).length(2);
      })
      .get('[data-cy=redo]')
      .click()
      .then(() => MainMap.getReference())
      .should((map) => {
        const layerNames = map.getLayersMetadata().map((l) => l.name);
        expect(layerNames).length(3);
      });
  });
});
