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

export enum CommandName {
  INSTALL = 'install',
  LINT = 'lint',
  BUILD = 'build',
  TEST = 'test',
  E2E_TESTS = 'e2e',
  WATCH = 'watch',
  CI = 'ci',
  START = 'start',
  START_SERVICES = 'start-services',
  STOP_SERVICES = 'stop-services',
  CLEAN_RESTART_SERVICES = 'clean-restart-services',
  CLEAN = 'clean',
  DEPENDENCY_CHECK = 'dependency-check',
  APPLY_LICENSE = 'apply-license',
  DOCKER_BUILD = 'docker-build',
  DOCKER_PUSH = 'docker-push',
  DEPLOY = 'deploy',
  HELP = 'help',
  PERFORMANCE_TESTS = 'performance-tests',
}

export interface Install {
  name: CommandName.INSTALL;
}

export interface Lint {
  name: CommandName.LINT;
}

export interface Build {
  name: CommandName.BUILD;
}

export interface Test {
  name: CommandName.TEST;
}

export interface E2eTests {
  name: CommandName.E2E_TESTS;
}

export interface Watch {
  name: CommandName.WATCH;
}

export interface Ci {
  name: CommandName.CI;
  light: boolean;
}

export interface Start {
  name: CommandName.START;
}

export interface StartServices {
  name: CommandName.START_SERVICES;
}

export interface StopServices {
  name: CommandName.STOP_SERVICES;
}

export interface CleanRestartServices {
  name: CommandName.CLEAN_RESTART_SERVICES;
}

export interface Clean {
  name: CommandName.CLEAN;
}

export interface DependencyCheck {
  name: CommandName.DEPENDENCY_CHECK;
}

export interface ApplyLicense {
  name: CommandName.APPLY_LICENSE;
}

export interface DockerBuild {
  name: CommandName.DOCKER_BUILD;
  repository: string;
  tag: string;
}

export interface DockerPush {
  name: CommandName.DOCKER_PUSH;
  repository: string;
  tag: string;
}

export interface Deploy {
  name: CommandName.DEPLOY;
  configPath: string;
  skipBuild: boolean;
}

export interface Help {
  name: CommandName.HELP;
}

export interface PerformanceTests {
  name: CommandName.PERFORMANCE_TESTS;
}

export declare type Command =
  | Install
  | Lint
  | Build
  | Test
  | E2eTests
  | Watch
  | Ci
  | Start
  | StartServices
  | StopServices
  | CleanRestartServices
  | Clean
  | DependencyCheck
  | ApplyLicense
  | DockerBuild
  | DockerPush
  | Deploy
  | Help
  | PerformanceTests;
