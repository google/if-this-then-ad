require('module-alias/register');

import { Request, Response } from 'express';
import TaskConfiguration from '../job-runner/task-configuration';

const allowedKeys = {
    'GOOGLE_MAPS_API_KEY': 'open-weather-map',
};

export const getKey = async (req: Request, res: Response) => {
    if (! (req.params.name in allowedKeys)) {
        return res.status(400).json({
            message: `API Key ${req.params.name} is not supported`
        });
    }
    
    const requestedKey = req.params.name;

    // TODO: Take the user from the session
    const userId = 'YrqYQc15jFYutbMdZNss';

    try {
        const userSettings = await TaskConfiguration.getUserSettingsForAgent(
            userId,
            allowedKeys[req.params.name]
        );
            
        let key = '';
        if (userSettings?.params) {
            for (const param of userSettings?.params) {
                if (requestedKey == param.key) {
                    key = param.value as string;
                }
            }
        }

        return res.json({key});
    } catch (e) {
        return res.status(400).json({message: (e as Error).message});
    }

};