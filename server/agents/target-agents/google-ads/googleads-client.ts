import {
    AdCampaign,
    AdGroup,
    EntityStatus,
    EntityType,
    HttpMethods,
    ListRecord,
    AdGroupOperation,
    MutateOperation,
    AdGroupObject
} from './interfaces';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { config } from './config';

/**
 * Class GoogleAdsWrapper
 *
 * Facilitates calls to the Google Ads API.
 */
export default class GoogleAdsClient {

    /**
     * @param customerId - Ads account to operate on
     * @param managerId - Manager account from which to operate
     * @param oauthToken - OAuth token authorising this access
     * @param developerToken - developer token to use
     */
    constructor(
        private customerId: string,
        private managerId: string,
        private oauthToken: string,
        private developerToken: string,
    ) {
        if (!oauthToken || !customerId || !managerId || !developerToken) {
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
            'login-customer-id': parseInt(this.managerId),
            'Authorization': `Bearer ${this.oauthToken}`,
        };
        options.method = httpMethod;
        try {
            const result = await axios(options);
            return result.data;
        } catch (err) {
            console.error(err);
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
            url: `${config.baseUrl}/customers/${this.customerId}/googleAds:search`,
            data: { 'query': query }
        }, HttpMethods.POST);
    }

    private makeUpdateOperation(entityId: string, updateMask: string, field: {}): MutateOperation {
        const adGroup: AdGroupObject = {
            resourceName: `customers/${this.customerId}/adGroups/${entityId}`,
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

    public async updateAdGroup(
        entityId: string,
        activate: boolean): Promise<any> {

        const _data = this.makeUpdateOperation(entityId, 'status', { 'status': activate ? EntityStatus.ACTIVE : EntityStatus.PAUSED })
        console.log(JSON.stringify(_data, null, 2));
        return this.apiCall({
            url: `${config.baseUrl}/customers/${this.customerId}/adGroups:mutate`,
            data: _data
        }, HttpMethods.POST);
    }



    /**
     * Fetches available Ad Groups from the customer account.
     */
    public async listAdGroups(active: boolean = false) {
        let query = `SELECT ad_group.name,
                        campaign.id,
                        campaign.name,
                        ad_group.id,
                        ad_group.status,
                        ad_group.type
                    FROM ad_group
                    WHERE ad_group.status != 'REMOVED'`;
        if (active) {
            query += ` AND campaign.status = 'ENABLED' AND ad_group.status = 'ENABLED'`;
        }
        const httpResult = await this.queryAdsApi(query);
        return httpResult.results.map((res) => {
            const adGroup: AdGroup = {
                customerId: this.customerId,
                campaignId: res.campaign.id,
                adGroupId: res.adGroup.id,
                name: res.adGroup.name,
                adGroupType: res.adGroup.type,
                status: res.adGroup.status,
            }
            return adGroup;
        });
    }

    /**
     * Fetches a list of campaigns
     * @param {boolean} active flag to filter active campaigns
     * @returns 
     */
    public async listCampaigns(active: boolean = false): Promise<Array<AdCampaign>> {

        let query = `SELECT campaign.id, campaign.name, campaign.labels, campaign.status
                        FROM campaign
                        WHERE campaign.status != 'REMOVED'`;
        if (active) {
            query += ` AND campaign.status = 'ENABLED'`;
        }

        const httpResult = await this.queryAdsApi(query);

        return httpResult.results.map((res) => {
            const adCampaign: AdCampaign = {
                customerId: this.customerId,
                campaignId: res.campaign.id,
                name: res.campaign.name,
                status: res.campaign.status,
            }
            return adCampaign;
        });
    }
}
