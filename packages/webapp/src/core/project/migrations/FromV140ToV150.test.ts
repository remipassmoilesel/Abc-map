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

import { TestData } from './test-data/TestData';
import { FromV140ToV150 } from './FromV140ToV150';

describe('FromV140ToV150', () => {
  let migration: FromV140ToV150;

  beforeEach(async () => {
    migration = new FromV140ToV150();
  });

  it('interestedBy() should return true if version < 1.5.0', async () => {
    const sampleProject = await TestData.project140();

    expect(await migration.interestedBy(sampleProject.manifest)).toEqual(true);
    expect(await migration.interestedBy(TestData.fakeProject('1.5.0'))).toEqual(false);
  });

  it('should migrate', async () => {
    // Prepare
    const sampleProject = await TestData.project140();

    // Act
    const result = await migration.migrate(sampleProject.manifest, sampleProject.files);
    const manifest = result.manifest;

    // Assert
    expect(manifest).toMatchSnapshot();
  });
});
