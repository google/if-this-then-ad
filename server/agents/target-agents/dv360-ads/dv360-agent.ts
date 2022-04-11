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

import EntityManager from './entity-manager';
import {
    AgentTask,
    Action,
    ActionResult,
    EntityActions,
    InstanceOptions,
    IAgent,
    AgentType,
    AgentMetadata,
    EntityType,
    httpMethods,
    RuleResultValue,
    Parameter,
} from './interfaces';
import { config } from './config';

export default class DV360Agent implements IAgent {
    public agentId = config.id;
    public name = config.name;

    private transform(task: AgentTask, data: any, error: any = null): ActionResult {
        return {
            ruleId: task.target.ruleId,
            agentId: config.id,
            displayName: data?.displayName,
            entityStatus: data?.entityStatus,
            timestamp: new Date(),
            success: error ? false : true,
            error: error?.message,
        };
    }

    private toInstanceOptions(a: Array<Parameter>): InstanceOptions {
        const o: Object = {};
        a.forEach((p) => {
            o[p.key] = p.value;
        });
        if (!o['entityType']) {
            throw Error('entityType cannot be empty');
        }

        return o as InstanceOptions;
    }

    private async executeAction(action: Action, result: RuleResultValue, token: string) {
        const instanceOptions = this.toInstanceOptions(action.params);
        const entity = EntityManager.getInstance(instanceOptions, token);

        switch (action.type) {
            case EntityActions.ACTIVATE:
                return await (result ? entity.activate() : entity.pause());
                break;

            case EntityActions.PAUSE:
                return await (result ? entity.pause() : entity.activate());
                break;

            default:
                throw Error(`Not supported entity action method: ${instanceOptions.action}`);
        }
    }

    public async execute(task: AgentTask) {
        const result: Array<ActionResult> = [];
        for (const action of task.target.actions) {
            try {
                const data = await this.executeAction(action, task.target.result, task.token.auth);
                result.push(this.transform(task, data));
            } catch (err) {
                result.push(this.transform(task, {}, err));
            }
        }

        return result;
    }

    // Metadata for UI
    public async getAgentMetadata(): Promise<AgentMetadata> {
        // TODO decide if we should store this metadata as json
        // and simply serve that to the caller.

        const meta: AgentMetadata = {
            id: config.id,
            name: config.name,
            type: AgentType.TARGET,
            arguments: ['advertiserId', 'entityId', 'entityType'],
            api: [
                {
                    dataPoint: 'partnerId',
                    list: {
                        url: `/api/agents/${config.id}/list/partner`,
                        method: httpMethods.GET,
                    },
                },
                {
                    dataPoint: 'advertiserId',
                    list: {
                        url: `/api/agents/${config.id}/list/advertiser`,
                        method: httpMethods.GET,
                        params: {
                            partnerId: typeof Number(),
                        },
                    },
                },
                {
                    dataPoint: 'insertionOrderId',
                    list: {
                        url: `/api/agents/${config.id}/list/insertionOrder`,
                        method: httpMethods.GET,
                        params: {
                            partnerId: typeof Number(),
                            advertiserId: typeof Number(),
                        },
                    },
                },
                {
                    dataPoint: 'lineItemId',
                    list: {
                        url: `/api/agents/${config.id}/list/lineItem`,
                        method: httpMethods.GET,
                        params: {
                            partnerId: typeof Number(),
                            advertiserId: typeof Number(),
                            insertionOrderId: typeof Number(),
                        },
                    },
                },
            ],
            dataPoints: [
                {
                    id: 'advertiserId',
                    displayName: 'Advertiser',
                    dataType: typeof Number(),
                },
                {
                    id: 'entityId',
                    displayName: 'Entity',
                    dataType: typeof Number(),
                },
                {
                    id: 'entityType',
                    displayName: 'Entity Type',
                    dataType: `${EntityType.insertionOrder}|${EntityType.lineItem}`,
                },
            ],
        };

        return Promise.resolve(meta);
    }

    // Query DV360 entities for the UI
    public async getEntityList(token: string, entityType: EntityType, params: Object) {
        if (!entityType || !Object.values(EntityType).includes(entityType)) {
            throw new Error(`${entityType} is not a known entity type`);
        }

        const instance = EntityManager.getInstance({ entityType }, token, params);
        const result: any[] = [];
        (await instance.list(params)).forEach((o: any) => {
            result.push({
                name: o?.displayName,
                partnerId: o?.partnerId || params['partnerId'],
                advertiserId: o?.advertiserId || params['advertiserId'],
                insertionOrderId: o?.insertionOrderId || params['insertionOrderId'],
                lineItemId: o?.lineItemId,
                entityStatus: o?.entityStatus,
            });
        });

        return result;
    }
}
