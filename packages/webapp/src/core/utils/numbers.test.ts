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

import { asNumberOrString, asValidNumber, isValidNumber, normalize, toDegrees, toPrecision, toRadians } from './numbers';

describe('numbers', () => {
  it('asValidNumber()', () => {
    expect(asValidNumber(0)).toBe(0);
    expect(asValidNumber(1)).toBe(1);
    expect(asValidNumber(1.11)).toBe(1.11);
    expect(asValidNumber('1')).toBe(1);
    expect(asValidNumber('1.11')).toBe(1.11);
    expect(asValidNumber('1,11')).toBe(1.11);

    expect(asValidNumber(undefined)).toBe(null);
    expect(asValidNumber(null)).toBe(null);
    expect(asValidNumber({})).toBe(null);
    expect(asValidNumber([])).toBe(null);
  });

  it('isValidNumber()', () => {
    expect(isValidNumber(0)).toBeTruthy();
    expect(isValidNumber(1)).toBeTruthy();
    expect(isValidNumber('1')).toBeTruthy();
    expect(isValidNumber('1.1')).toBeTruthy();
    expect(isValidNumber('001')).toBeTruthy();

    expect(isValidNumber('')).toBeFalsy();
    expect(isValidNumber('   ')).toBeFalsy();
    expect(isValidNumber('abcdef')).toBeFalsy();
    expect(isValidNumber('1000px')).toBeFalsy();
    expect(isValidNumber(' 10 001')).toBeFalsy();
    expect(isValidNumber('10 001 ')).toBeFalsy();
    expect(isValidNumber(null)).toBeFalsy();
    expect(isValidNumber(undefined)).toBeFalsy();
    expect(isValidNumber(undefined)).toBeFalsy();
  });

  it('asNumberOrString()', () => {
    expect(asNumberOrString(NaN)).toEqual(NaN);
    expect(asNumberOrString(0)).toEqual(0);
    expect(asNumberOrString('0')).toEqual(0);
    expect(asNumberOrString(1)).toEqual(1);
    expect(asNumberOrString('1')).toEqual(1);
    expect(asNumberOrString('1,1')).toEqual(1.1);
    expect(asNumberOrString('1.1')).toEqual(1.1);
    expect(asNumberOrString('001')).toEqual(1);
    expect(asNumberOrString(' 1 958 492 ')).toEqual(1_958_492);
    expect(asNumberOrString('abcdef')).toEqual('abcdef');
    expect(asNumberOrString('abc,def')).toEqual('abc,def');
    expect(asNumberOrString(false)).toEqual('false');
    expect(asNumberOrString(true)).toEqual('true');
    expect(asNumberOrString(undefined)).toEqual('');
    expect(asNumberOrString(null)).toEqual('');
  });

  it('toPrecision()', () => {
    expect(toPrecision(1, 4)).toEqual(1);
    expect(toPrecision(1.00001, 4)).toEqual(1);
    expect(toPrecision(1.77778, 4)).toEqual(1.7778);
  });

  it('toDegrees()', () => {
    expect(toDegrees(10)).toEqual(572.9578);
  });

  it('toDegrees()', () => {
    expect(toRadians(1)).toEqual(0.0175);
  });

  it('normalize()', () => {
    expect(normalize(-55, 0, 100, 2)).toEqual(0);
    expect(normalize(155, 0, 100, 2)).toEqual(100);
    expect(normalize(77.8888888, 0, 100, 2)).toEqual(77.89);
  });
});
