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

import { AgentSettingMetadata } from '../../../common/common';
import { SourceAgentDataPointMetadata } from '../../../common/source';
import { SimpleSourceAgent } from '../simple-source-agent';

const WEAHTER_CODES = {
  THUNDERSTORM: new Set([200, 201, 202, 210, 211, 212, 221, 230, 231, 232]),
  DRIZZLE: new Set([300, 301, 302, 310, 311, 312, 313, 314, 321]),
  RAIN: new Set([500, 501, 502, 503, 504, 511, 520, 521, 522, 531]),
  SNOW: new Set([600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]),
  CLOUDS: new Set([802, 803, 804]),
  CLEAR: new Set([800, 801]),
};

const OPENWEATHER_API_KEY_SETTING: AgentSettingMetadata = {
  key: 'OPENWEATHER_API_KEY',
  name: 'Open Weather Map API Key',
};

const TEMPERATURE_DATAPOINT: SourceAgentDataPointMetadata = {
  key: 'temperature',
  name: 'Temperature',
  type: 'number',
};
const WINDSPEED_DATAPOINT: SourceAgentDataPointMetadata = {
  key: 'windspeed',
  name: 'Wind Speed',
  type: 'number',
};
const THUNDERSTORM_DATAPOINT: SourceAgentDataPointMetadata = {
  key: 'thunderstorm',
  name: 'Thunderstorm',
  type: 'boolean',
};
const SNOW_DATAPOINT: SourceAgentDataPointMetadata = {
  key: 'snow',
  name: 'Snow',
  type: 'boolean',
};
const RAIN_DATAPOINT: SourceAgentDataPointMetadata = {
  key: 'rain',
  name: 'Rain',
  type: 'boolean',
};
const CLOUDS_DATAPOINT: SourceAgentDataPointMetadata = {
  key: 'clouds',
  name: 'Clouds',
  type: 'boolean',
};
const CLEAR_SKY_DATAPOINT: SourceAgentDataPointMetadata = {
  key: 'clearSky',
  name: 'Clear sky',
  type: 'boolean',
};

/**
 * An agent for the OpenWeather API.
 */
export class OpenWeatherAgent extends SimpleSourceAgent {
  /**
   * Constructor.
   */
  constructor() {
    super({
      id: 'open-weather',
      name: 'Open Weather Map',
      type: 'source',
      settings: [OPENWEATHER_API_KEY_SETTING],
      parameters: [{ key: 'location', type: 'location', name: 'Location' }],
      dataPoints: [
        TEMPERATURE_DATAPOINT,
        WINDSPEED_DATAPOINT,
        THUNDERSTORM_DATAPOINT,
        SNOW_DATAPOINT,
        RAIN_DATAPOINT,
        CLOUDS_DATAPOINT,
        CLEAR_SKY_DATAPOINT,
      ],
    });
  }

  /**
   * @inheritdoc
   */
  protected async fetch(
    dataPoint: string,
    sourceParameters: Record<string, unknown>,
    ownerSettings: Record<string, string>
  ) {
    const apiKey = ownerSettings[OPENWEATHER_API_KEY_SETTING.key];
    if (!apiKey) {
      throw new Error('Missing API key for Open Weather API.');
    }

    // TODO: Add return type and interface
    const response = await this.executeHttpRequest(
      'https://api.openweathermap.org/data/2.5/weather/',
      {
        q: sourceParameters['location'],
        units: 'metric',
        appid: apiKey,
      }
    );
    const data = response.data;
    const code = data.weather[0]?.id;

    try {
      return {
        [TEMPERATURE_DATAPOINT.key]: data.main.temp,
        [WINDSPEED_DATAPOINT.key]: data.wind.speed,
        [THUNDERSTORM_DATAPOINT.key]: WEAHTER_CODES.THUNDERSTORM.has(code),
        [SNOW_DATAPOINT.key]: WEAHTER_CODES.SNOW.has(code),
        [RAIN_DATAPOINT.key]:
          WEAHTER_CODES.RAIN.has(code) || WEAHTER_CODES.DRIZZLE.has(code),
        [CLOUDS_DATAPOINT.key]: WEAHTER_CODES.CLOUDS.has(code),
        [CLEAR_SKY_DATAPOINT.key]: WEAHTER_CODES.CLEAR.has(code),
      };
    } catch (e) {
      this.logger.error(e);
      throw new Error(`Unexpected response format for Open Weather`);
    }
  }
}
