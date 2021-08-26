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

import { PasswordStrength, ValidationHelper } from './ValidationHelper';

describe('ValidationHelper', () => {
  it('email()', () => {
    expect(ValidationHelper.email('abcd')).toBe(false);
    expect(ValidationHelper.email('abcd@efgh.ijk')).toBe(true);
  });

  it('url()', () => {
    expect(ValidationHelper.url('abcd')).toBe(false);
    expect(ValidationHelper.url('http://abcdefgh.ijk')).toBe(true);
    expect(ValidationHelper.url('https://abc.def-gh.ijk')).toBe(true);
  });

  it('check() should return Weak', () => {
    expect(ValidationHelper.password('azerty')).toEqual(PasswordStrength.Weak);
  });

  it('check() should return Correct', () => {
    expect(ValidationHelper.password('HeyBob123')).toEqual(PasswordStrength.Correct);
  });
});