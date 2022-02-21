require('module-alias/register');

import {Request, Response} from 'express';
import {log} from '@iftta/util';
import OpenWeatherMap from '@iftta/open-weather-map-agent';
import DV360Agent from '@iftta/dv360-ads';
import TaskConfiguration from '../job-runner/task-configuration';
import {Token} from 'models/user';

const allowedAgentMethods = {
    'dv360-agent': {
        metadata: DV360Agent.getAgentMetadata,
        list: DV360Agent.getEntityList,
    },
    'open-weather-map': {
        metadata: OpenWeatherMap.getAgentMetadata,
    },
};

export const getAgentsMetadata = async (req: Request, res: Response) => {
    const result: Object[] = [];
    for (const agent in allowedAgentMethods) {
        result.push(await allowedAgentMethods[agent]?.metadata());
    }

    return res.json(result);
};

export const getAgentEntityList = async (req: Request, res: Response) => {
    log.debug(`getAgentEntityList: ${JSON.stringify(req.params)}`);

    // TODO: obtain user ID from the Rule object
    // obtain freshTokens before running the jobs
    const userId = 'YrqYQc15jFYutbMdZNss';
    let token: Token;
    try {
        token = await TaskConfiguration.refreshTokensForUser(userId);
    } catch (e) {
        console.log('Cannot get token', e);
        throw new Error('Cannot get token');
    }

    const agent = req.params.agent;
    const entityType = req.params.entityType;
    const method = 'list';

    if (
        !(agent in allowedAgentMethods) ||
        !(method in allowedAgentMethods[agent])
    ) {
        const message = `Agent "${agent}" OR method "${method}" are not allowed`;
        log.error(message);
        return res.status(400).json({message: message});
    }

    try {
        return res.json(
            await allowedAgentMethods[agent][method](
                token.access,
                entityType,
                req.query
            )
        );
    } catch (e) {
        log.error(e);
        return res.status(400).json({message: (e as Error).message});
    }
};
