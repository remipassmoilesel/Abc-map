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

import { MapTool } from '@abc-map/shared';

export enum ModeName {
  Create = 'tool-mode-create',
  Modify = 'tool-mode-modify',
  MoveMap = 'tool-mode-movemap',
  Select = 'tool-mode-select',
  EditProperties = 'tool-mode-editproperties',
}

export class ToolSelector {
  public static enable(tool: MapTool): Cypress.Chainable<any> {
    return cy.get('[data-cy=tool-selector]').get(`[data-cy=tool-${tool.toLocaleLowerCase()}]`).click();
  }

  public static getActive(): Cypress.Chainable<MapTool | undefined> {
    // FIXME: better typings
    return cy.get('[data-cy=tool-selector] [data-active=true]').then((elem) => {
      const name = (elem.data()['cy'] || '').substring('tool-'.length);
      return Object.values(MapTool).find((t) => t.toLocaleLowerCase() === name);
    }) as Cypress.Chainable<MapTool | undefined>;
  }

  public static toolMode(mode: ModeName) {
    return cy.get(`[data-cy=${mode}]`).click();
  }
}
