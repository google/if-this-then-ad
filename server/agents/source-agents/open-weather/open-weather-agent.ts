import axios from 'axios';
import { AgentSettingDescription } from '../../../common/common';
import { SourceAgentDataPointDescription } from '../../../common/source';
import { SimpleSourceAgent } from '../simple-source-agent';

const WEAHTER_CODES = {
  THUNDERSTORM: new Set([200, 201, 202, 210, 211, 212, 221, 230, 231, 232]),
  DRIZZLE: new Set([300, 301, 302, 310, 311, 312, 313, 314, 321]),
  RAIN: new Set([500, 501, 502, 503, 504, 511, 520, 521, 522, 531]),
  SNOW: new Set([600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]),
  CLOUDS: new Set([802, 803, 804]),
  CLEAR: new Set([800, 801]),
};

const OPENWEATHER_API_KEY_SETTING: AgentSettingDescription = {
  key: 'OPENWEATHER_API_KEY',
  name: 'Open Weather Map API Key',
};

const TEMPERATURE_DATAPOINT: SourceAgentDataPointDescription = {
  key: 'temperature',
  name: 'Temperature',
  type: 'number',
};
const WINDSPEED_DATAPOINT: SourceAgentDataPointDescription = {
  key: 'windspeed',
  name: 'Wind Speed',
  type: 'number',
};
const THUNDERSTORM_DATAPOINT: SourceAgentDataPointDescription = {
  key: 'thunderstorm',
  name: 'Thunderstorm',
  type: 'boolean',
};
const SNOW_DATAPOINT: SourceAgentDataPointDescription = {
  key: 'snow',
  name: 'Snow',
  type: 'boolean',
};
const RAIN_DATAPOINT: SourceAgentDataPointDescription = {
  key: 'rain',
  name: 'Rain',
  type: 'boolean',
};
const CLOUDS_DATAPOINT: SourceAgentDataPointDescription = {
  key: 'clouds',
  name: 'Clouds',
  type: 'boolean',
};
const CLEAR_SKY_DATAPOINT: SourceAgentDataPointDescription = {
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
      parameters: [
        { key: 'location', type: 'location', name: 'Location' },
        {
          key: 'unit',
          type: 'string',
          name: 'Unit',
          values: ['standard', 'metric', 'imperial'],
        },
      ],
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

    const client = axios.create({
      baseURL: 'https://api.openweathermap.org/data/2.5/weather',
      params: {
        q: sourceParameters['location'],
        units: sourceParameters['unit'],
        appid: apiKey,
      },
      responseType: 'json',
    });

    const response = await client.get('/');
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
