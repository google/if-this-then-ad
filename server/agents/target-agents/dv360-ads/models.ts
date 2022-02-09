import { StringMappingType } from 'typescript';
import { ApiCallParams } from './interfaces';

export interface DV360Entity {
    apiConfig: ApiCallParams;
    listName: string;
}

export class Partner implements DV360Entity {
    apiConfig = {
        url: '/partners',
    };
    listName = 'partners';
}

export class Advertiser implements DV360Entity {
    apiConfig = {
        url: '/advertisers',
        params: {
            partnerId: '{partnerId}',
        },
    };
    listName = 'advertisers';
}

export class Campaign implements DV360Entity {
    apiConfig = {
        url: '/advertisers/{advertiserId}/campaigns',
    };
    listName = 'campaigns';
}

export class InsertionOrder implements DV360Entity {
    apiConfig = {
        url: '/advertisers/{advertiserId}/insertionOrders',
    };
    listName = 'insertionOrders';
}

export class LineItem implements DV360Entity {
    apiConfig = {
        url: '/advertisers/{advertiserId}/lineItems',
    };
    listName = 'lineItems';
}
