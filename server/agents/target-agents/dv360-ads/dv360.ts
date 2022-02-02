import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
    IAgent, 
    AgentResponse, 
    Configuration, 
    AgentResult, 
    AgentMetadata, 
    AgentType,
    TargetAction,
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

    public async execute(actions: TargetAction): Promise<AgentResult> {
        log.debug('DV360 Agent: Actions to execute');
        log.debug(actions);

        const jobOptions: Configuration = this.getOptions(actions);
        const res = await this.run(jobOptions);
        res.data.agentId = jobOptions.id;
        res.data.agentName = jobOptions.name;
        res.jobId = jobOptions.jobId as string;

        const dv360Result = this.transform(res);
        console.debug('DV360 AgentResult', dv360Result);

        return dv360Result;
    }

    public async  getAgentMetadata(): Promise<AgentMetadata> {
        //TODO decide if we should store this metadata as json 
        // and simply serve that to the caller. 

        const meta: AgentMetadata = {
            agentId: this.agentId,
            agentName: this.name,
            agentType: AgentType.SOURCE,
            queryable: ["targetLocation"],
            dataPoints: [{
                name: "targetLocation",
                displayName: "Location",
                dataType: typeof String(),
            }, {
                name: "temperature",
                displayName: "Temperature",
                dataType: typeof Number(),
            }, {
                name: "windSpeed",
                displayName: "Wind speed",
                dataType: typeof Number(),
            }, {
                name: "clouds",
                displayName: "Clouds",
                dataType: typeof Boolean(),
            }, {
                name: "rain",
                displayName: "Rain",
                dataType: typeof Boolean(),
            }, {
                name: "snow",
                displayName: "Snow",
                dataType: typeof Boolean(),
            }, {
                name: "thunderstorm",
                displayName: "Thunderstorm",
                dataType: typeof Boolean(),
            },
            {
                name: "clearSky",
                displayName: "Clear Sky",
                dataType: typeof Boolean(),
            },
            {
                name: "timestamp",
                displayName: "Last execution",
                dataType: typeof Date(),
            }

            ]

        }
        return Promise.resolve(meta);
    }
}
