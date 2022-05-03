/**
    Copyright 2022 Google LLC
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        https://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

require('module-alias/register');

import { Request, Response } from 'express';
import { log } from '@iftta/util';
import OpenWeatherMap from '@iftta/open-weather-map-agent';
import DV360Agent from '@iftta/dv360-ads';
import GoogleAdsAgent, { googleAds } from '@iftta/google-ads';
import AmbeeAgent from '@iftta/ambee-agent';
import { Token, User } from 'models/user';
import Repository from '../services/repository-service'
import Collections from '../services/collection-factory';
import { Collection } from '../models/fire-store-entity';

const usersCollection = Collections.get(Collection.USERS);
const userRepo = new Repository<User>(usersCollection);

const registeredAgents = {
    'dv360-agent': {
        metadata: DV360Agent.getAgentMetadata,
        list: DV360Agent.getEntityList,
    },
    'googleads-agent': {
        metadata: GoogleAdsAgent.getAgentMetadata,
        list: GoogleAdsAgent.listAdGroups,
    },
    'open-weather-map': {
        metadata: OpenWeatherMap.getAgentMetadata,
    },
    'ambee': {
        metadata: AmbeeAgent.getAgentMetadata,
    }
};

export const getAgentsMetadata = async (req: Request, res: Response) => {
    const result: Object[] = [];
    for (const agent in registeredAgents) {
        result.push(await registeredAgents[agent]?.metadata());
    }

    return res.json(result);
};

export const getAgentEntityList = async (req: Request, res: Response) => {

    const agentId = req.params.agent;
    const entityType = req.params.entityType;

    // TODO rethink the design here
    const agent = registeredAgents[agentId];

    let developerToken = '';
    let managerAccountId = '';
    let customerAccountId = '';

    try {
        let token: Token;
        const accessToken = req.headers.authorization?.split(' ')[1];
        log.debug('agents-controller:getAgentEntityList: Access Token', accessToken);
        if (accessToken != undefined) {
            const result = await userRepo.getBy('token.access', accessToken);
            let user: User;

            if (result.length > 0) {
                user = result[0];
                token = user.token;
                if (user.userSettings !== undefined) {
                    developerToken = user.userSettings['GOOGLEADS_DEV_TOKEN'];
                    managerAccountId = user.userSettings['GOOGLEADS_MANAGER_ACCOUNT_ID'];
                    customerAccountId = user.userSettings['GOOGLEADS_ACCOUNT_ID'];
                }

                if (agentId == 'googleads-agent') {
                    const googleAdsAgent = new googleAds();
                    return res.status(200).json(await googleAdsAgent.listAdGroups(token.access, developerToken, managerAccountId, customerAccountId));
                    // return res.json(mockGoogleAdsData());
                }
                if (agentId == 'dv360-agent') {
                    return res.status(200).json(await agent.list(token.access, entityType, req.query));
                }
            }
        }
        return res.status(404);
    } catch (err) {
        log.error(err);
        return res.status(500).json({ message: (err as Error).message });
    }
};

export const mockGoogleAdsData = () => {
    const data = [
        {
            "customerId": "9044713567",
            "campaignId": "360732199",
            "campaignName": "BMN Nightlights",
            "id": "24139328119",
            "name": "Map",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "360732199",
            "campaignName": "BMN Nightlights",
            "id": "25572252559",
            "name": "Wallpaper",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "361869559",
            "campaignName": "HappyHound EN",
            "id": "24144633679",
            "name": "Daycare",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "361869559",
            "campaignName": "HappyHound EN",
            "id": "24144658279",
            "name": "Training",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "361869559",
            "campaignName": "HappyHound EN",
            "id": "24144663199",
            "name": "Tricks",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "361869559",
            "campaignName": "HappyHound EN",
            "id": "24144760639",
            "name": "Kennel",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "361913479",
            "campaignName": "HappyHound ES",
            "id": "24146385799",
            "name": "Daycare",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "363632959",
            "campaignName": "HappyHound EN Video",
            "id": "24252093679",
            "name": "Google Videos",
            "type": "VIDEO_TRUE_VIEW_IN_STREAM",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "10273471619",
            "campaignName": "Ulbrich Medical EN",
            "id": "105474100067",
            "name": "EndoDriver",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "10273736072",
            "campaignName": "Ulbrich Medical DE",
            "id": "109348791344",
            "name": "EndoDriver",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "16161784759",
            "campaignName": "AIC Campaign",
            "id": "134645509854",
            "name": "AdGroup for B-Klass",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "16161784759",
            "campaignName": "AIC Campaign",
            "id": "134712916246",
            "name": "AdGroup for EQV",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "16161784759",
            "campaignName": "AIC Campaign",
            "id": "135495149949",
            "name": "AdGroup for GLB",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "16161784759",
            "campaignName": "AIC Campaign",
            "id": "135596182763",
            "name": "AdGroup for A-Klass",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "16161784759",
            "campaignName": "AIC Campaign",
            "id": "135596238203",
            "name": "AdGroup for Marco Polo",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "16161784759",
            "campaignName": "AIC Campaign",
            "id": "136713353180",
            "name": "AdGroup for GLE",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "16161784759",
            "campaignName": "AIC Campaign",
            "id": "137648135204",
            "name": "AdGroup for C-Klass",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "16161784759",
            "campaignName": "AIC Campaign",
            "id": "141203176532",
            "name": "AdGroup for V-Klass",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "16161784759",
            "campaignName": "AIC Campaign",
            "id": "144497304468",
            "name": "AdGroup for GLA",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "16161784759",
            "campaignName": "AIC Campaign",
            "id": "144497304668",
            "name": "AdGroup for E-Klass",
            "type": "SEARCH_STANDARD",
            "status": "PAUSED"
        },
        {
            "customerId": "9044713567",
            "campaignId": "16161784759",
            "campaignName": "AIC Campaign",
            "id": "144497304708",
            "name": "AdGroup for GLC",
            "type": "SEARCH_STANDARD",
            "status": "ENABLED"
        }
    ];

    return data;
}
