import { Request, Response } from 'express';
import log from '../util/logger';
import OpenWeatherMap from '../agents/source-agents/open-weather-map'

export const getAgentMetadata = async (req: Request, res: Response) => {
    // collect all available agents 
    const weather = new OpenWeatherMap();
    res.json([await weather.getAgentMetadata()]);
}