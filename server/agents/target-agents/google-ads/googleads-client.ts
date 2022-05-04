import {
    AdGroup,
    EntityStatus,
    HttpMethods,
    AdGroupOperation,
    MutateOperation,
    AdGroupObject
} from './interfaces';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { log } from '@iftta/util';
import { config } from './config';

/**
 * Class GoogleAdsClient
 *
 * Facilitates calls to the Google Ads API.
 */
export default class GoogleAdsClient {

    /**
     * @param customerAccountId - Ads account to operate on
     * @param managerAccountId - Manager account from which to operate
     * @param oauthToken - OAuth token authorising this access
     * @param developerToken - developer token to use
     */
    constructor(
        private customerAccountId: string,
        private managerAccountId: string,
        private oauthToken: string,
        private developerToken: string,
    ) {
        if (!oauthToken || !customerAccountId || !managerAccountId || !developerToken) {
            throw new Error('Incomplete configuration for Google Ads API.');
        }
    }

    /**
     * Makes a call to the Google Ads API
     * @param options - options for HTTP call
     * @param httpMethod - HTTP method to use
     * @returns {Object} - API response
     */
    private async apiCall(options: AxiosRequestConfig, httpMethod: Method = HttpMethods.POST): Promise<any> {
        options.headers = {
            'developer-token': this.developerToken,
            'login-customer-id': parseInt(this.managerAccountId),
            'Authorization': `Bearer ${this.oauthToken}`,
        };
        options.method = httpMethod;
        try {
            const result = await axios(options);
            if (result.status == 200) {
                return result.data;
            }
            return Promise.reject(result.statusText);
        } catch (err) {
            console.error(err);
            return Promise.reject(err);
        }
    }

    /**
     * Sends HTTP request to Google Ads api.
     * and returns the query result.
     * @param {string} query 
     * @returns {Promise<any>} http result
     */
    private async queryAdsApi(query): Promise<any> {

        return this.apiCall({
            url: `${config.baseUrl}/customers/${this.customerAccountId}/googleAds:search`,
            data: { 'query': query }
        }, HttpMethods.POST);
    }

    /**
     * Composes Update Object to send to Ads Api
     * @param {string} entityId AdGroup Id
     * @param { string } updateMask 
     * @param { field object } field Object to update
     * @returns 
     */
    private makeUpdateOperation(entityId: string, updateMask: string, field: {}): MutateOperation {
        const adGroup: AdGroupObject = {
            resourceName: `customers/${this.customerAccountId}/adGroups/${entityId}`,
            ...field
        }
        const updateOperation: AdGroupOperation = {
            updateMask: updateMask,
            update: adGroup
        }
        return {
            operations: [updateOperation]
        }
    }

    /**
     * Updates the AdGroup
     * @param { string } entityId AdGroup Id
     * @param { boolean } activate 
     * @returns 
     */
    public async updateAdGroup(
        entityId: string,
        activate: boolean): Promise<any> {

        const _data = this.makeUpdateOperation(entityId, 'status', { 'status': activate ? EntityStatus.ACTIVE : EntityStatus.PAUSED })
        return this.apiCall({
            url: `${config.baseUrl}/customers/${this.customerAccountId}/adGroups:mutate`,
            data: _data
        }, HttpMethods.POST);
    }

    /**
     * Fetches available Ad Groups from the customer account.
     * @param { boolean } active
     * @returns { Promise<AdGroup[]> } Array of AdGroups
     */
    public async listAdGroups(active: boolean = false): Promise<AdGroup[]> {
        let query = `SELECT ad_group.name,
                        campaign.id,
                        campaign.name,
                        ad_group.id,
                        ad_group.name,
                        ad_group.status,
                        ad_group.type
                    FROM ad_group
                    WHERE ad_group.status != 'REMOVED'`;
        if (active) {
            query += ` AND campaign.status = 'ENABLED' AND ad_group.status = 'ENABLED'`;
        }
        try {
            const httpResult = await this.queryAdsApi(query);
            return httpResult.results.map((res) => {
                const adGroup: AdGroup = {
                    customerId: this.customerAccountId,
                    campaignId: res.campaign.id,
                    campaignName: res.campaign.name,
                    id: res.adGroup.id,
                    name: res.adGroup.name,
                    type: res.adGroup.type,
                    status: res.adGroup.status,
                }
                return adGroup;
            });
        } catch (err) {
            log.error(err);
            return Promise.reject(err);
        }
    }

    public async getAdGroupById(id: string):Promise<AdGroup> {
            let query = `SELECT ad_group.name,
                            campaign.id,
                            campaign.name,
                            ad_group.name,
                            ad_group.id,
                            ad_group.status,
                            ad_group.type
                        FROM ad_group
                        WHERE ad_group.status != 'REMOVED' AND ad_group.id =${id}`;
            
            try {
                const httpResult = await this.queryAdsApi(query);
                return httpResult.results.map((res) => {
                    const adGroup: AdGroup = {
                        customerId: this.customerAccountId,
                        campaignId: res.campaign.id,
                        campaignName: res.campaign.name,
                        id: res.adGroup.id,
                        name: res.adGroup.name,
                        type: res.adGroup.type,
                        status: res.adGroup.status,
                    }
                    return adGroup;
                });
            } catch (err) {
                log.error(err);
                return Promise.reject(err);
            }
    }
}
