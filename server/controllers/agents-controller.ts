require('module-alias/register');

import { Request, Response } from 'express';
import {log} from '@iftta/util';
import OpenWeatherMap from '@iftta/open-weather-map-agent';
import DV360Agent from '@iftta/dv360-ads';

const allowedAgentMethods = {
    'dv360-ads': {
        'metadata': DV360Agent.getAgentMetadata,
        'list': DV360Agent.getEntityList,
    },
    'open-weather-map' : {
        'metadata': OpenWeatherMap.getAgentMetadata,
    }
};

export const getAgentsMetadata = async (req: Request, res: Response) => {
    const result: Object[] = [];
    for (const agent in allowedAgentMethods) {
        result.push(await allowedAgentMethods[agent].metadata());
    }

    return res.json(result);
}

export const getAgentMethodResult = async (req: Request, res: Response) => {
    log.debug(`getAgentMethodResult: ${JSON.stringify(req.params)}`);

    const token = '<TOKEN FOR TESTING>';
    const agent = req.params.agent;
    const method = req.params.method;

    if (
            ! (agent in allowedAgentMethods) 
        ||  ! (method in allowedAgentMethods[agent])
    ) {
        const message = `Agent "${agent}" OR method "${method}" are not allowed`;
        log.error(message);
        return res.status(400).json({'message': message});
    }

    try {
        return res.json(await allowedAgentMethods[agent][method](token, req.params));
    } catch (e) {
        log.error(e);
        return res.status(400).json({'message': (e as Error).message});
    }
}