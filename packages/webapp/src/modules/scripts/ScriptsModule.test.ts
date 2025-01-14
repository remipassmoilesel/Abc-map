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

import { logger, ScriptsModule } from './ScriptsModule';
import { ChromiumStack, FirefoxStack } from './ScriptsModule.test.data';
import sinon, { SinonStubbedInstance } from 'sinon';
import { GeoService } from '../../core/geo/GeoService';
import { parseError, ScriptError } from './script-api/errors';

logger.disable();

describe('ScriptsModule', function () {
  describe('process()', () => {
    let geoStub: SinonStubbedInstance<GeoService>;
    let scripts: ScriptsModule;

    beforeEach(() => {
      geoStub = sinon.createStubInstance(GeoService);
      scripts = new ScriptsModule();
    });

    it('module API should work', async () => {
      geoStub.getMainMap.returns({} as any);
      const script = `
         const {mainMap} = moduleApi;
         log('Hello')
         log('World')
         log(mainMap)
      `;

      const result = await scripts.process(script);
      expect(result).toEqual(['Hello', 'World', '[object Object]']);
    });

    it('await should work', async () => {
      geoStub.getMainMap.returns({} as any);
      const script = `
         async function wait() {
            return new Promise(resolve => setTimeout(resolve, 250));
         }
         
         await wait();
         
         log('Hello');
         log('World');
      `;

      const result = await scripts.process(script);
      expect(result).toEqual(['Hello', 'World']);
    });

    it('should return correct error', async () => {
      geoStub.getMainMap.returns({} as any);
      const script = `\
         const {mainMap} = moduleApi;
         log('Hello')
         log('World')
         log(mainMap)
         throw new Error('Test error')
      `;

      let error: ScriptError | undefined;
      try {
        await scripts.process(script);
      } catch (err) {
        error = err as ScriptError;
      }

      expect(error?.message).toMatch(/Error line [0-9], column [0-9]{2}. Message: Test error/); // Position is not correct, but is in browser
      expect(error?.output).toEqual(['Hello', 'World', '[object Object]']);
    });
  });

  describe('parseError()', () => {
    it('should parse a Firefox error stack', () => {
      expect(parseError({ stack: FirefoxStack })).toEqual({ line: 1, column: 7 });
    });

    it('should parse a Chromium error stack', () => {
      expect(parseError({ stack: ChromiumStack })).toEqual({ line: 1, column: 7 });
    });
  });
});
