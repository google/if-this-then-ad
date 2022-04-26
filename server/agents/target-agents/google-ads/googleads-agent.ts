import GoogleAdsClient from './googleads-wrapper';
import {
    ActionResult,
    AgentMetadata,
    AgentTask,
    AgentType,
    EntityActions,
    EntityStatus,
    EntityType,
    HttpMethods,
    IAgent,
    InstanceOptions,
    ListRecord
} from './interfaces';
import { config } from './config';

/**
 * Class GoogleAdsAgent
 *
 * Enables use of Google Ads entities as targets for rules.
 */
export default class GoogleAdsAgent implements IAgent {
    public agentId = config.id;
    public name = config.name;

    /**
     * Describes this class' operations to be exposed to the UI.
     * TODO: Correct likely bugs.
     * @returns {Object} - resolved Promise
     */
    public async getAgentMetadata(): Promise<AgentMetadata> {
        const metadata: AgentMetadata = {
            id: config.id,
            name: config.name,
            type: AgentType.TARGET,
            arguments: ['campaignId', 'adGroupId'],
            api: [
                {
                    dataPoint: 'campaignId',
                    list: {
                        url: `/api/agents/${config.id}/list/campaign`,
                        method: HttpMethods.GET,
                        params: {},
                    },
                },
                {
                    dataPoint: 'adgroupId',
                    list: {
                        url: `/api/agents/${config.id}/list/adgroup`,
                        method: HttpMethods.GET,
                        params: { campaignId: String },
                    },
                },
            ],
            dataPoints: [
                {
                    id: 'campaignId',
                    name: 'Campaign',
                    dataType: typeof String,
                },
                {
                    id: 'adgroupId',
                    name: 'AdGroup',
                    dataType: typeof String,
                },
            ],
        };
        return Promise.resolve(metadata);
    }

    // TODO: move to the class AgentTask (first convert interface)
    private getRequiredUserSetting(task: AgentTask, settingName: string) {
        if (
            !task || ! task.ownerSettings || !task.ownerSettings[settingName]
        ) {
            throw new Error(`Owner setting ${settingName} must be defined`);
        }

        return task.ownerSettings[settingName];
    }

    /**
     * Executes all of a task's actions on Google Ads.
     * @param task - the task to execute
     * @returns {Array<ActionResult>} - results of all the task's actions
     */
    public async execute(task: AgentTask):Promise <Array<ActionResult>> {
        const result: Array<ActionResult> = [];
        for (const action of task.target.actions) {
            console.log('ads.execute task', task);
            let instanceOptions = {} as InstanceOptions;
            action.params.forEach((p) => {
                instanceOptions[p.key] = p.value;
            });

            console.log('ads.execute instanceOptions', instanceOptions);

            let googleAds = new GoogleAdsClient(
                this.getRequiredUserSetting(task, 'GOOGLEADS_ACCOUNT_ID'),
                this.getRequiredUserSetting(task, 'GOOGLEADS_MANAGER_ACCOUNT_ID'),
                task.token.auth,
                this.getRequiredUserSetting(task, 'GOOGLEADS_DEV_TOKEN')
            );
            let shouldBeActive = action.type == EntityActions.ACTIVATE && task.target.result;
            console.log('shouldBeActive', shouldBeActive);
            
            try {
                await googleAds.changeStatus(
                    instanceOptions.entityType as EntityType,
                    instanceOptions.entityId as string,
                    shouldBeActive as boolean);
                const tmpResult = {
                    ruleId: task.target.ruleId,
                    agentId: config.id,
                    displayName: '', // TODO: Fill with what?
                    entityStatus: shouldBeActive ? EntityStatus.ACTIVE : EntityStatus.PAUSED,
                    timestamp: new Date(),
                    success: true
                };
                console.log('ads.execute tmpResult', tmpResult);
                result.push(tmpResult);
            } catch (err) {
                console.log('ads.agent Error:', err);
                result.push({
                    ruleId: task.target.ruleId,
                    agentId: config.id,
                    timestamp: new Date(),
                    success: false,
                    error: err as string
                });
            }
        }
        return result;
    }

    /**
     * Obtains a list of Google Ads entities.
     * @param oauthToken - OAuth token authorising this access
     * @param developerToken - developer token to use
     * @param externalCustomerId - Ads account to operate on
     * @param externalManagerCustomerId - Manager account from which to operate
     * @param entityType - type of entity to list
     * @param parentEntityId - ID of the entity whose children are to be listed
     * @param getOnlyActive - true if only enabled entities should be returned (false: all not removed)
     * @returns {Array<ListRecord>} - list of campaigns or ad groups // TODO: Adapt receiving end to object structure.
     */
    public async getEntityList(
        oauthToken: string,
        developerToken: string,
        externalManagerCustomerId: string,
        externalCustomerId: string,
        entityType: string,
        parentEntityId?: string,
        getOnlyActive = false) {
        const googleAds = new GoogleAdsClient(
            externalCustomerId,
            externalManagerCustomerId,
            oauthToken,
            developerToken);
        const result: Array<ListRecord> = [];
        (await googleAds.list(entityType as EntityType, parentEntityId, getOnlyActive)).forEach((o: any) => {
            result.push({
                externalCustomerId: o?.externalCustomerId,
                campaignId: o?.campaignId,
                adGroupId: o?.adGroupId,
                name: o?.name,
                status: o?.status,
            });
        });
        return result;
    }

}