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

import axios, { AxiosInstance } from 'axios';
import {
  IAgent,
  AgentResponse,
  Configuration,
  AgentResult,
  WeatherCodes,
  AgentMetadata,
  AgentType,
  Job,
} from './interfaces';
import { config } from './config';
import { logger } from '../../../util/logger';

/**
 * OpenWeatherMap agent.
 */
export class OpenWeatherMap implements IAgent {
  public agentId: string = 'open-weather-map';
  public name: string = 'Weather';

  /**
   * Create API client.
   *
   * @param {Configuration} options
   * @returns {AxiosInstance}
   */
  private createApiClient(options: Configuration): AxiosInstance {
    if (!options.apiKey) {
      const errorMessage =
        'API Key not set, it needs to be set in the user settings';
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    // TODO: remove targetLocation from configuration
    // object, it should be part of jobDefinition
    const client = axios.create({
      baseURL: options.baseUrl,
      method: 'GET',
      params: {
        q: options.targetLocation,
        appid: options.apiKey,
        units: options.units,
      },
      responseType: 'json',
    });

    logger.debug(`${this.agentId} : HTTP Client created, with options`);
    logger.debug(
      JSON.stringify({
        q: options.targetLocation,
        appid: options.apiKey,
        units: options.units,
      })
    );
    this.agentId = options.id;
    this.name = options.name;

    return client;
  }

  /**
   * Run.
   *
   * @param {Configuration} options
   * @returns {Promise<AgentResponse>}
   */
  private async run(options: Configuration): Promise<AgentResponse> {
    try {
      logger.debug(`${this.agentId} :run: options`);
      logger.debug(options);

      const client = this.createApiClient(options);
      const response = await client.get('/');
      const agentResponse: AgentResponse = {
        jobOwner: options.jobOwner,
        jobId: options.jobId!,
        data: response.data,
      };
      logger.debug(`${this.agentId} :run: client response`);
      logger.debug(agentResponse);
      return Promise.resolve(agentResponse);
    } catch (e) {
      logger.error(JSON.stringify(e));
      throw new Error(
        `Fetching weather data is failed: ${(e as Error).message}`
      );
    }

    return {
      jobId: options.jobId!,
      jobOwner: options.jobOwner,
      data: [],
    };
  }

  /**
   * Transform.
   *
   * @param {AgentResponse} weatherData
   * @returns {AgentResult | undefined}
   */
  private transform(weatherData: AgentResponse): AgentResult | undefined {
    const data = weatherData.data;
    logger.info(['Transforming weather data', data]);

    try {
      const code = data.weather[0]?.id;

      const weatherResult: AgentResult = {
        agentId: this.agentId,
        jobId: weatherData.jobId,
        agentName: this.name,
        jobOwner: weatherData.jobOwner,
        data: {
          targetLocation: data.name,
          temperature: data.main.temp,
          windSpeed: data.wind.speed,
          thunderstorm: WeatherCodes.THUNDERSTORM.has(code),
          snow: WeatherCodes.SNOW.has(code),
          rain: WeatherCodes.RAIN.has(code) || WeatherCodes.DRIZZLE.has(code),
          clouds: WeatherCodes.CLOUDS.has(code),
          clearSky: WeatherCodes.CLEAR.has(code),
        },
        timestamp: new Date(),
      };

      return weatherResult;
    } catch (e) {
      logger.error(e);
      return;
    }
  }

  /**
   * Get options.
   *
   * @param {Job} job
   * @returns {Object}
   */
  private getOptions(job: Job) {
    console.log(
      'OpenWeatherMap.getOptions job?.ownerSettings',
      job?.ownerSettings
    );
    const options = {
      ...config,
      apiKey:
        job && job?.ownerSettings
          ? job?.ownerSettings['OPENWEATHER_API_KEY']
          : '',
      jobId: job.id,
      targetLocation: job.query ? job.query[0].value : '',
      jobOwner: job.owner,
    };

    logger.debug(`${this.agentId} : Agent options used for this job`);
    logger.debug(options);

    return options;
  }

  /**
   * Execute.
   *
   * @param {Job} job
   * @returns {Promise<AgentResult>}
   */
  public async execute(job: Job): Promise<AgentResult> {
    logger.debug(`${this.agentId} : execute : Job to execute`);
    logger.debug(job);
    const jobOptions = this.getOptions(job);
    if (!jobOptions.apiKey) {
      const errorMessage = `Execution of Job ${job.id} failed: Cannot run the job without the apiKey`;
      logger.debug(errorMessage);
      return Promise.reject(errorMessage);
    }

    try {
      const res = await this.run(jobOptions);

      res.data.agentId = jobOptions.id;
      res.data.agentName = jobOptions.name;
      res.data.targetLocation = jobOptions.targetLocation;
      res.jobId = jobOptions.jobId as string;

      const agentResult = this.transform(res);
      if (agentResult !== undefined) {
        return Promise.resolve(agentResult);
      }
    } catch (e) {
      return Promise.reject(e);
    }

    const errorMessage = `Execution of Job ${job.id} failed, Agent ${job.agentId}, Query ${job.query}`;
    return Promise.reject(errorMessage);
  }

  /**
   * Get agent metadata.
   *
   * @returns {Promise<AgentMetadata>}
   */
  public static async getAgentMetadata(): Promise<AgentMetadata> {
    // TODO decide if we should store this metadata as json
    // and simply serve that to the caller.

    const meta: AgentMetadata = {
      id: config.id,
      name: config.name,
      type: AgentType.SOURCE,
      settings: {
        agentId: config.id,
        params: [
          {
            name: 'OpenWeatherMap API',
            settingName: 'OPENWEATHER_API_KEY',
          },
          {
            name: 'Google Maps API Key',
            settingName: 'GOOGLEMAPS_API_KEY',
          },
        ],
      },
      params: [
        {
          dataPoint: 'targetLocation',
          name: 'Target Location',
          type: 'location',
        },
      ],
      dataPoints: [
        {
          dataPoint: 'temperature',
          name: 'Temperature',
          dataType: typeof Number(),
        },
        {
          dataPoint: 'windSpeed',
          name: 'Wind speed',
          dataType: typeof Number(),
        },
        {
          dataPoint: 'clouds',
          name: 'Clouds',
          dataType: typeof Boolean(),
        },
        {
          dataPoint: 'rain',
          name: 'Rain',
          dataType: typeof Boolean(),
        },
        {
          dataPoint: 'snow',
          name: 'Snow',
          dataType: typeof Boolean(),
        },
        {
          dataPoint: 'thunderstorm',
          name: 'Thunderstorm',
          dataType: typeof Boolean(),
        },
        {
          dataPoint: 'clearSky',
          name: 'Clear Sky',
          dataType: typeof Boolean(),
        },
        {
          dataPoint: 'timestamp',
          name: 'Last execution',
          dataType: typeof Date(),
        },
      ],
    };

    return Promise.resolve(meta);
  }
}
