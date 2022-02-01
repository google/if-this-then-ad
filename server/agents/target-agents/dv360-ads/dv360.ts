import axios, { AxiosInstance } from 'axios';
import { 
    IAgent, 
    AgentResponse, 
    Configuration, 
    AgentResult, 
    AgentMetadata, 
    AgentType, 
    Job 
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

    private createApiClient(options: Configuration): AxiosInstance {
        if (!options.authToken || !options.targetEntity || !options.action) {
            const err = '"authToken & targetEntities & action" cannot be empty.';
            log.error(err);
            throw new Error(err);
        }

        const endpoint = `${options.baseUrl}/${options.apiVersion}/advertisers`
            + `/${options.targetEntity.advertiserId}`
            + `/${this.apiPartBasedOnEntityType[options.targetEntity.type]}`
            + `/${options.targetEntity.id}`;

        let params = {};
        if (options.action in this.activationActions) {
            params = { 
                'entityStatus': this.activationActions[options.action]
            };
        }

        const headers = {
            'Authorization': `Bearer ${options.authToken}`,
            'Accept': '*/*',
        };
        
        const client = axios.create({
            baseURL: endpoint,
            method: 'PATCH',
            responseType: 'json',
            params,
            headers,
        });

        log.debug('HTTP Client created, with options');
        log.debug(JSON.stringify({ endpoint, params, headers }));
        
        this.agentId = options.id;
        this.name = options.name;

        return client;
    }

    private async run(options: Configuration): Promise<AgentResponse> {
        try {
            let client = this.createApiClient(options);
            const response = await client.get('/');
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

    private getOptions(job: Job) {
        const options = {...config};
        console.log('Job:', job);
        console.log('config:', config);
        
        options.jobId = job.id;
        
        if (
            job.hasOwnProperty('update')
            && 'undefined' != typeof job.update
        ) {
            job.update.forEach(conf => {
                options[conf.key] = conf.value;
            });
        }

        log.debug('Agent options used for this job'); 
        log.debug(options);
        
        return options;
    }

    public async execute(job: Job): Promise<AgentResult> {
        log.debug('Agent: Job to execute');
        log.debug(job);

        const jobOptions = this.getOptions(job);
        const res = await this.run(jobOptions);
        res.data.agentId = jobOptions.id;
        res.data.agentName = jobOptions.name;
        res.jobId = jobOptions.jobId as string;

        const dv360Result = this.transform(res);
        console.log(dv360Result);

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
