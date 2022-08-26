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
import { agentsService } from '../services/agents-service';
import { collectionService } from '../services/collections-service';
import { logger } from '../util/logger';

export const getAgentsMetadata = async (req: Request, res: Response) => {
  const agentMetadata = await agentsService.describeAll();
  return res.json(agentMetadata);
};

export const getAgentEntityList = async (req: Request, res: Response) => {
  const agentId = req.params.agent;
  if (!agentId) {
    return res.status(400).send('Invalid agent parameter.');
  }

  const entityType = req.params.entityType;
  if (!entityType) {
    return res.status(400).send('Invalid entityType parameter.');
  }

  const accessToken = req.headers.authorization?.split(' ')[1];
  if (!accessToken) {
    logger.error('Invalid request credentials.');
    return res.status(401).send();
  }

  const [requestor] = await collectionService.users.findWhere(
    'credentials.accessToken',
    accessToken
  );
  if (!requestor) {
    logger.error('Invalid request credentials.');
    return res.status(401).send();
  }

  const agent = agentsService.getTargetAgent(agentId);
  if (!agent) {
    logger.error(`Unknown target agent: ${agentId}`);
    return res.status(404).send();
  }

  const params = Object.fromEntries(
    Object.entries(req.query).filter((entry) => typeof entry[1] === 'string')
  ) as Record<string, string>;
  const response = await agent.listTargetEntities(
    entityType,
    params,
    requestor,
    requestor.settings
  );
  if (response.status === 'failed') {
    logger.error(response.error);
    return res.status(400).send(response.error);
  }
  return res.json(response);
};
