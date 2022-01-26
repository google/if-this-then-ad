import { Configuration } from "./interfaces";

export const config:Configuration = {
    id:'open-weather-map-agent',
    name:'Weather',
    baseUrl:'https://api.openweathermap.org/data/2.5/weather', 
    apiKey: process.env.WEATHER_API_KEY as string, 
    units: 'metric',
}