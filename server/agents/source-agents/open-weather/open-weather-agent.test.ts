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
import { SourceAgentTask } from '../../../common/source';
import { OpenWeatherAgent } from './open-weather-agent';

const MOCK_OPEN_WEATHER_DATA = {
  coord: {
    lon: -0.13,
    lat: 51.51,
  },
  weather: [
    {
      id: 300,
      main: 'Drizzle',
      description: 'light intensity drizzle',
      icon: '09d',
    },
  ],
  base: 'stations',
  main: {
    temp: 280.32,
    pressure: 1012,
    humidity: 81,
    temp_min: 279.15,
    temp_max: 281.15,
  },
  visibility: 10000,
  wind: {
    speed: 4.1,
    deg: 80,
  },
  clouds: {
    all: 90,
  },
  dt: 1485789600,
  sys: {
    type: 1,
    id: 5091,
    message: 0.0103,
    country: 'GB',
    sunrise: 1485762037,
    sunset: 1485794875,
  },
  id: 2643743,
  name: 'London',
  cod: 200,
};

describe('OpenWeatherAgent', () => {
  let agent: OpenWeatherAgent;
  beforeEach(() => {
    agent = new OpenWeatherAgent();
  });

  describe('#id', () => {
    it('exposes the correct ID', () => {
      expect(agent.id).toEqual('open-weather');
    });
  });

  describe('#describe', () => {
    it('provides a description of the agent', async () => {
      const description = await agent.describe();
      expect(description.id).toEqual('open-weather');
      expect(description.dataPoints).toContainEqual({
        key: 'temperature',
        name: 'Temperature',
        type: 'number',
      });
      expect(description.dataPoints).toContainEqual({
        key: 'windspeed',
        name: 'Wind Speed',
        type: 'number',
      });
      expect(description.dataPoints).toContainEqual({
        key: 'thunderstorm',
        name: 'Thunderstorm',
        type: 'boolean',
      });
      expect(description.dataPoints).toContainEqual({
        key: 'snow',
        name: 'Snow',
        type: 'boolean',
      });
      expect(description.dataPoints).toContainEqual({
        key: 'rain',
        name: 'Rain',
        type: 'boolean',
      });
      expect(description.dataPoints).toContainEqual({
        key: 'clouds',
        name: 'Clouds',
        type: 'boolean',
      });
      expect(description.dataPoints).toContainEqual({
        key: 'clearSky',
        name: 'Clear sky',
        type: 'boolean',
      });
      expect(description.parameters).toContainEqual({
        key: 'location',
        type: 'location',
        name: 'Location',
      });
      expect(description.settings).toContainEqual({
        key: 'OPENWEATHER_API_KEY',
        name: 'Open Weather Map API Key',
      });
    });
  });

  describe('#executeTask', () => {
    let axiosMock: MockAdapter;
    beforeEach(() => {
      axiosMock = new MockAdapter(axios);
      axiosMock
        .onGet('https://api.openweathermap.org/data/2.5/weather/')
        .replyOnce(200, MOCK_OPEN_WEATHER_DATA);
    });

    it('succeeds with a task result', async () => {
      const testTask: SourceAgentTask = {
        dataPoints: ['temperature'],
        ownerId: '1234',
        ownerSettings: { OPENWEATHER_API_KEY: 'test-key' },
        parameters: { location: 'test' },
      };

      const result = await agent.executeTask(testTask);
      expect(result.status).toEqual('success');
      expect(result.data).toEqual(
        expect.objectContaining({ temperature: 280.32 })
      );
    });

    it('succeeds with multiple data points', async () => {
      const testTask: SourceAgentTask = {
        dataPoints: ['temperature', 'windspeed'],
        ownerId: '1234',
        ownerSettings: { OPENWEATHER_API_KEY: 'test-key' },
        parameters: { location: 'test' },
      };

      const result = await agent.executeTask(testTask);
      expect(result.status).toEqual('success');
      expect(result.data).toEqual(
        expect.objectContaining({
          temperature: 280.32,
          windspeed: 4.1,
        })
      );
    });

    it('only calls the API once for multiple data points', async () => {
      const testTask: SourceAgentTask = {
        dataPoints: ['temperature', 'windspeed'],
        ownerId: '1234',
        ownerSettings: { OPENWEATHER_API_KEY: 'test-key' },
        parameters: { location: 'test' },
      };
      await agent.executeTask(testTask);
      expect(axiosMock.history.get.length).toBe(1);
    });

    it('fails if no API key is provided', async () => {
      const testTask: SourceAgentTask = {
        dataPoints: ['temperature'],
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
        ownerSettings: { OPENWEATHER_API_KEY: 'test-key' },
        parameters: { location: 'test' },
      };
      const result = await agent.executeTask(testTask);
      expect(result.status).toEqual('failed');
      expect(result.data).toBeUndefined();
    });
  });
});
