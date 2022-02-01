import { Request, Response } from 'express';
import {log} from '@iftta/util'
import OpenWeatherMap from '@iftta/open-weather-map-agent'

export const getAgentMetadata = async (req: Request, res: Response) => {
    // collect all available agents 
    const weather = new OpenWeatherMap();
    log.info('Sending available agent metadata')
    res.json([await weather.getAgentMetadata()]);
}