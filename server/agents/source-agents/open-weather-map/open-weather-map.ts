import axios, { AxiosInstance } from 'axios'
import { IAgent, AgentResponse, Configuration, AgentResult, WeatherCodes, AgentMetadata, AgentType, Job } from './interfaces';
import { config } from './config'
import log from '../../../util/logger';

class OpenWeatherMap implements IAgent {

    public agentId: string = "open-weather-map";
    public name: string = "Weather";

    private createApiClient(options: Configuration): AxiosInstance {
        const client = axios.create({
            baseURL: options.baseUrl,
            method: 'GET',
            params: { q: options.targetLocation, appid: options.apiKey, units: options.units },
            responseType: 'json'
        });

        this.agentId = options.id;
        this.name = options.name;

        return client;
    }
    private async run(options: Configuration): Promise<AgentResponse> {

        let client = this.createApiClient(options);
        const response = await client.get('/');
        const agentResponse: AgentResponse = {
            data: response.data
        }
        return Promise.resolve(agentResponse);
    }

    private transform(weatherData: AgentResponse): AgentResult {

        const data = weatherData.data
        const code = data.weather[0]?.id;

        const weatherResult: AgentResult = {
            agentId: this.agentId,
            agentName: this.name,
            targetLocation: data.name,
            temperature: data.main.temp,
            windSpeed: data.wind.speed,
            thunderstorm: WeatherCodes.THUNDERSTORM.has(code),
            snow: WeatherCodes.SNOW.has(code),
            rain: WeatherCodes.RAIN.has(code) || WeatherCodes.DRIZZLE.has(code),
            clouds: WeatherCodes.CLOUDS.has(code),
            clearSky: WeatherCodes.CLEAR.has(code),
            timestamp: new Date()
        }

        return weatherResult;
    }

    private getOptions(job: Job) {
        const options = Object.create(config);
        options.targetLocation = job.query?.value
        return options;
    }

    public async execute(job: Job): Promise<AgentResult> {

        const jobOptions = this.getOptions(job);
        const res = await this.run(jobOptions);
        res.data.agentId = jobOptions.id;
        res.data.agentName = jobOptions.name;
        res.data.targetLocation = jobOptions.targetLocation;
        const weatherResult = this.transform(res);
        return weatherResult;
    }

    public async  getAgentMetadata(): Promise<AgentMetadata> {
        //TODO decide if we should store this metadata as json 
        // and simply serve that to the caller. 

        const meta: AgentMetadata = {
            agentId: this.agentId,
            agentName: this.name,
            agentType: AgentType.SOURCE,
            queryable: ["targetLocation"],
            dataPoints: [{
                name: "targetLocation",
                displayName: "Location",
                dataType: typeof String(),
            }, {
                name: "temperature",
                displayName: "Temperature",
                dataType: typeof Number(),
            }, {
                name: "windSpeed",
                displayName: "Wind speed",
                dataType: typeof Number(),
            }, {
                name: "clouds",
                displayName: "Clouds",
                dataType: typeof Boolean(),
            }, {
                name: "rain",
                displayName: "Rain",
                dataType: typeof Boolean(),
            }, {
                name: "snow",
                displayName: "Snow",
                dataType: typeof Boolean(),
            }, {
                name: "thunderstorm",
                displayName: "Thunderstorm",
                dataType: typeof Boolean(),
            },
            {
                name: "clearSky",
                displayName: "Clear Sky",
                dataType: typeof Boolean(),
            },
            {
                name: "timestamp",
                displayName: "Last execution",
                dataType: typeof Date(),
            }

            ]

        }
        return Promise.resolve(meta);
    }
}

export default OpenWeatherMap;