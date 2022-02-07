import EntityManager from './entity-manager'
import { 
    AgentTask, TargetAction, actionParam, ActionResult,
    EntityActions, InstanceOptions, IAgent
} from './interfaces';
import { config } from './config';

export default class DV360Agent implements IAgent {
    public agentId = config.id;
    public name = config.name;

    private transform(
        task: AgentTask,
        action: TargetAction,
        data: any,
        error: any = null
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
        a.forEach(p => { o[p.key] = p.value });
        if (! o['entityType']) {
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

    // TODO
    public async getAgentMetadata() {}

    // TODO: Method to query DV360 entities for the UI
}