
import { ApiCallParams } from './interfaces';

export interface DV360Entity {
    path: ApiCallParams;
}

export class Partner implements DV360Entity {
    path = {
        url: '/partners',
    };
}

export class Advertiser implements DV360Entity {
    path = {
        url: '/advertisers',
        params: {
            partnerId: '{partnerId}',
        }
    };
}

export class Campaign implements DV360Entity {
    path = {
        url: '/advertisers/{advertiserId}/campaigns',
    };
}

export class InsertionOrder implements DV360Entity {
    path = {
        url: '/advertisers/{advertiserId}/insertionOrders',
    };
}

export class LineItem implements DV360Entity {
    path = {
        url: '/advertisers/{advertiserId}/lineItems',
    };
}
