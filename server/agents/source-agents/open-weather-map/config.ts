import { Configuration } from "./interfaces";

export const config:Configuration = {
    id:'open-weather-map',
    name:'open-weather-map-agent',
    baseUrl:'https://api.openweathermap.org/data/2.5/weather', 
    apiKey: '90ab68bb0f9973cb64170ab6e53dc801', 
    units: 'metric', 
    queryLocation: 'berlin,de'
}