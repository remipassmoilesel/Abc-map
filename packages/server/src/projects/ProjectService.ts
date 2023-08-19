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

import { Config } from '../config/Config';
import { ProjectDao } from './ProjectDao';
import { MongodbClient } from '../mongodb/MongodbClient';
import { AbcProjectMetadata, AbcProjectQuotas, CompressedProject, CompressedProjectStream } from '@abc-map/shared';
import { ProjectMapper } from './ProjectMapper';
import { AbstractService } from '../services/AbstractService';
import { StreamReader } from '../utils/StreamReader';

export class ProjectService extends AbstractService {
  public static create(config: Config, client: MongodbClient): ProjectService {
    return new ProjectService(config, new ProjectDao(client));
  }

  constructor(private config: Config, private dao: ProjectDao) {
    super();
  }

  public async init(): Promise<void> {
    await this.dao.init();
  }

  public async save(ownerId: string, project: CompressedProject<Buffer> | CompressedProjectStream): Promise<void> {
    if (!ownerId || typeof ownerId !== 'string') {
      throw new Error('Owner id is mandatory');
    }

    const doc = ProjectMapper.dtoToDoc(project.metadata, ownerId);
    return Promise.all([this.dao.saveMetadata(doc), this.dao.saveCompressedFile(project.metadata.id, project.project)]).then(() => undefined);
  }

  /**
   * WARNING: this method loads the whole project in memory, you should probably use findStreamById() instead.
   * @param id
   */
  public async findById(id: string): Promise<CompressedProject<Buffer> | undefined> {
    const metadata = await this.dao.findMetadataById(id);
    if (!metadata) {
      return;
    }

    const compressed = await this.dao.findProjectStreamById(id);
    return {
      metadata: ProjectMapper.docToDto(metadata),
      project: await StreamReader.read(compressed),
    };
  }

  public async findStreamById(id: string): Promise<CompressedProjectStream | undefined> {
    return Promise.all([this.dao.findMetadataById(id), this.dao.findProjectStreamById(id)]).then(([metadata, project]) => {
      if (!metadata) {
        return;
      }

      return { metadata: ProjectMapper.docToDto(metadata), project };
    });
  }

  public async findAllMetadatas(limit = 100, offset = 0): Promise<AbcProjectMetadata[]> {
    const metadatas = await this.dao.findAllMetadata(limit, offset);
    return metadatas.map((doc) => ProjectMapper.docToDto(doc));
  }

  public async findByUserId(userId: string, offset: number, limit: number): Promise<AbcProjectMetadata[]> {
    const docs = await this.dao.findByUserId(userId, offset, limit);
    return docs.map((doc) => ProjectMapper.docToDto(doc));
  }

  public async deleteById(projectId: string): Promise<void> {
    await Promise.all([this.dao.deleteMetadataByIds([projectId]), this.dao.deleteProjectsByIds([projectId])]);
  }

  public async deleteByUserId(userId: string): Promise<void> {
    const projects = await this.dao.findByUserId(userId, 0, this.config.project.maxPerUser);
    if (!projects.length) {
      return;
    }

    const ids = projects.map((p) => p._id);
    await Promise.all([this.dao.deleteMetadataByIds(ids), this.dao.deleteProjectsByIds(ids)]);
  }

  public async countByUserId(userId: string): Promise<number> {
    return this.dao.countByUserId(userId);
  }

  public async exists(id: string): Promise<boolean> {
    return this.dao.exists(id);
  }

  public async getQuotasForUser(userId: string): Promise<AbcProjectQuotas> {
    const allowed = this.config.project.maxPerUser;
    const currently = await this.dao.countByUserId(userId);
    return {
      userId,
      allowed,
      currently,
      remaining: allowed - currently,
    };
  }
}
