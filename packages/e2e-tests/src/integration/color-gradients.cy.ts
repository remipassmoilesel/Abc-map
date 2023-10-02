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

import { TestHelper } from '../helpers/TestHelper';
import { DataStore } from '../helpers/DataStore';
import { TopBar } from '../helpers/TopBar';
import { TestData } from '../test-data/TestData';
import { MainMap } from '../helpers/MainMap';
import { Modules } from '../helpers/Modules';
import { Routes } from '../helpers/Routes';
import { Project } from '../helpers/Project';
import { FilePrompt } from '../helpers/FilePrompt';
import { BundledModuleId } from '@abc-map/shared';

describe('Color gradients', function () {
  beforeEach(() => {
    TestHelper.init();
  });

  it('User can create color gradients', () => {
    cy.visit(Routes.map().format())
      .then(() => Project.newProject())
      // Import layer
      .then(() => DataStore.importByName('Countries of the world'))
      // Open module
      .then(() => Modules.open(BundledModuleId.ColorGradients))
      // Data source parameters
      .get('[data-cy=data-source-file]')
      .click()
      .get('[data-cy=data-source-import-file]')
      .click()
      .then(() => TestData.countriesCsv())
      .then((file) => FilePrompt.select('project.csv', file))
      .get('[data-cy=value-field]')
      .select('VALUE')
      .get('[data-cy=data-join-by]')
      .select('COUNTRY')
      // Geometry layer parameters
      .get('[data-cy=geometry-layer] > option')
      .eq(2)
      .then((opt) => cy.get('[data-cy=geometry-layer]').select(opt.text()))
      .get('[data-cy=geometries-join-by]')
      .select('COUNTRY')
      .wait(800) // We must wait for asynchronous display
      .get('[data-cy=process]')
      .click()
      .get('[data-cy=close-processing-report]')
      .click()
      .then(() => TopBar.map())
      .then(() => MainMap.getReference())
      .should((map) => {
        const layers = map.getLayersMetadata();
        expect(layers).length(4);
        expect(layers[3].name).equal('Color gradients');

        const features = map.getActiveLayerFeatures();
        expect(features.length).equal(252);

        const properties = features
          .sort((a, b) => (a.get('COUNTRY') as string).localeCompare(b.get('COUNTRY') as string))
          .slice(0, 10)
          .map((f) => ({ country: f.get('COUNTRY'), gradientValue: f.get('gradient-value') }));

        expect(properties).deep.equal([
          { country: 'Afghanistan', gradientValue: 11 },
          { country: 'Albania', gradientValue: 7 },
          { country: 'Algeria', gradientValue: 7 },
          { country: 'American Samoa (US)', gradientValue: 19 },
          { country: 'American Virgin Islands (US)', gradientValue: 28 },
          { country: 'Andorra', gradientValue: 7 },
          { country: 'Angola', gradientValue: 6 },
          { country: 'Anguilla (UK)', gradientValue: 13 },
          { country: 'Antarctica', gradientValue: 10 },
          { country: 'Antigua and Barbuda', gradientValue: 19 },
        ]);
      });
  });
});
