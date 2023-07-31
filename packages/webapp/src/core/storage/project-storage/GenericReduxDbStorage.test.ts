/**
 * Copyright © 2022 Rémi Pace.
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

import { MainStore, storeFactory } from '../../store/store';
import { ProjectActions } from '../../store/project/actions';
import { TestHelper } from '../../utils/test/TestHelper';
import { initProjectDatabase } from './projects-database';
import { AbcLayout } from '@abc-map/shared';
import sinon, { SinonStubbedInstance } from 'sinon';
import { IndexedDbClient, toKvPair } from '../indexed-db/IndexedDbClient';
import { ObjectStore } from './ObjectStore';
import { GenericReduxDbStorage, logger } from './GenericReduxDbStorage';

logger.disable();

describe('GenericReduxDbStorage', () => {
  describe('With a real storage', () => {
    let store: MainStore;
    let storage: GenericReduxDbStorage<AbcLayout>;

    beforeEach(async () => {
      store = storeFactory();
      storage = GenericReduxDbStorage.create<AbcLayout>(ObjectStore.Layouts, (st) => st.project.layouts.list);

      await initProjectDatabase();
    });

    describe('watch()', () => {
      it('should save new layouts', async () => {
        // Prepare
        storage.watch(store, 30);
        const layouts = [TestHelper.sampleLayout(), TestHelper.sampleLayout()];

        // Act
        store.dispatch(ProjectActions.addLayouts(layouts));
        await TestHelper.wait(100);

        // Assert
        const fromStorage = await storage.getAll(layouts.map((l) => l.id));
        expect(fromStorage).toEqual(layouts);
      });

      it('should save layout modifications', async () => {
        // Prepare
        storage.watch(store, 30);
        const layouts = [TestHelper.sampleLayout(), TestHelper.sampleLayout()];

        store.dispatch(ProjectActions.addLayouts(layouts));
        await TestHelper.wait(100);

        const update: AbcLayout = { ...layouts[0], name: "That's a good layout !" };

        // Act
        store.dispatch(ProjectActions.updateLayout(update));
        await TestHelper.wait(100);

        // Assert
        const fromStorage = await storage.getAll([layouts[0].id]);
        expect(fromStorage).toEqual([update]);
      });
    });

    describe('unwatch()', () => {
      it('should prevent save new layouts', async () => {
        // Prepare
        storage.watch(store, 30);
        const layouts = [TestHelper.sampleLayout(), TestHelper.sampleLayout()];

        // Act
        storage.unwatch();
        store.dispatch(ProjectActions.addLayouts(layouts));
        await TestHelper.wait(100);

        // Assert
        const fromStorage = await storage.getAll(layouts.map((l) => l.id));
        expect(fromStorage).toEqual([]);
      });
    });
  });

  describe('With a stubbed storage', () => {
    let store: MainStore;
    let client: SinonStubbedInstance<IndexedDbClient>;
    let storage: GenericReduxDbStorage<AbcLayout>;

    beforeEach(async () => {
      store = storeFactory();
      client = sinon.createStubInstance(IndexedDbClient);
      storage = new GenericReduxDbStorage(
        () => client,
        ObjectStore.Layouts,
        (st) => st.project.layouts.list
      );
    });

    it('should not save if layouts does not change', async () => {
      // Prepare
      storage.watch(store, 30);
      const layouts = [TestHelper.sampleLayout(), TestHelper.sampleLayout()];

      store.dispatch(ProjectActions.addLayouts(layouts));
      await TestHelper.wait(100);

      // Act
      store.dispatch(ProjectActions.updateLayout(layouts[0]));
      store.dispatch(ProjectActions.updateLayout(layouts[0]));
      store.dispatch(ProjectActions.updateLayout(layouts[1]));
      await TestHelper.wait(100);

      // Assert
      expect(client.putAll.callCount).toEqual(1);
      expect(client.putAll.args).toEqual([[ObjectStore.Layouts, toKvPair(layouts)]]);
    });
  });
});