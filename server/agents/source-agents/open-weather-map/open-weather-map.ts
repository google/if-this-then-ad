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

    private transform(weatherData: AgentResponse): AgentResult {
        const data = weatherData.data;
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

        return this.transform(res);
    }

    public static async getAgentMetadata(): Promise<AgentMetadata> {
        // TODO decide if we should store this metadata as json
        // and simply serve that to the caller.

        const meta: AgentMetadata = {
            id: config.id,
            name: 'Weather',
            type: AgentType.SOURCE,
            settings: {
                agentId: config.id,
                params: [
                    {
                        key: 'apiKey',
                        value: 'string',
                    },
                ],
            },
            params: [
                {
                    dataPoint: 'targetLocation',
                    name: 'Target Location',
                    type: 'string',
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
