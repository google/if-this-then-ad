import { 
    InstanceOptions, EntityType, httpMethods, EntityStatus, ApiCallParams,
} from './interfaces';
import { 
    DV360Entity, InsertionOrder, LineItem, Campaign, Advertiser, Partner
} from './models';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { config } from './config'

export default class EntityManager<T extends DV360Entity> {
    // Static method for instantiation
    public static getInstance(config: InstanceOptions, token: string) {
        switch (config.entityType) {
            case EntityType.InsertionOrder:
                return new EntityManager<InsertionOrder>(
                    InsertionOrder,
                    config?.parentId as number,
                    config?.entityId as number,
                    token
                );
                break;

            case EntityType.LineItem:
                return new EntityManager<LineItem>(
                    LineItem,
                    config?.parentId as number,
                    config?.entityId as number,
                    token
                );
                break;

            case EntityType.Campaign:
                return new EntityManager<Campaign>(
                    Campaign,
                    config?.parentId as number,
                    config?.entityId as number,
                    token
                );
                break;
            
            case EntityType.Advertiser:
                return new EntityManager<Advertiser>(
                    Advertiser,
                    config?.parentId as number,
                    config?.entityId as number,
                    token
                );
                break;

            case EntityType.Partner:
                    return new EntityManager<Partner>(
                        Partner,
                        config?.parentId as number,
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
        private parentId: number,
        private entityId: number,
        private token: string
    ) {
        if (! parentId || ! entityId || ! token) {
            throw new Error('"parentId & entityId & token" cannot be empty');
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

    private parseTemplateString(s: string): string {
        return s
            .replace('{parentId}', this.parentId.toString())
            .replace('{partnerId}', this.parentId.toString())
            .replace('{advertiserId}', this.parentId.toString())
            .replace('{entityId}', this.entityId.toString());
    }

    private parseTemplateObject(o: Object|undefined): Object {
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

    private getBaseUrl() {
        return `${config.baseUrl}/` + (
            this.object.overrideBaseUrlExtension
                ? this.object.overrideBaseUrlExtension
                : config.baseUrlExtension
            );
    }

    // Status change methods
    private getStatusChangeUrl(): string {
        return `${this.getBaseUrl()}/${this.parentId}`
            + `/${this.object.apiUrlPart}/${this.entityId}`
            + '?updateMask=entityStatus';
    }

    private async changeStatus(es: EntityStatus) {
        const url = this.getStatusChangeUrl();
        const data = {entityStatus: es};

        return await this.patch({url, data});
    }

    public async activate() {
        return await this.changeStatus(EntityStatus.ACTIVATE);
    }

    public async pause() {
        return await this.changeStatus(EntityStatus.PAUSE);
    }

    // List method
    public async list(getOnlyActive: boolean = true) {
        // TODO mplement pagination
        const apiCallParams = this.getApiCallParams(this.object.listPath);
        if (! apiCallParams['params'] ) {
            apiCallParams['params'] = {};
        }

        if (getOnlyActive) {
            apiCallParams['params']['filter'] = 'entityStatus=ENTITY_STATUS_ACTIVE';
        }

        return await this.apiCall(apiCallParams, 'GET');
    }
}