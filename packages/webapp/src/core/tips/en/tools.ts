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

import { Tip } from '../Tip';
import { ToolTips } from '../tip-ids';

const undoRedoTip = `
<li><b>To cancel</b> hold <code>CTRL</code> and press <code>Z</code></li>
<li><b>To redo</b> hold <code>CTRL</code> and <code>SHIFT</code>, and press <code>Z</code></li>
`;

const moveMapTip = `
<li><b>To move the map</b>, enable the <code>Move Map</code> mode then drag map with your mouse</li>
`;

const selectTips = `
<li><b>To select a geometry</b>, enable the <code>Modify</code> mode and click on the geometry</li>
<li><b>To deselect a geometry</b>, click again on the selected geometry</li>
`;

export const Tools: Tip[] = [
  {
    id: ToolTips.Point,
    content: `<h4>Point tool</h4>
              <ul>
                ${moveMapTip}
                <li><b>To create a point</b>, enable the <code>Create</code> mode then click on the map</li>
                ${selectTips}
                <li><b>To modify a point</b>, select it, you can then move it with your mouse, or modify its characteristics</li>
                <li><b>To delete a point</b>, select it and press <code>DELETE</code></li>
                ${undoRedoTip}
              </ul>
              `,
  },
  {
    id: ToolTips.LineString,
    content: `<h4>Line tool</h4>
              <ul>
                ${moveMapTip}
                <li><b>To create a line</b>, enable the <code>Create</code> mode then click on the map several times, then
                double-click to end the line. You can interrupt a drawing by pressing <code>ESCAPE</code></li>
                ${selectTips}
                <li><b>To modify a line</b>, select it, you can then create vertices,
                 move vertices, or modify its characteristics</li>
                <li><b>To delete a line</b>, select it and press <code>DELETE</code></li>
                <li><b>To delete a vertex</b>, select the line, hold <code>SHIFT</code> and click on the vertex</li>
                ${undoRedoTip}
              </ul>
              `,
  },
  {
    id: ToolTips.Polygon,
    content: `<h4>Polygon tool</h4>
              <ul>
                ${moveMapTip}
                <li><b>To create a polygon</b>, enable the <code>Create</code> mode then click on the map several times,
                then double-click to complete the polygon. You can interrupt a drawing by pressing <code>ESCAPE</code></li>
                ${selectTips}
                <li><b>To modify a polygon</b>, select it, you can then with your mouse create vertices,
                 move vertices, or modify its characteristics</li>
                <li><b>To delete a polygon</b>, select it and press <code>DELETE</code></li>
                <li><b>To delete a vertex</b>, select the polygon, hold <code>SHIFT</code> and click on
                 the summit</li>
                ${undoRedoTip}
              </ul>
              `,
  },
  {
    id: ToolTips.Text,
    content: `<h4>Text tool</h4>
              <ul>
                ${moveMapTip}
                <li><b>To add text</b>, enable the <code>Edit text</code> mode then click on a geometry. An input control appears,
                enter your text then click on <code>OK</code></li>
                <li><b>To edit text</b>, enable the <code>Edit text</code> mode then click on a geometry</li>
                ${undoRedoTip}
              </ul>
              `,
  },
  {
    id: ToolTips.Selection,
    content: `<h4>Selection tool</h4>
              <ul>
                ${moveMapTip}
                <li><b>To select geometries</b>, draw a rectangle on the map then release</li>
                <li><b>To move geometries</b>, select them then <code>drag</code> them</li>
                <li><b>To delete geometries</b>, select them and press <code>DELETE</code></li>
                <li><b>To duplicate geometries</b>, select them and click on the <code>Duplicate</code> button</li>
                <li><b>To modify the characteristics of several geometries</b>, select them then use the options panel of
                 the selection tool</li>
                ${undoRedoTip}
              </ul>
              `,
  },
  {
    id: ToolTips.EditProperties,
    content: `<h4>Property editing tool</h4>
              <div class="alert alert-info mt-2 mb-3">
                The property editing tool is used to edit properties attached to geometries.
                <div class="mt-3">Examples of properties: <code>population</code>, <code>GDP</code>, ...</div>
              </div>
              <ul>
                ${moveMapTip}
                <li><b>To edit the properties</b> of a geometry, click on a geometry</li>
                ${undoRedoTip}
              </ul>
              `,
  },
  {
    id: ToolTips.Measures,
    content: `<h4>Measure tool</h4>

              <ul>
                ${moveMapTip}
                <li><b>To measure one or more lines</b>, select them then click on <code>Measure lengths</code></li>
                <li><b>To measure one or more polygons</b>, select them then click on <code>Measure areas</code></li>
                ${undoRedoTip}
              </ul>
              `,
  },
];
