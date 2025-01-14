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

import { Routes } from '../../routes';
import { BundledModuleId } from '@abc-map/shared';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

export type ReturnType = (layerId?: string) => void;

export function useShowDataTableModule(): ReturnType {
  const navigate = useNavigate();

  return useMemo(
    () => (layerId?: string) => {
      navigate({
        pathname: Routes.module().withParams({ moduleId: BundledModuleId.DataTable }),
        search: layerId ? createSearchParams({ layerId }).toString() : undefined,
      });
    },
    [navigate]
  );
}
