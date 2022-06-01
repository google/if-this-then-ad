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

import { Request, Response } from 'express';
import { log } from '@iftta/util';
import { AgentResult, RuleResult } from './interfaces';
import { RulesProcessor } from './rules-processor';
// export const messageHandler = (req:Request, res:Response) => {
//         if (req.body) {
//             if (!req.body.message) {
//                 log.error('Invalid message format received');
//                 res.status(400).send(`Bad request : invalid message format`);
//                 return;
//             }

//             const msg = req.body.message;
//             const msgData = msg.data ? Buffer.from(msg.data, 'base64').toString().trim() : {};

//             console.log(msgData);
//         }
// }

export const processMessage = async (
  message: AgentResult
): Promise<Array<RuleResult>> => {
  log.debug('Message-Handler: Received incoming message');
  log.debug(message);
  const rp = new RulesProcessor();

  return await rp.processAgentResult(message);
  // push ruleEvalResults into pubsub queue
  // for now we just pass it to the job-runner
  // so that it can execute it on the target system
};
