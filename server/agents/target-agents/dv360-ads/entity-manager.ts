import { InstanceOptions, EntityType, httpMethods, EntityStatus } from './interfaces';
import { DV360Entity, InsertionOrder, LineItem } from './models';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { config } from './config'

export default class EntityManager<T extends DV360Entity> {
    // Static method for instantiation
    public static getInstance(config: InstanceOptions, token: string) {
        switch (config.entityType) {
            case EntityType.IO:
                return new EntityManager<InsertionOrder>(
                    InsertionOrder,
                    config?.advertiserId as number,
                    config?.entityId as number,
                    token
                );
                break;

            case EntityType.LI:
                return new EntityManager<LineItem>(
                    LineItem,
                    config?.advertiserId as number,
                    config?.entityId as number,
                    token
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
        private advertiserId: number,
        private entityId: number,
        private token: string
    ) {
        if (! advertiserId || ! entityId || ! token) {
            throw new Error('"advertiserId & entityId & token" cannot be empty');
        }

        this.object = new objectType();
    }

    private async apiCall(options: AxiosRequestConfig, httpMethod: Method = 'GET') {
        options.headers = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
        options.method = httpMethod;

        const res = await axios(options);
        return res.data;
    }

    private async patch(options: AxiosRequestConfig) {
        return await this.apiCall(options, httpMethods.PATCH);
    }

    // Status change methods
    private getStatusChangeUrl(): string {
        return `${config.baseUrl}/${this.advertiserId}`
            + `/${this.object.apiUrlPart}/${this.entityId}`
            + '?updateMask=entityStatus';
    }

    private async changeStatus(es: EntityStatus) {
        const url = this.getStatusChangeUrl();
        const data = {entityStatus: es };

        return await this.patch({url, data});
    }

    public async activate() {
        return await this.changeStatus(EntityStatus.ACTIVATE);
    }

    public async pause() {
        return await this.changeStatus(EntityStatus.PAUSE);
    }
}