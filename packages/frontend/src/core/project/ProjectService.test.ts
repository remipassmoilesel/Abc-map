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

import { logger, ProjectService } from './ProjectService';
import { GeoService } from '../geo/GeoService';
import { ProjectActions } from '../store/project/actions';
import { AbcLayer, AbcProjectManifest, AbcWmsLayer, AbcXyzLayer, CompressedProject, LayerType, ProjectHelper } from '@abc-map/shared';
import { TestHelper } from '../utils/test/TestHelper';
import { MapFactory } from '../geo/map/MapFactory';
import { MainStore, storeFactory } from '../store/store';
import { MapWrapper } from '../geo/map/MapWrapper';
import * as sinon from 'sinon';
import { SinonStubbedInstance } from 'sinon';
import { ToastService } from '../ui/ToastService';
import { ModalService } from '../ui/ModalService';
import { ProjectEventType } from './ProjectEvent';
import { ModalEventType, ModalStatus } from '../ui/typings';
import { Errors } from '../utils/Errors';
import { LayerFactory } from '../geo/layers/LayerFactory';
import { ProjectUpdater } from './ProjectUpdater';
import { ProjectFactory } from './ProjectFactory';
import { ProjectStatus } from './ProjectStatus';
import { deepFreeze } from '../utils/deepFreeze';

logger.disable();

