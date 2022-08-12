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
import { logger } from '../util/logger';
import { OpenWeatherMap } from '../agents/source-agents/open-weather-map/open-weather-map';
import { DV360Agent } from '../agents/target-agents/dv360-ads/dv360-agent';
import { GoogleAdsAgent } from '../agents/target-agents/google-ads/googleads-agent';
import { AmbeeAgent } from '../agents/source-agents/ambee/ambee';
import { Token, User } from 'models/user';
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Collection } from '../models/fire-store-entity';

const usersCollection = Collections.get(Collection.USERS);
const userRepo = new Repository<User>(usersCollection);
const dv360Agent = new DV360Agent();
const googleAdsAgent = new GoogleAdsAgent();

const registeredAgents = {
  'dv360-agent': {
    metadata: dv360Agent.getAgentMetadata,
    list: dv360Agent.getEntityList,
  },
  'googleads-agent': {
    metadata: googleAdsAgent.getAgentMetadata,
    list: googleAdsAgent.listAdGroups,
  },
  'open-weather-map': {
    metadata: OpenWeatherMap.getAgentMetadata,
  },
  ambee: {
    metadata: AmbeeAgent.getAgentMetadata,
  },
};

export const getAgentsMetadata = async (req: Request, res: Response) => {
  const result: any = [];
  // eslint-disable-next-line guard-for-in
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
    // TODO: Move auth/user settings to the separate module
    let token: Token;
    const accessToken = req.headers.authorization?.split(' ')[1];
    logger.debug(
      'agents-controller:getAgentEntityList: Access Token',
      accessToken
    );
    if (accessToken != undefined) {
      const result = await userRepo.getBy('token.access', accessToken);
      let user: User;

      if (result.length > 0) {
        user = result[0];
        token = user.token;
        if (user.settings !== undefined) {
          developerToken = user.settings['GOOGLEADS_DEV_TOKEN'];
          managerAccountId = user.settings['GOOGLEADS_MANAGER_ACCOUNT_ID'];
          customerAccountId = user.settings['GOOGLEADS_ACCOUNT_ID'];
        }

        if (agentId == 'googleads-agent') {
          // TODO: re-use the const from the top? what's the logic here?
          const googleAdsAgent = new GoogleAdsAgent();
          return res
            .status(200)
            .json(
              await googleAdsAgent.listAdGroups(
                token.access,
                developerToken,
                managerAccountId,
                customerAccountId
              )
            );
        }
        if (agentId == 'dv360-agent') {
          return res
            .status(200)
            .json(await agent.list(token.access, entityType, req.query));
        }
      }
    }
    return res.status(404);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: (err as Error).message });
  }
};
