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

import { log } from '@iftta/util';
import { AgentTask, AgentResult, RuleResult, UserSettingKeyValue } from './interfaces';
import TaskConfiguration from './task-configuration';
import { Token } from './../models/user';

export default class TaskCollector {
    private tasks: Array<AgentTask> = [];

    /**
     * Creates a Task object to be passed on to Target Agent execution.
     * @param agentResult Data from Source Agent request
     * @param ruleResults Rule evaluation Results for agentResults
     */
    public async put(agentResult: AgentResult, ruleResults: Array<RuleResult>) {
        const ownerId = agentResult.jobOwner;

        let token: Token|undefined, 
            ownerSettings: UserSettingKeyValue;
        try {
            // new token
            token = await TaskConfiguration.refreshTokensForUser(ownerId);
            ownerSettings = await TaskConfiguration.getUserSettings(ownerId);
        } catch (e) {
            log.error(['Could not configure the task.', e as string]);
            return;
        }

        // target
        for (let rr of ruleResults) {
            for (let t of rr.targets) {
                // make one task per target.
                const target = {
                    ruleId: rr.ruleId,
                    agentId: t.agentId,
                    result: rr.result,
                    actions: t.actions,
                };

                this.tasks.push({
                    token: {
                        auth: token.access,
                    },
                    ownerSettings,
                    target,
                    ownerId, 
                });
            }
        }
    }
    /**
     * Returns an array of collected Agent tasks
     * @returns {Array<AgentTask} tasks
     */
    public get(): Array<AgentTask> {
        return this.tasks;
    }
}