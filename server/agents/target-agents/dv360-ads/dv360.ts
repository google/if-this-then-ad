import axios, { AxiosInstance } from 'axios'
import { 
    AgentTask, EntityType, TargetAction, actionParam, EntityStatus, ActionResult 
} from './interfaces';
import { config } from './config'

export default class DV360 {
    private apiClient: AxiosInstance|null = null;
    private options: any = {};

    private setApiClient(options: any) {
        const headers = {
            'Authorization': `Bearer ${options.authToken}`,
            'Content-Type': 'application/json',
        };

        this.apiClient = axios.create({
            baseURL: options.baseUrl,
            responseType: 'json',
            headers,
        });
    }

    private setOptions(task: AgentTask) {
        this.options = {
            authToken: task.tokens.auth,
            baseURL: config.baseUrl,
        };
    }

    private getEntityType(t: string) {
        return 'IO' == t ? EntityType.IO : EntityType.LI;
    }

    private getEntityStatusString(s: string) {
        return 'activate' == s ? EntityStatus.ACTIVATE : EntityStatus.DEACTIVATE;
    }

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

    private keyValueArrayToObject(a: Array<actionParam>) {
        const o = {};
        a.forEach(p => { o[p.key] = p.value });
        return o;
    }

    private async doAction(action: TargetAction) {
        const currentActionOptions = this.keyValueArrayToObject(action.params);

        const url = this.options.baseURL + '/advertisers'
            + `/${currentActionOptions['advertiserId']}`
            + `/${this.getEntityType(currentActionOptions['entityType'])}`
            + `/${currentActionOptions['entityId']}`
            + '?updateMask=entityStatus';

        const data = {
            entityStatus: this.getEntityStatusString(currentActionOptions['action'])
        };

        const res = await this.apiClient!.patch(url, data)
        return res.data;
    }

    public async execute(task: AgentTask) {
        this.setOptions(task);
        this.setApiClient(this.options);

        const result: Array<any> = [];
        for (const action of task.ruleResult.actions) {
            try {
                const data = await this.doAction(action);
                result.push(this.transform(task, action, data));
            } catch (err) {
                //console.error(err);
                result.push(this.transform(task, action, {}, err));
            }
        }

        return result;
    }

    // TODO
    public async getMetadata() {}

    // TODO: Method to query DV360 entities for the UI
}