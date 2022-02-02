import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
    IAgent, 
    AgentResponse, 
    Configuration, 
    AgentResult, 
    AgentMetadata, 
    AgentType,
    TargetAction,
    DV360EntityType,
} from './interfaces';
import { config } from './config'
import log from '../../../util/logger';

export default class DV360Activation implements IAgent {
    public agentId: string = 'dv360-agent';
    public name: string = 'DV360 Agent';

    private apiPartBasedOnEntityType = {
        'LI': 'lineItems',
        'IO': 'insertionOrders'
    };

    private activationActions = {
        'activate': 'ENTITY_STATUS_ACTIVE',
        'pause': 'ENTITY_STATUS_PAUSED'
    };

    private async getApiResponse(
        options: Configuration
    ): Promise<AxiosResponse<any, any>> {
        if (
            !options.authToken || !options.action
            || !options.entityAdvertiserId
            || !options.entityId
            || !options.entityType
        ) {
            const err = '"authToken & entity* & action" cannot be empty.';
            log.error(err);
            throw new Error(err);
        }

        let url = `${options.baseUrl}/${options.apiVersion}/advertisers`
            + `/${options.entityAdvertiserId}`
            + `/${this.apiPartBasedOnEntityType[options.entityType]}`
            + `/${options.entityId}`
            + '?';

        const params = {};
        const data = {};

        if (options.action in this.activationActions) {
            url += `&updateMask=entityStatus`
            data['entityStatus'] = this.activationActions[options.action];
        }

        const headers = {
            'Authorization': `Bearer ${options.authToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        log.debug('HTTP Client created, with options');
        log.debug(JSON.stringify({ url, params, headers, data }));
        
        this.agentId = options.id;
        this.name = options.name;

        return axios({
            method: 'PATCH',
            responseType: 'json',
            url, params, headers, data,
        });
    }

    private async run(options: Configuration): Promise<AgentResponse> {
        try {
            const response = await this.getApiResponse(options);
            const agentResponse: AgentResponse = {
                jobId: options.jobId as string,
                data: response.data
            }
            
            return Promise.resolve(agentResponse);
        } catch (err) {
            // TODO If HTTP code != 200, should we return this back to queue?
            log.error(JSON.stringify(err));
        }

        return {
            jobId: options.jobId as string,
            data: ''
        }
    }

    private transform(weatherData: AgentResponse): AgentResult {
        return {
            agentId: this.agentId,
            jobId: weatherData.jobId,
            agentName: this.name,
            timestamp: new Date(),
            success: true,
        };
    }

    private getOptions(actions: TargetAction) {
        const options = {...config};
        
        actions.params.forEach(conf => {
            options[conf.key] = conf.value;
        });
        
        log.debug('Agent options used for this job', options);
        
        return options;
    }

    public async execute(action: TargetAction): Promise<AgentResult> {
        log.debug('DV360 Agent: Actions to execute');
        log.debug(action);

        const actionOptions = this.getOptions(action);
        const res = await this.run(actionOptions);
        res.data.agentId = actionOptions.id;
        res.data.agentName = actionOptions.name;
        res.jobId = actionOptions.jobId as string;

        const dv360Result = this.transform(res);
        console.debug('DV360 AgentResult', dv360Result);

        return dv360Result;
    }

    public async  getAgentMetadata(): Promise<AgentMetadata> {
        const meta: AgentMetadata = {
            agentId: this.agentId,
            agentName: this.name,
            agentType: AgentType.TARGET,
            queryable: [
                "entityAdvertiserId",
                "entityId",
            ],
            dataPoints: [{
                name: "authToken",
                displayName: "Google Auth Token",
                dataType: typeof String(),
            }, {
                name: "entityAdvertiserId",
                displayName: "DV360 Advertiser ID",
                dataType: typeof Number(),
            }, {
                name: "entityType",
                displayName: "DV360 Entity type (OI/LI)",
                dataType: typeof DV360EntityType,
            }, {
                name: "entityId",
                displayName: "DV360 Entity ID (IO/LI ID)",
                dataType: typeof Number(),
            }, {
                name: "action",
                displayName: "Activation action (activate/pause)",
                dataType: typeof String(),
            },]
        }
        
        return Promise.resolve(meta);
    }
}
