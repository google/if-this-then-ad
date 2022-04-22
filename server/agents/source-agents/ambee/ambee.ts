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

import axios, { AxiosInstance } from 'axios';
import {
    IAgent,
    AgentResponse,
    Configuration,
    AgentResult,
    WeatherCodes,
    AgentMetadata,
    AgentType,
    Job,
} from './interfaces';
import { config } from './config';
import { log } from '@iftta/util';
import Repository from '../../../services/repository-service';
import Collections from '../../../services/collection-factory';
import { Collection } from '../../../models/fire-store-entity';
import { Rule } from '../../../models/rule';

export default class AmbeeAgent implements IAgent {
    public agentId: string = config.id;
    public name: string = config.name;

    private createApiClient(dataPoint: string, options: Configuration): AxiosInstance {
        if (!options.apiKey) {
            const errorMessage = 'API Key not set, it needs to be set in the user settings';
            log.error(errorMessage);
            throw new Error(errorMessage);
        }

        const url = options.baseUrl[dataPoint];
        if (!url) {
            throw new Error(`${dataPoint} was not found in ${JSON.stringify(options.baseUrl)}`);
        }

        const escapedUrl = encodeURI(url.replace('{{location}}', options.targetLocation));

        const client = axios.create({
            baseURL: escapedUrl,
            method: 'GET',
            responseType: 'json',
            headers: {
                'x-api-key': options.apiKey,
            },
        });

        log.debug(`${this.agentId} : HTTP Client created, with options`);
        log.debug(
            JSON.stringify({
                q: options.targetLocation,
                appid: options.apiKey,
            }),
        );
        this.agentId = options.id;
        this.name = options.name;

        return client;
    }

    private async run(options: Configuration): Promise<AgentResponse> {
        try {
            // Get rule
            const rulesCollection = Collections.get(Collection.RULES);
            const repo = new Repository<Rule>(rulesCollection);
            if (!options.rules || !options.rules.length) {
                throw new Error(`Empty rules array: ${JSON.stringify(options)}`);
            }

            const rule = await repo.get(options.rules[0]);
            if (!rule) {
                throw new Error(`Cannot find the rule: ${options.rules[0]}`);
            }

            log.debug(`${this.agentId} :run: options`);
            log.debug(options);

            const client = this.createApiClient(rule.condition.dataPoint, options);
            const response = await client.get('/');
            log.debug(`${this.agentId} :run: raw client response`);
            log.debug(JSON.stringify(response.data));

            const agentResponse: AgentResponse = {
                jobOwner: '',
                jobId: options.jobId!,
                data: response.data,
            };

            log.debug(`${this.agentId} :run: client response`);
            log.debug(agentResponse);
            return Promise.resolve(agentResponse);
        } catch (err) {
            log.error(JSON.stringify(err));
        }

        return {
            jobId: options.jobId!,
            jobOwner: '',
            data: [],
        };
    }

    private transform(ambeeData: AgentResponse): AgentResult | undefined {
        log.info('Transforming ambee data');
        log.info(ambeeData);

        const generalResponse = {
            agentId: this.agentId,
            jobId: ambeeData.jobId,
            agentName: this.name,
            jobOwner: ambeeData.jobOwner,
            timestamp: new Date(),
        };

        if (ambeeData.data?.data && ambeeData.data?.data.length) {
            const data = ambeeData.data.data[0];
            return {
                ...generalResponse,
                data: {
                    pollenRiskLevel: this.getHeighestLevel(
                        data.Risk.grass_pollen,
                        data.Risk.tree_pollen,
                        data.Risk.weed_pollen,
                    ),
                },
            };
        } else if (ambeeData.data?.stations && ambeeData.data?.stations.length) {
            const data = ambeeData.data.stations[0];
            return {
                ...generalResponse,
                data: {
                    airQualityLevel: data.aqiInfo.category,
                },
            };
        }

        throw new Error(`Not supported ambee response format: ${JSON.stringify(ambeeData)}`);
    }

    private getOptions(job: Job) {
        if (!job.query || !job.query.length || !job.query[0].value) {
            throw new Error('job.query is empty, cannot get the "targetLocation"');
        }

        const options = {
            ...config,
            apiKey: job && job?.ownerSettings ? job?.ownerSettings['AMBEE_API_KEY'] : '',
            jobId: job.id,
            targetLocation: job.query[0].value as string,
            jobOwner: job.owner,
        };

        log.debug(`${this.agentId} : Agent options used for this job`);
        log.debug(options);

        return options;
    }

    private getHeighestLevel(l1: string, l2: string, l3: string) {
        const pollenLevels = {
            Low: 0,
            Moderate: 1,
            High: 2,
            'Very High': 3,
        };

        const maxLevel = Math.max(pollenLevels[l1], pollenLevels[l2], pollenLevels[l3]);

        for (let key in pollenLevels) {
            if (pollenLevels[key] == maxLevel) {
                return key;
            }
        }

        throw new Error('getHeighestLevel: something went wrong');
    }

    public async execute(job: Job): Promise<AgentResult> {
        log.debug(`${this.agentId} : execute : Job to execute`);
        log.debug(job);
        const jobOptions = this.getOptions(job);
        if (!jobOptions.apiKey) {
            const errorMessage = `Execution of Job ${job.id} failed: Cannot run the job without the apiKey`;
            log.debug(errorMessage);
            return Promise.reject(errorMessage);
        }

        const res = await this.run(jobOptions);

        res.data.agentId = jobOptions.id;
        res.data.agentName = jobOptions.name;
        res.data.targetLocation = jobOptions.targetLocation;
        res.jobId = jobOptions.jobId as string;
        res.jobOwner = job.owner;

        const agentResult = this.transform(res);

        if (agentResult !== undefined) {
            return Promise.resolve(agentResult);
        }

        const errorMessage = `Execution of Job ${job.id} failed, Agent ${job.agentId}, Query ${job.query}`;
        return Promise.reject(errorMessage);
    }

    public static async getAgentMetadata(): Promise<AgentMetadata> {
        // TODO decide if we should store this metadata as json
        // and simply serve that to the caller.
        const meta: AgentMetadata = {
            id: config.id,
            name: config.name,
            type: AgentType.SOURCE,
            settings: {
                agentId: config.id,
                params: [
                    {
                        name: 'Ambee API Key',
                        settingName: 'AMBEE_API_KEY',
                    },
                    {
                        name: 'Google Maps API Key',
                        settingName: 'GOOGLEMAPS_API_KEY',
                    },
                ],
            },
            params: [
                {
                    dataPoint: 'targetLocation',
                    name: 'Target Location',
                    type: 'location',
                },
            ],
            dataPoints: [
                {
                    dataPoint: 'pollenRiskLevel',
                    name: 'Pollen Level',
                    dataType: 'enum',
                    enum: ['Low', 'Moderate', 'High', 'Very High'],
                },
                {
                    dataPoint: 'airQualityLevel',
                    name: 'Air Quality',
                    dataType: 'enum',
                    enum: [
                        'Good',
                        'Moderate',
                        'Unhealthy for Sensitive Groups',
                        'Unhealthy',
                        'Very Unhealthy',
                        'Hazardous',
                    ],
                },
            ],
        };

        return Promise.resolve(meta);
    }
}