describe('ProjectService', function () {
  let store: MainStore;
  let geoMock: SinonStubbedInstance<GeoService>;
  let toastMock: SinonStubbedInstance<ToastService>;
  let modals: SinonStubbedInstance<ModalService>;
  let updater: SinonStubbedInstance<ProjectUpdater>;
  let projectService: ProjectService;

  beforeEach(() => {
    store = storeFactory();
    geoMock = sinon.createStubInstance(GeoService);
    modals = sinon.createStubInstance(ModalService);

    updater = sinon.createStubInstance(ProjectUpdater);
    updater.update.callsFake((manifest, files) => Promise.resolve({ manifest, files }));

    projectService = new ProjectService(
      {} as any,
      {} as any,
      store,
      toastMock as unknown as ToastService,
      geoMock as unknown as GeoService,
      modals as unknown as ModalService,
      updater as unknown as ProjectUpdater
    );
  });

  describe('newProject()', () => {
    it('newProject()', async function () {
      // Prepare
      const originalId = store.getState().project.metadata.id;
      store.dispatch(ProjectActions.addLayouts([TestHelper.sampleLayout()]));
      store.dispatch(ProjectActions.setActiveLayout('test-layout-id'));

      const map = MapFactory.createNaked();
      map.addLayer(LayerFactory.newXyzLayer('http://somewhere.net'));
      geoMock.getMainMap.returns(map);

      // Act
      await projectService.newProject();

      // Assert
      const current = store.getState().project;
      expect(current.metadata.id).toBeDefined();
      expect(current.metadata.id).not.toEqual(originalId);
      expect(current.layouts.list).toEqual([]);
      expect(current.layouts.activeId).toEqual(undefined);
      expect(map.getLayers().map((l) => l.getType())).toEqual([LayerType.Predefined, LayerType.Vector]);
    });

    it('newProject() should dispatch event', async function () {
      // Prepare
      const eventListener = sinon.stub();
      const map = MapFactory.createNaked();
      geoMock.getMainMap.returns(map);
      projectService.addProjectLoadedListener(eventListener);

      // Act
      await projectService.newProject();

      // Assert
      expect(eventListener.callCount).toEqual(1);
      expect(eventListener.args[0][0].type).toEqual(ProjectEventType.ProjectLoaded);
    });
  });

  describe('loadBlobProject()', function () {
    it('should load project if not protected by password', async () => {
      // Prepare
      const map = MapFactory.createNaked();
      geoMock.getMainMap.returns(map);

      const eventListener = sinon.stub();
      projectService.addProjectLoadedListener(eventListener);

      const [zippedProject, manifest] = await TestHelper.sampleCompressedProject();

      // Act
      await projectService.loadBlobProject(zippedProject.project);

      // Assert
      expect(store.getState().project.metadata.id).toEqual(zippedProject.metadata.id);
      expect(geoMock.importLayers.callCount).toEqual(1);
      expect(geoMock.importLayers.args).toEqual([[manifest.layers]]);
      expect(eventListener.callCount).toEqual(1);
      expect(eventListener.args[0][0].type).toEqual(ProjectEventType.ProjectLoaded);
    });

    it('should load project after prompt if protected by password', async () => {
      // Prepare
      const map = MapFactory.createNaked();
      geoMock.getMainMap.returns(map);

      modals.promptProjectPassword.resolves({ type: ModalEventType.PasswordInputClosed, value: 'azerty1234', status: ModalStatus.Confirmed });

      const [zippedProject] = await TestHelper.sampleCompressedProtectedProject();

      // Act
      await projectService.loadBlobProject(zippedProject.project);

      // Assert
      expect(store.getState().project.metadata.id).toEqual(zippedProject.metadata.id);
      expect(modals.promptProjectPassword.callCount).toEqual(1);
      expect(geoMock.importLayers.callCount).toEqual(1);

      const wmsLayer = geoMock.importLayers.args[0][0][2] as AbcWmsLayer;
      expect(wmsLayer.metadata.remoteUrls).toEqual(['http://domain.fr/wms']);
      expect(wmsLayer.metadata.auth?.username).toEqual('test-username');
      expect(wmsLayer.metadata.auth?.password).toEqual('test-password');
    });

    it('should not prompt if project is public', async () => {
      // Prepare
      const map = MapFactory.createNaked();
      geoMock.getMainMap.returns(map);

      modals.promptProjectPassword.rejects();

      const [zippedProject] = await TestHelper.sampleCompressedProject({
        metadata: { public: true },
        layers: [TestHelper.sampleXyzLayer()],
      });

      // Act
      await projectService.loadBlobProject(zippedProject.project);

      // Assert
      expect(store.getState().project.metadata.id).toEqual(zippedProject.metadata.id);
      expect(modals.promptProjectPassword.callCount).toEqual(0);
      expect(geoMock.importLayers.callCount).toEqual(1);

      const wmsLayer = geoMock.importLayers.args[0][0][0] as AbcXyzLayer;
      expect(wmsLayer.metadata.remoteUrl).toEqual('http://domain.fr/xyz/{x}/{y}/{z}');
    });

    it('should throw if no password given and protected project', async () => {
      // Prepare
      const map = MapFactory.createNaked();
      geoMock.getMainMap.returns(map);

      const eventListener = sinon.stub();
      projectService.addProjectLoadedListener(eventListener);

      modals.promptProjectPassword.resolves({ type: ModalEventType.PasswordInputClosed, value: '', status: ModalStatus.Confirmed });

      const [zippedProject] = await TestHelper.sampleCompressedProtectedProject();

      // Act
      const error: Error = await projectService.loadBlobProject(zippedProject.project).catch((err) => err);

      // Assert
      expect(Errors.isMissingPassword(error)).toEqual(true);
      expect(store.getState().project.metadata.id).not.toEqual(zippedProject.metadata.id);
      expect(modals.promptProjectPassword.callCount).toEqual(1);
      expect(geoMock.importLayers.callCount).toEqual(0);
      expect(eventListener.callCount).toEqual(0);
    });

    it('should set view', async () => {
      // Prepare
      const map = sinon.createStubInstance(MapWrapper);
      geoMock.getMainMap.returns(map as unknown as MapWrapper);

      const [zippedProject] = await TestHelper.sampleCompressedProject();

      // Act
      await projectService.loadBlobProject(zippedProject.project);

      // Assert
      expect(map.setView.args).toEqual([
        [
          {
            center: [1, 2],
            projection: {
              name: 'EPSG:3857',
            },
            resolution: 1000,
            rotation: 0,
          },
        ],
      ]);
    });

    it('should call migration', async () => {
      // Prepare
      const map = MapFactory.createNaked();
      geoMock.getMainMap.returns(map);

      const [zippedProject, manifest] = await TestHelper.sampleCompressedProject();

      // Act
      await projectService.loadBlobProject(zippedProject.project);

      // Assert
      expect(updater.update.callCount).toEqual(1);
      expect(updater.update.args[0][0]).toEqual(manifest);
    });

    it('should load projections', async () => {
      // Prepare
      modals.promptProjectPassword.resolves({ type: ModalEventType.PasswordInputClosed, value: 'azerty1234', status: ModalStatus.Confirmed });

      const map = MapFactory.createNaked();
      geoMock.getMainMap.returns(map);

      const predefined = TestHelper.sampleOsmLayer();
      const xyz = TestHelper.sampleXyzLayer({ projection: { name: 'EPSG:2154' } });
      const [zippedProject] = await TestHelper.sampleCompressedProtectedProject({ layers: [predefined, xyz] });

      // Act
      await projectService.loadBlobProject(zippedProject.project);

      // Assert
      // Load project projection, WMS projection, XYZ projection
      expect(geoMock.loadProjection.args).toEqual([['EPSG:3857'], ['EPSG:2154'], ['EPSG:4326']]);
    });
  });

  describe('With a fake map', () => {
    let map: MapWrapper;
    beforeEach(() => {
      map = MapFactory.createNaked();
      geoMock.getMainMap.returns(map);
    });

    describe('exportAndZipCurrentProject()', () => {
      it('should export private project without credentials', async function () {
        // Prepare
        const originalManifest: AbcProjectManifest = {
          ...ProjectFactory.newProjectManifest(),
          layouts: [TestHelper.sampleLayout()],
          sharedViews: {
            ...ProjectFactory.newProjectManifest().sharedViews,
            list: [TestHelper.sampleSharedView()],
          },
        };
        store.dispatch(ProjectActions.loadProject(originalManifest));

        const layers: AbcLayer[] = [TestHelper.sampleOsmLayer(), TestHelper.sampleVectorLayer()];
        geoMock.exportLayers.resolves(layers);

        // Act
        const exported = (await projectService.exportAndZipCurrentProject()) as CompressedProject<Blob>;

        // Assert
        expect(exported.metadata).toEqual(originalManifest.metadata);

        const manifest: AbcProjectManifest = await ProjectHelper.forBrowser().extractManifest(exported.project);
        expect(manifest.metadata).toEqual(originalManifest.metadata);
        expect(manifest.layers).toEqual(layers);
        expect(manifest.layouts).toEqual(originalManifest.layouts);
        expect(manifest.sharedViews).toEqual(originalManifest.sharedViews);

        expect(modals.createProjectPassword.callCount).toEqual(0);
      });

      it('should export private project with credentials', async function () {
        // Prepare
        const originalManifest = ProjectFactory.newProjectManifest();
        store.dispatch(ProjectActions.loadProject(originalManifest));

        map.addLayer(LayerFactory.newXyzLayer('http://nowhere.net/{x}/{y}/{z}'));

        const originalLayer = TestHelper.sampleXyzLayer({ remoteUrl: 'http://nowhere.net/{x}/{y}/{z}' });
        const layers: AbcLayer[] = [originalLayer];
        geoMock.exportLayers.resolves(layers);

        modals.createProjectPassword.resolves({ type: ModalEventType.CreatePasswordClosed, value: 'azerty1234', status: ModalStatus.Confirmed });

        // Act
        const exported = (await projectService.exportAndZipCurrentProject()) as CompressedProject<Blob>;

        // Assert
        expect(exported.metadata.id).toEqual(originalManifest.metadata.id);
        expect(exported.metadata.public).toEqual(false);
        expect(exported.metadata.name).toEqual(originalManifest.metadata.name);
        expect(exported.metadata.containsCredentials).toEqual(true);

        const manifest: AbcProjectManifest = await ProjectHelper.forBrowser().extractManifest(exported.project);
        expect(manifest.metadata.id).toEqual(originalManifest.metadata.id);
        expect(manifest.metadata.public).toEqual(false);
        expect(manifest.metadata.name).toEqual(originalManifest.metadata.name);
        expect(manifest.metadata.containsCredentials).toEqual(true);

        expect(manifest.layers.length).toEqual(1);
        const layer = manifest.layers[0] as AbcXyzLayer;
        expect(layer.type).toEqual(LayerType.Xyz);
        expect(layer.metadata.id).toEqual(originalLayer.metadata.id);
        expect(layer.metadata.opacity).toEqual(originalLayer.metadata.opacity);
        expect(layer.metadata.remoteUrl).toBeDefined();
        expect(layer.metadata.remoteUrl).not.toEqual('http://nowhere.net/{x}/{y}/{z}');

        expect(modals.createProjectPassword.callCount).toEqual(1);
      });

      it('should not prompt several times for credentials', async function () {
        // Prepare
        const originalManifest = ProjectFactory.newProjectManifest();
        store.dispatch(ProjectActions.loadProject(originalManifest));

        map.addLayer(LayerFactory.newXyzLayer('http://nowhere.net/{x}/{y}/{z}'));

        const originalLayer = TestHelper.sampleXyzLayer({ remoteUrl: 'http://nowhere.net/{x}/{y}/{z}' });
        const layers: AbcLayer[] = [originalLayer];
        geoMock.exportLayers.resolves(layers);

        modals.createProjectPassword.resolves({ type: ModalEventType.CreatePasswordClosed, value: 'azerty1234', status: ModalStatus.Confirmed });

        // Act
        await projectService.exportAndZipCurrentProject();
        await projectService.exportAndZipCurrentProject();
        await projectService.exportAndZipCurrentProject();

        // Assert
        expect(modals.createProjectPassword.callCount).toEqual(1);
      });

      it('should return ProjectStatus.Canceled if user does not provide credentials for private project', async function () {
        // Prepare
        const originalManifest = ProjectFactory.newProjectManifest();
        store.dispatch(ProjectActions.loadProject(originalManifest));

        map.addLayer(LayerFactory.newXyzLayer('http://nowhere.net/{x}/{y}/{z}'));

        const originalLayer = TestHelper.sampleXyzLayer({ remoteUrl: 'http://nowhere.net/{x}/{y}/{z}' });
        const layers: AbcLayer[] = [originalLayer];
        geoMock.exportLayers.resolves(layers);

        modals.createProjectPassword.resolves({ type: ModalEventType.CreatePasswordClosed, value: '', status: ModalStatus.Canceled });

        // Act
        const exported = await projectService.exportAndZipCurrentProject();

        // Assert
        expect(exported).toEqual(ProjectStatus.Canceled);
      });

      it('should export public project with credentials', async function () {
        // Prepare
        const originalManifest = {
          ...ProjectFactory.newProjectManifest(),
          metadata: {
            ...ProjectFactory.newProjectManifest().metadata,
            public: true,
          },
        };
        store.dispatch(ProjectActions.loadProject(originalManifest));

        map.addLayer(LayerFactory.newXyzLayer('http://nowhere.net/{x}/{y}/{z}'));

        const originalLayer = TestHelper.sampleXyzLayer({ remoteUrl: 'http://nowhere.net/{x}/{y}/{z}' });
        const layers: AbcLayer[] = [originalLayer];
        geoMock.exportLayers.resolves(layers);

        // Act
        const exported = (await projectService.exportAndZipCurrentProject()) as CompressedProject<Blob>;

        // Assert
        expect(exported.metadata.id).toEqual(originalManifest.metadata.id);
        expect(exported.metadata.public).toEqual(true);
        expect(exported.metadata.name).toEqual(originalManifest.metadata.name);
        expect(exported.metadata.containsCredentials).toEqual(false);

        const manifest: AbcProjectManifest = await ProjectHelper.forBrowser().extractManifest(exported.project);
        expect(manifest.metadata.id).toEqual(originalManifest.metadata.id);
        expect(manifest.metadata.public).toEqual(true);
        expect(manifest.metadata.name).toEqual(originalManifest.metadata.name);
        expect(manifest.metadata.containsCredentials).toEqual(false);

        expect(manifest.layers.length).toEqual(1);
        const layer = manifest.layers[0] as AbcXyzLayer;
        expect(layer.type).toEqual(LayerType.Xyz);
        expect(layer.metadata.id).toEqual(originalLayer.metadata.id);
        expect(layer.metadata.opacity).toEqual(originalLayer.metadata.opacity);
        expect(layer.metadata.remoteUrl).toBeDefined();
        expect(layer.metadata.remoteUrl).toEqual('http://nowhere.net/{x}/{y}/{z}');
      });
    });

    it('cloneProject()', async () => {
      // Prepare
      const original = TestHelper.sampleProjectManifest();
      original.metadata.public = true;
      original.layouts.push(TestHelper.sampleLayout());
      original.layouts.push(TestHelper.sampleLayout());
      original.sharedViews.list.push(TestHelper.sampleSharedView());
      original.sharedViews.list.push(TestHelper.sampleSharedView());
      original.sharedViews.list.push(TestHelper.sampleSharedView());
      deepFreeze(original);
      store.dispatch(ProjectActions.loadProject(original));

      const layers: AbcLayer[] = [TestHelper.sampleOsmLayer(), TestHelper.sampleXyzLayer(), TestHelper.sampleWmtsLayer(), TestHelper.sampleWmtsLayer()];
      geoMock.exportLayers.resolves(layers);

      // Act
      const clone = (await projectService.cloneCurrent()) as CompressedProject<Blob>;

      // Assert
      const clonedManifest: AbcProjectManifest = await ProjectHelper.forBrowser().extractManifest(clone.project);
      expect(clonedManifest.metadata.id).toBeDefined();
      expect(clonedManifest.metadata.id).toEqual(clone.metadata.id);
      expect(clonedManifest.metadata.id).not.toEqual(original.metadata.id);
      expect(clone.metadata.id).not.toEqual(original.metadata.id);

      const clonedLayerIds = clonedManifest.layers.map((lay) => lay.metadata.id);
      const originalLayerIds = layers.map((lay) => lay.metadata.id);
      expect(clonedLayerIds.length).toEqual(layers.length);
      expect(clonedLayerIds).not.toEqual(originalLayerIds);

      const clonedLayoutIds = clonedManifest.layouts.map((lay) => lay.id);
      const originalLayoutIds = original.layouts.map((lay) => lay.id);
      expect(clonedLayoutIds.length).toEqual(originalLayoutIds.length);
      expect(clonedLayoutIds).not.toEqual(originalLayoutIds);

      const clonedViewIds = clonedManifest.sharedViews.list.map((view) => view.id);
      const originalViewIds = original.sharedViews.list.map((view) => view.id);
      expect(clonedViewIds.length).toEqual(originalViewIds.length);
      expect(clonedViewIds).not.toEqual(originalViewIds);
    });
  });

  it('renameProject() should work', async function () {
    projectService.renameProject('New title');

    expect(store.getState().project.metadata.name).toEqual('New title');
  });

  it('getPublicLink()', () => {
    expect(projectService.getPublicLink()).toMatch(/^http:\/\/localhost\/en\/shared-map\/[a-z0-9-]+$/i);
    expect(projectService.getPublicLink('test-project-id')).toEqual('http://localhost/en/shared-map/test-project-id');
  });
});
