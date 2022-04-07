import {
    EntityStatus,
    EntityType,
    HttpMethods,
    ListRecord
} from './interfaces';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { config } from './config';

/**
 * Class GoogleAdsWrapper
 *
 * Facilitates calls to the Google Ads API.
 */
export default class GoogleAdsWrapper {

    /**
     * @param externalCustomerId - Ads account to operate on
     * @param externalManagerCustomerId - Manager account from which to operate
     * @param oauthToken - OAuth token authorising this access
     * @param developerToken - developer token to use
     */
    constructor(
        private externalCustomerId: string,
        private externalManagerCustomerId: string,
        private oauthToken: string,
        private developerToken: string,
    ) {
        if (!oauthToken || !externalCustomerId || !externalManagerCustomerId || !developerToken) {
            throw new Error('Incomplete configuration for Google Ads API.');
        }
    }

    /**
     * Makes a call to the Google Ads API
     * @param options - options for HTTP call
     * @param httpMethod - HTTP method to use
     * @returns {Object} - API response
     */
      private async apiCall(options: AxiosRequestConfig, httpMethod: Method = HttpMethods.POST) {
        options.headers = {
            'developer-token': this.developerToken,
            'login-customer-id': parseInt(this.externalManagerCustomerId),
            'Authorization': `Bearer ${this.oauthToken}`,
        };
        options.method = httpMethod;
        const result = await axios(options);
        return result.data;
    }

    /**
     * Toggles a campaign's or adgroup's status between active and paused
     * @param entityType - type of entity whose status should be changed
     * @param entityId - ID of the entity whose status should be changed
     * @param shouldBeActive - true if entity should be active, false if paused
     * @returns {Object} - API response
     */
    public async changeStatus(entityType: EntityType, entityId: string, shouldBeActive: Boolean) {
        let operationName: string;
        let resourcePathComponent: string;
        switch (entityType) {
            case EntityType.campaign:
                operationName = 'campaignOperation';
                resourcePathComponent = 'campaigns';
                break;
            case EntityType.adGroup:
                operationName = 'adGroupOperation';
                resourcePathComponent = 'adGroups';
                break;
            default:
                throw new Error('Unsupported entity type requested to be modified.');
        }
        return await this.apiCall({
            url: `${config.baseUrl}/customers/${this.externalCustomerId}/googleAds:mutate`,
            data: {
                'mutateOperations': {
                    [operationName]: {
                        'updateMask': 'status',
                        'update': {
                            'resourceName': `/customers/${this.externalCustomerId}/${resourcePathComponent}/${entityId}`,
                            'status': shouldBeActive ? EntityStatus.ACTIVE : EntityStatus.PAUSED,
                        }
                    }
                }
            }
        }, 'post');
    }

    /**
     * Lists campaigns or ad groups.
     * @param entityType - type of entity to list
     * @param parentEntityId - ID of the entity whose children are to be listed
     * @param getOnlyActive - true if only enabled entities should be returned (false: all not removed)
     * @returns {Array<ListRecord>} - API response
     */
    public async list(entityType: EntityType, parentEntityId?: string, getOnlyActive = false) {
        let query: string;
        switch (entityType) {
            case EntityType.campaign:
                query = `SELECT campaign.id, campaign.name, campaign.labels, campaign.status
                        FROM campaign
                        WHERE campaign.status != 'REMOVED'`;
                if (getOnlyActive) {
                    query += ` AND campaign.status = 'ENABLED'`;
                }
                break;
            case EntityType.adGroup:
                query = `SELECT ad_group.id, ad_group.name, ad_group.labels, ad_group.status, campaign.id
                        FROM ad_group
                        WHERE ad_group.status != \'REMOVED\' AND campaign.id = ${parentEntityId}`;
                if (getOnlyActive) {
                    query += ` AND campaign.status = 'ENABLED' AND ad_group.status = 'ENABLED'`;
                }
                break;
            default:
                throw new Error('Unsupported entity type requested to be listed.');
        }
        // TODO: Add paging in case 10k+ results may be expected.
        let result = await this.apiCall({
                url: `${config.baseUrl}/customers/${this.externalCustomerId}/googleAds:search`,
                data: { 'query': query }
            }, 'post');
        let formattedResult: Array<ListRecord>;
        switch (entityType) {
            case EntityType.campaign:
                formattedResult = result.results?.map(e => {
                    return {
                        'externalCustomerId': this.externalCustomerId,
                        'campaignId': e.campaign.id,
                        'name': e.campaign.name,
                        'status': e.campaign.status
                    };
                }) || [];
                break;
            case EntityType.adGroup:
                formattedResult = result.results?.map(e => {
                    return {
                        'externalCustomerId': this.externalCustomerId,
                        'campaignId': e.campaign.id,
                        'adGroupId': e.adGroup.id,
                        'name': e.adGroup.name,
                        'status': e.adGroup.status
                    };
                });
                break;
        };
        return formattedResult || [];
    }
}
