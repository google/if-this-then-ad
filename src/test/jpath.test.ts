/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { JPath } from '../helpers/jpath';

test('Set value in correct location in empty object', () => {
  const path = 'header.api-key';
  const value = 'abc123';
  const obj = {};
  const expected = {
    header: {
      'api-key': 'abc123',
    },
  };

  const res = JPath.setValue(obj, path, value);

  expect(res).toEqual(expected);
});

test('Set value in correct location with existing properties', () => {
  const path = 'header.api-key';
  const value = 'abc123';
  const obj = {
    test: 1,
    header: {
      token: 'secret',
    },
  };
  const expected = {
    test: 1,
    header: {
      token: 'secret',
      'api-key': 'abc123',
    },
  };

  const res = JPath.setValue(obj, path, value);

  expect(res).toEqual(expected);
});

test('Extract value from JSON', () => {
  const data = {
    one: {
      two: 2,
    },
  };
  const res = JPath.getValue('one.two', data);

  expect(res).toBe(2);
});

test('Extract aggregated value from JSON (min)', () => {
  const data = {
    one: [1, 2, 3],
  };
  const res = JPath.getValue('one.!MIN', data);

  expect(res).toBe(1);
});

test('Extract aggregated value from JSON (max)', () => {
  const data = {
    one: [1, 2, 3],
  };
  const res = JPath.getValue('one.!MAX', data);

  expect(res).toBe(3);
});
