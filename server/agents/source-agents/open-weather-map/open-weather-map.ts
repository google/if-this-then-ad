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
import { log } from '@iftta/util';

class OpenWeatherMap implements IAgent {
    public agentId: string = 'open-weather-map';
    public name: string = 'Weather';

    private createApiClient(options: Configuration): AxiosInstance {
        if (!options.apiKey) {
            const errorMessage = 'API Key not set, it needs to be set in the env file';
            log.error(errorMessage);
            throw new Error(errorMessage);
        }
        // TODO: remove targetLocation from configuration
        // object, it should be part of jobDefinition
        const client = axios.create({
            baseURL: options.baseUrl,
            method: 'GET',
            params: { q: options.targetLocation, appid: options.apiKey, units: options.units },
            responseType: 'json',
        });

        log.debug(`${this.agentId} : HTTP Client created, with options`);
        log.debug(
            JSON.stringify({
                q: options.targetLocation,
                appid: options.apiKey,
                units: options.units,
            }),
        );
        this.agentId = options.id;
        this.name = options.name;

        return client;
    }

    private async run(options: Configuration): Promise<AgentResponse> {
        try {
            log.debug(`${this.agentId} :run: options`);
            log.debug(options);

            const client = this.createApiClient(options);
            const response = await client.get('/');
            const agentResponse: AgentResponse = {
                jobOwner: options.jobOwner,
                jobId: options.jobId!,
                data: response.data,
            };
            log.debug(`${this.agentId} :run: client response`);
            log.debug(agentResponse);
            return Promise.resolve(agentResponse);
        } catch (err) {
            log.error(JSON.stringify(err));
        }

        return {
            jobId: options.jobId!,
            jobOwner: options.jobOwner,
            data: [],
        };
    }

    private transform(weatherData: AgentResponse): AgentResult | undefined {
        const data = weatherData.data;
        log.info('Transforming weather data');
        log.info(data);
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
            log.error(e);
            return;
        }
    }

    private getOptions(job: Job) {
        let options = { ...config };
        let userSettings = {};
        job.ownerSettings!.params.map((p) => {
            userSettings[p.key] = p.value;
        });
        options.apiKey = userSettings['apiKey'] || (process.env.WEATHER_API_KEY as string);
        options.jobId = job.id;
        options.targetLocation = job.query ? job.query[0].value : '';
        options.jobOwner = job.owner;
        log.debug(`${this.agentId} : Agent options used for this job`);
        log.debug(options);

        return options;
    }

    public async execute(job: Job): Promise<AgentResult> {
        log.debug(`${this.agentId} : execute : Job to execute`);
        log.debug(job);
        const jobOptions = this.getOptions(job);

        const res = await this.run(jobOptions);

        res.data.agentId = jobOptions.id;
        res.data.agentName = jobOptions.name;
        res.data.targetLocation = jobOptions.targetLocation;
        res.jobId = jobOptions.jobId as string;

        const agentResult = this.transform(res);

        if (agentResult !== undefined) {
            return Promise.resolve(agentResult);
        }
        const errorMessage = `Execution of Job ${job.id} failed, Agent ${job.agentId}, Query ${job.query}`;
        return Promise.reject(errorMessage);
    }

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

export default OpenWeatherMap;
