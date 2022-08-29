/**
    Copyright 2022 Google LLC
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        https://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import 'jest';
import { SourceAgentTask } from '../../../common/source';
import { AmbeeAgent } from './ambee-agent';

const mockPollenData = {
  data: [
    {
      Count: {
        grass_pollen: 147,
        tree_pollen: 0,
        weed_pollen: 361,
      },
      Risk: {
        grass_pollen: 'High',
        tree_pollen: 'Low',
        weed_pollen: 'Very High',
      },
      updatedAt: '2022-07-25T05:09:30.000Z',
    },
  ],
};
const mockAirQualityData = {
  message: 'success',
  stations: [
    {
      CO: 1.453,
      NO2: 25.291,
      OZONE: 8.032,
      PM10: 52.24,
      PM25: 21.943,
      SO2: 1.898,
      city: 'Bangalore',
      countryCode: 'IN',
      division: 'Bangalore',
      lat: 11.98625,
      lng: 77.550478,
      placeName: 'Race course road',
      postalCode: '560020',
      state: 'Karnataka',
      updatedAt: '2021-05-29T13:00:00.000Z',
      AQI: 72,
      aqiInfo: {
        pollutant: 'PM2.5',
        concentration: 21.943,
        category: 'Moderate',
      },
    },
  ],
};

describe('AmbeeAgent', () => {
  let agent: AmbeeAgent;
  beforeEach(() => {
    agent = new AmbeeAgent();
  });
  describe('#id', () => {
    it('exposes the correct ID', () => {
      expect(agent.id).toEqual('ambee');
    });
  });

  describe('#describe', () => {
    it('provides a description of the agent', async () => {
      const description = await agent.describe();
      expect(description.id).toEqual('ambee');
      expect(description.dataPoints).toContainEqual({
        key: 'pollen-level',
        name: 'Pollen Level',
        type: 'string',
        values: ['Low', 'Moderate', 'High', 'Very High'],
      });
      expect(description.dataPoints).toContainEqual({
        key: 'air-quality',
        name: 'Air Quality',
        type: 'string',
        values: [
          'Good',
          'Moderate',
          'Unhealthy for Sensitive Groups',
          'Unhealthy',
          'Very Unhelathy',
          'Hazardous',
        ],
      });
      expect(description.parameters).toContainEqual({
        key: 'location',
        type: 'location',
        name: 'Location',
      });
      expect(description.settings).toContainEqual({
        key: 'AMBEE_API_KEY',
        name: 'Ambee API Key',
      });
    });
  });

  describe('#executeTask', () => {
    let axiosMock: MockAdapter;
    beforeEach(() => {
      axiosMock = new MockAdapter(axios);
      axiosMock
        .onGet('https://api.ambeedata.com/latest/pollen/by-place')
        .replyOnce(200, mockPollenData);
      axiosMock
        .onGet('https://api.ambeedata.com/latest/by-city')
        .replyOnce(200, mockAirQualityData);
    });

    it('succeeds with a task result', async () => {
      const testTask: SourceAgentTask = {
        dataPoints: ['pollen-level'],
        ownerId: '1234',
        ownerSettings: { AMBEE_API_KEY: 'test-key' },
        parameters: { location: 'test' },
      };

      const result = await agent.executeTask(testTask);
      expect(result.status).toEqual('success');
      expect(result.data).toEqual({ 'pollen-level': 'Very High' });
    });
    it('succeeds with multiple data points', async () => {
      const testTask: SourceAgentTask = {
        dataPoints: ['pollen-level', 'air-quality'],
        ownerId: '1234',
        ownerSettings: { AMBEE_API_KEY: 'test-key' },
        parameters: { location: 'test' },
      };

      const result = await agent.executeTask(testTask);
      expect(result.status).toEqual('success');
      expect(result.data).toEqual({
        'pollen-level': 'Very High',
        'air-quality': 'Moderate',
      });
    });

    it('fails if no API key is provided', async () => {
      const testTask: SourceAgentTask = {
        dataPoints: ['pollen-level'],
        ownerId: '1234',
        ownerSettings: {},
        parameters: { location: 'test' },
      };
      const result = await agent.executeTask(testTask);
      expect(result.status).toEqual('failed');
      expect(result.data).toBeUndefined();
    });
    it('fails for an unknown data point', async () => {
      const testTask: SourceAgentTask = {
        dataPoints: ['unknown-data-point'],
        ownerId: '1234',
        ownerSettings: { AMBEE_API_KEY: 'test-key' },
        parameters: { location: 'test' },
      };
      const result = await agent.executeTask(testTask);
      expect(result.status).toEqual('failed');
      expect(result.data).toBeUndefined();
    });
  });
});
