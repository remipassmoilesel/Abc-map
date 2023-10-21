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

import { logger, ProjectSchemaMigration } from './ProjectSchemaMigration';
import { MigrationProject, ProjectMigration } from './typings';
import sinon, { SinonStubbedInstance } from 'sinon';
import { TestHelper } from '../../utils/test/TestHelper';
import { ModalService } from '../../ui/ModalService';
import { TestData } from './test-data/TestData';
import { AbcProjectManifest, ProjectConstants } from '@abc-map/shared';

logger.disable();

describe('ProjectSchemaMigration', () => {
  describe('With fake migrations', () => {
    let migration1: TestProjectMigration;
    let migration2: TestProjectMigration;
    let updater: ProjectSchemaMigration;

    beforeEach(() => {
      migration1 = new TestProjectMigration();
      migration2 = new TestProjectMigration();
      updater = new ProjectSchemaMigration(() => [migration1, migration2]);
    });

    it('update() should do nothing if project is up to date', async () => {
      // Prepare
      migration1.interestedBy.resolves(false);
      migration2.interestedBy.resolves(false);
      const manifest = TestHelper.sampleProjectManifest();

      // Act
      await updater.update(manifest, []);

      // Assert
      expect(migration1.migrate.callCount).toEqual(0);
    });

    it('update() should migrate project if necessary', async () => {
      // Prepare
      migration1.interestedBy.resolves(false);
      migration2.interestedBy.resolves(true);
      const manifest = TestHelper.sampleProjectManifest();

      // Act
      await updater.update(manifest, []);

      // Assert
      expect(migration2.migrate.callCount).toEqual(1);
      expect(migration2.migrate.args[0]).toEqual([manifest, [], { silent: false }]);
    });

    it('update() should pass migrated projects to next migration scripts', async () => {
      // Prepare
      const afterMigration1 = { manifest: { fakeProject: true }, files: [{ fakeFile: true }] };
      migration1.interestedBy.resolves(true);
      migration1.migrate.returns(afterMigration1);

      migration2.interestedBy.resolves(true);

      const manifest = TestHelper.sampleProjectManifest();

      // Act
      await updater.update(manifest, []);

      // Assert
      expect(migration1.migrate.callCount).toEqual(1);
      expect(migration1.migrate.args[0]).toEqual([manifest, [], { silent: false }]);
      expect(migration2.migrate.callCount).toEqual(1);
      expect(migration2.migrate.args[0]).toEqual([afterMigration1.manifest, afterMigration1.files, { silent: false }]);
    });
  });

  describe('With existing migrations', () => {
    let modal: SinonStubbedInstance<ModalService>;
    let updater: ProjectSchemaMigration;

    beforeEach(() => {
      modal = sinon.createStubInstance(ModalService);
      updater = ProjectSchemaMigration.create(modal);
    });

    it('should migrate', async () => {
      const project = (await TestData.project01()) as unknown as MigrationProject<AbcProjectManifest>;

      const result = await updater.update(project.manifest, project.files);

      expect(result.manifest.metadata.version).toEqual(ProjectConstants.CurrentVersion);
    });
  });
});

export class TestProjectMigration implements ProjectMigration<any, any> {
  public interestedBy = sinon.stub();
  public migrate = sinon.stub();
}
