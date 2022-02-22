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

import {
    httpMethods,
    InstanceOptions,
    EntityType,
    EntityStatus,
    ApiCallParams,
} from './interfaces';
import { DV360Entity, InsertionOrder, LineItem, Campaign, Advertiser, Partner } from './models';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { config } from './config';

export default class EntityManager<T extends DV360Entity> {
    // Static method for instantiation
    public static getInstance(config: InstanceOptions, token: string, params = {}) {
        if (params['advertiserId'] && !config.parentId) {
            config.parentId = parseInt(params['advertiserId']);
        } else if (params['partnerId'] && !config.parentId) {
            config.parentId = parseInt(params['partnerId']);
        }

        switch (config.entityType) {
            case EntityType.insertionOrder:
                return new EntityManager<InsertionOrder>(
                    InsertionOrder,
                    config?.parentId as number,
                    config?.entityId as number,
                    token,
                );
                break;

            case EntityType.lineItem:
                return new EntityManager<LineItem>(
                    LineItem,
                    config?.parentId as number,
                    config?.entityId as number,
                    token,
                );
                break;

            case EntityType.campaign:
                return new EntityManager<Campaign>(
                    Campaign,
                    config?.parentId as number,
                    config?.entityId as number,
                    token,
                );
                break;

            case EntityType.advertiser:
                return new EntityManager<Advertiser>(
                    Advertiser,
                    config?.parentId as number,
                    config?.entityId as number,
                    token,
                );
                break;

            case EntityType.partner:
                return new EntityManager<Partner>(
                    Partner,
                    config?.parentId as number,
                    config?.entityId as number,
                    token,
                );
                break;

            default:
                throw new Error(`Entity type ${config.entityType} is not supported`);
        }
    }

    // Class definition
    private object: T;

    constructor(
        private objectType: new () => T,
        private parentId: number,
        private entityId: number,
        private token: string,
    ) {
        if (!token) {
            throw new Error('"token" cannot be empty');
        }

        this.object = new objectType();
    }

    private async apiCall(options: AxiosRequestConfig, httpMethod: Method = 'GET') {
        options.headers = {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
        options.method = httpMethod;

        const res = await axios(options);
        return res.data;
    }

    private parseTemplateString(s: string): string {
        return s
            .replace('{parentId}', this.parentId?.toString())
            .replace('{partnerId}', this.parentId?.toString())
            .replace('{advertiserId}', this.parentId?.toString())
            .replace('{entityId}', this.entityId?.toString());
    }

    private parseTemplateObject(o: Object | undefined): Object {
        const result = {};
        for (const key in o) {
            result[key] = this.parseTemplateString(o[key]);
        }

        return result;
    }

    private getApiCallParams(p: ApiCallParams): ApiCallParams {
        return {
            url: config.baseUrl + this.parseTemplateString(p.url),
            params: this.parseTemplateObject(p?.params),
        };
    }

    private async patch(options: AxiosRequestConfig) {
        return await this.apiCall(options, httpMethods.PATCH);
    }

    // Status change methods
    private async changeStatus(es: EntityStatus) {
        if (!this.entityId) {
            throw new Error('entityId must be set');
        }

        const apiCallParams = this.getApiCallParams(this.object.apiConfig);

        apiCallParams.url += `/${this.entityId}`;
        apiCallParams['data'] = { entityStatus: es };
        if (apiCallParams.params) {
            apiCallParams.params['updateMask'] = 'entityStatus';
        } else {
            apiCallParams.params = { updateMask: 'entityStatus' };
        }

        return await this.patch(apiCallParams);
    }

    public async activate() {
        return await this.changeStatus(EntityStatus.ACTIVE);
    }

    public async pause() {
        return await this.changeStatus(EntityStatus.PAUSED);
    }

    // List method
    public async list(params: Object, getOnlyActive = true, onlyFirstPage = false) {
        // TODO: Debug
        onlyFirstPage = true;

        const apiCallParams = this.getApiCallParams(this.object.apiConfig);
        if (!apiCallParams['params']) {
            apiCallParams['params'] = {};
        }

        const filters = {};
        if (params['insertionOrderId']) {
            filters['insertionOrderId'] = parseInt(params['insertionOrderId']);
        }

        if (getOnlyActive || params['entityStatus']) {
            filters['entityStatus'] = params['entityStatus'] || 'ENTITY_STATUS_ACTIVE';
        }

        apiCallParams['params']['filter'] = new URLSearchParams(filters).toString();

        let result: Object[] = [];
        let nextPageToken = '';
        do {
            apiCallParams['params']['pageToken'] = nextPageToken;
            const tmpResult = await this.apiCall(apiCallParams);

            if (!tmpResult || ! (this.object.listName in tmpResult) ) {
                break;
            }

            result = [...result, ...tmpResult[this.object.listName]];
            nextPageToken = tmpResult['nextPageToken'];
        } while (nextPageToken && !onlyFirstPage);

        return result;
    }
}
