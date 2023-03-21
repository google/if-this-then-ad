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

import { DynamicColumnHeaders } from '../helpers/dynamic-column-headers';

const headers = [
  'One',
  'Two',
  'source:headers.x-api-key',
  'source:headers.x-debug',
  'source:params.lat',
  'source:params.lng',
  'custom:variable',
  'result:data.test',
];

const headersMultipleGroups = [
  'One',
  'Two',
  'source.1:headers.x-api-key',
  'source.2:headers.x-debug',
  'source.1:params.lat',
  'source.2:params.lng',
  'custom:variable',
  'result:data.test',
];

const row = ['1', '2', 'abc123', 'hello', '12.34', '45.67'];

test('Get mapped values for namespace', () => {
  const columnHeaderHelper = new DynamicColumnHeaders(headers);
  const mappedValues = columnHeaderHelper.getMappedValues(row, 'source');

  const expected = {
    '0': {
      headers: {
        'x-api-key': 'abc123',
        'x-debug': 'hello',
      },
      params: {
        lat: '12.34',
        lng: '45.67',
      },
    },
  };

  expect(mappedValues).toStrictEqual(expected);
});

test('Get mapped values for namespace without groups included', () => {
  const columnHeaderHelper = new DynamicColumnHeaders(headers);
  const mappedValues = columnHeaderHelper.getMappedValues(row, 'source', false);

  const expected = {
    headers: {
      'x-api-key': 'abc123',
      'x-debug': 'hello',
    },
    params: {
      lat: '12.34',
      lng: '45.67',
    },
  };

  expect(mappedValues).toStrictEqual(expected);
});

test('Get mapped values for namespace with multiple groups', () => {
  const columnHeaderHelper = new DynamicColumnHeaders(headersMultipleGroups);
  const mappedValues = columnHeaderHelper.getMappedValues(row, 'source');

  const expected = {
    '1': {
      headers: {
        'x-api-key': 'abc123',
      },
      params: {
        lat: '12.34',
      },
    },
    '2': {
      headers: {
        'x-debug': 'hello',
      },
      params: {
        lng: '45.67',
      },
    },
  };

  expect(mappedValues).toStrictEqual(expected);
});

test('Get mapped values for all namespaces and multiple groups', () => {
  const columnHeaderHelper = new DynamicColumnHeaders(headersMultipleGroups);
  const mappedValues = columnHeaderHelper.getMappedValues(row);

  const expected = {
    source: {
      '1': {
        headers: {
          'x-api-key': 'abc123',
        },
        params: {
          lat: '12.34',
        },
      },
      '2': {
        headers: {
          'x-debug': 'hello',
        },
        params: {
          lng: '45.67',
        },
      },
    },
  };

  expect(mappedValues).toStrictEqual(expected);
});

test('Return -1 for first column with namespace for none existing namespace', () => {
  const columnHeaderHelper = new DynamicColumnHeaders(headers);
  const index = columnHeaderHelper.getFirstColWithNamespace('res');

  expect(index).toBe(-1);
});

test('Find first column with namespace', () => {
  const columnHeaderHelper = new DynamicColumnHeaders(headers);
  const index = columnHeaderHelper.getFirstColWithNamespace('result');

  expect(index).toBe(7);
});
