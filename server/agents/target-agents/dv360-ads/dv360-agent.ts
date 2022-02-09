import EntityManager from './entity-manager';
import {
    AgentTask,
    TargetAction,
    actionParam,
    ActionResult,
    EntityActions,
    InstanceOptions,
    IAgent,
    AgentType,
    AgentMetadata,
} from './interfaces';
import { config } from './config';

export default class DV360Agent implements IAgent {
    public agentId = config.id;
    public name = config.name;

    private transform(
        task: AgentTask,
        action: TargetAction,
        data: any,
        error: any = null,
    ): ActionResult {
        return {
            ruleId: task.ruleResult.ruleId,
            action: action.action,
            displayName: data?.displayName,
            entityStatus: data?.entityStatus,
            timestamp: new Date(),
            success: error ? false : true,
            error: error?.message,
        };
    }

    private toInstanceOptions(a: Array<actionParam>): InstanceOptions {
        const o: Object = {};
        a.forEach((p) => {
            o[p.key] = p.value;
        });
        if (!o['entityType']) {
            throw Error('entityType cannot be empty');
        }

        return o as InstanceOptions;
    }

    private async executeAction(action: TargetAction, token: string) {
        const instanceOptions = this.toInstanceOptions(action.params);
        const entity = EntityManager.getInstance(instanceOptions, token);

        switch (instanceOptions.action) {
            case EntityActions.ACTIVATE:
                return await entity.activate();

            case EntityActions.PAUSE:
                return await entity.pause();

            default:
                throw Error(`Not supported entity action method: ${instanceOptions.action}`);
        }
    }

    public async execute(task: AgentTask) {
        const result: Array<ActionResult> = [];
        for (const action of task.ruleResult.actions) {
            try {
                const data = await this.executeAction(action, task.tokens.auth);
                result.push(this.transform(task, action, data));
            } catch (err) {
                result.push(this.transform(task, action, {}, err));
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
            displayName: this.name,
            type: AgentType.TARGET,
            arguments: ['targetLocation'],
            dataPoints: [
                {
                    id: 'targetLocation',
                    displayName: 'Location',
                    dataType: typeof String(),
                },
                {
                    id: 'temperature',
                    displayName: 'Temperature',
                    dataType: typeof Number(),
                },
                {
                    id: 'windSpeed',
                    displayName: 'Wind speed',
                    dataType: typeof Number(),
                },
                {
                    id: 'clouds',
                    displayName: 'Clouds',
                    dataType: typeof Boolean(),
                },
                {
                    id: 'rain',
                    displayName: 'Rain',
                    dataType: typeof Boolean(),
                },
                {
                    id: 'snow',
                    displayName: 'Snow',
                    dataType: typeof Boolean(),
                },
                {
                    id: 'thunderstorm',
                    displayName: 'Thunderstorm',
                    dataType: typeof Boolean(),
                },
                {
                    id: 'clearSky',
                    displayName: 'Clear Sky',
                    dataType: typeof Boolean(),
                },
                {
                    id: 'timestamp',
                    displayName: 'Last execution',
                    dataType: typeof Date(),
                },
            ],
        };

        return Promise.resolve(meta);
    }

    // Query DV360 entities for the UI
    public async getEntityList(token: string, params: Object) {
        if (
            !('entity' in params) ||
            !('parentId' in params) ||
            !params['entity'] ||
            !params['parentId']
        ) {
            throw new Error('Please specify both "entity" and "parentId"');
        }

        const instanceOptions: InstanceOptions = {
            entityType: params['entity'],
            parentId: params['parentId'],
        };

        const instance = EntityManager.getInstance(instanceOptions, token);
        const result: any[] = [];
        (await instance.list()).forEach((o: any) => {
            result.push({
                name: o?.displayName,
                partnerId: o?.partnerId,
                advertiserId: o?.advertiserId,
                insertionOrderId: o?.insertionOrderId,
                lineItemId: o?.lineItemId,
                entityStatus: o?.entityStatus,
            });
        });

        return result;
    }
}
