
import { ApiCallParams } from './interfaces';

export interface DV360Entity {
    listPath: ApiCallParams;
}

export class Partner implements DV360Entity {
    listPath = {
        url: '/partners',
    };
}

export class Advertiser implements DV360Entity {
    listPath = {
        url: '/advertisers',
        params: {
            partnerId: 'parentId',
        }
    };
}

export class Campaign implements DV360Entity {
    listPath = {
        url: '/advertisers',
        params: {
            partnerId: 'parentId',
        }
    };
}

export class InsertionOrder implements DV360Entity {
    listPath = {
        url: '/advertisers',
        params: {
            partnerId: 'parentId',
        }
    };
}

export class LineItem implements DV360Entity {
    listPath = {
        url: '/advertisers',
        params: {
            partnerId: 'parentId',
        }
    };
}
