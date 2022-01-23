import axios, { AxiosInstance } from 'axios'
import { IAgent, AgentResponse, Configuration, AgentResult, WeatherCodes } from './interfaces';
import { config } from './config'
import log from '../../../util/logger';

class OpenWeatherMap implements IAgent {
    id: string = "";
    name: string = "";

    private createApiClient(options: Configuration): AxiosInstance {
        const client = axios.create({
            baseURL: options.baseUrl,
            method: 'GET',
            params: { q: options.queryLocation, appid: options.apiKey, units: options.units },
            responseType: 'json'
        });

        this.id = options.id;
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
            agentId: this.id,
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
    public async execute(options: Configuration):Promise<AgentResult> {

        const res = await this.run(options);
        res.data.agentId = options.id;
        res.data.agentName = options.name;
        res.data.targetLocation = options.queryLocation;
        const weatherResult = this.transform(res);
        return weatherResult;
    }
}

export default OpenWeatherMap;