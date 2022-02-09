import axios, { AxiosInstance } from 'axios'
import { IAgent, AgentResponse, Configuration, AgentResult, WeatherCodes, AgentMetadata, AgentType, Job } from './interfaces';
import { config } from './config'
import { log } from '@iftta/util';

class OpenWeatherMap implements IAgent {
    public agentId: string = "open-weather-map";
    public name: string = "Weather";

    private createApiClient(options: Configuration): AxiosInstance {
        if (!options.apiKey) {
            const errorMessage = 'API Key not set, it needs to be set in the env file'
            log.error(errorMessage)
            throw new Error(errorMessage);
        }
        //TODO: remove targetLocation from configuration 
        // object, it should be part of jobDefinition
        const client = axios.create({
            baseURL: options.baseUrl,
            method: 'GET',
            params: { q: options.targetLocation, appid: options.apiKey, units: options.units },
            responseType: 'json'
        });

        log.debug('HTTP Client created, with options');
        log.debug(JSON.stringify({ q: options.targetLocation, appid: options.apiKey, units: options.units }))
        this.agentId = options.id;
        this.name = options.name;

        return client;
    }

    private async run(options: Configuration): Promise<AgentResponse> {
        try {
            log.debug('run options');
            log.debug(options);

            const client = this.createApiClient(options);
            const response = await client.get('/');
            const agentResponse: AgentResponse = {
                jobId: options.jobId as string,
                data: response.data
            }
            return Promise.resolve(agentResponse);
        } catch (err) {
            log.error(JSON.stringify(err));
        }

        return {
            jobId: options.jobId as string,
            data: ''
        };
    }

    private transform(weatherData: AgentResponse): AgentResult {
        const data = weatherData.data
        const code = data.weather[0]?.id;

        const weatherResult: AgentResult = {
            agentId: this.agentId,
            jobId: weatherData.jobId,
            agentName: this.name,
            data:{
                targetLocation: data.name,
                temperature: data.main.temp,
                windSpeed: data.wind.speed,
                thunderstorm: WeatherCodes.THUNDERSTORM.has(code),
                snow: WeatherCodes.SNOW.has(code),
                rain: WeatherCodes.RAIN.has(code) || WeatherCodes.DRIZZLE.has(code),
                clouds: WeatherCodes.CLOUDS.has(code),
                clearSky: WeatherCodes.CLEAR.has(code),
            },
            timestamp: new Date()
        }

        return weatherResult;
    }

    private getOptions(job: Job) {
        const options = {...config}; 
        options.apiKey = process.env.WEATHER_API_KEY || '', 
        options.jobId = job.id;
        options.targetLocation = job.query ? job.query[0].value : ''; 
        log.debug('Agent options used for this job'); 
        log.debug(options);

        return options;
    }

    public async execute(job: Job): Promise<AgentResult> {
        log.debug('Agent: Job to execute')
        log.debug(job)
        const jobOptions = this.getOptions(job);
        jobOptions.targetLocation = 'berlin,de';

        const res = await this.run(jobOptions);
        log.debug(res);
        res.data.agentId = jobOptions.id;
        res.data.agentName = jobOptions.name;
        res.data.targetLocation = jobOptions.targetLocation;
        res.jobId = jobOptions.jobId as string;
        const weatherResult = this.transform(res);

        return weatherResult;
    }

    public static async getAgentMetadata(): Promise<AgentMetadata> {
        // TODO decide if we should store this metadata as json 
        // and simply serve that to the caller. 

        const meta: AgentMetadata = {
            id: config.id,
            displayName: this.name,
            type: AgentType.SOURCE,
            arguments: ["targetLocation"],
            dataPoints: [{
                id: "targetLocation",
                displayName: "Location",
                dataType: typeof String(),
            }, {
                id: "temperature",
                displayName: "Temperature",
                dataType: typeof Number(),
            }, {
                id: "windSpeed",
                displayName: "Wind speed",
                dataType: typeof Number(),
            }, {
                id: "clouds",
                displayName: "Clouds",
                dataType: typeof Boolean(),
            }, {
                id: "rain",
                displayName: "Rain",
                dataType: typeof Boolean(),
            }, {
                id: "snow",
                displayName: "Snow",
                dataType: typeof Boolean(),
            }, {
                id: "thunderstorm",
                displayName: "Thunderstorm",
                dataType: typeof Boolean(),
            },
            {
                id: "clearSky",
                displayName: "Clear Sky",
                dataType: typeof Boolean(),
            },
            {
                id: "timestamp",
                displayName: "Last execution",
                dataType: typeof Date(),
            }],
        };

        return Promise.resolve(meta);
    }
}

export default OpenWeatherMap;