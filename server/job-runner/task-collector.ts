import { AgentTask, AgentResult, RuleResult } from './interfaces';
import BackgroundAuth from './refresh-tokens';

class TaskCollector {
    private tasks: Array<AgentTask> = [];

    /**
     * Creates a Task object to be passed on to Target Agent execution.
     * @param agentResult Data from Source Agent request
     * @param ruleResults Rule evaluation Results for agentResults
     */
    public async put(agentResult: AgentResult, ruleResults: Array<RuleResult>) {
        // new token
        const token = await BackgroundAuth.refreshTokensForUser(agentResult.jobOwner);

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

                const task: AgentTask = {
                    token: {
                        auth: token.access,
                    },
                    target: target,
                };
                this.tasks.push(task);
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

export default new TaskCollector();
