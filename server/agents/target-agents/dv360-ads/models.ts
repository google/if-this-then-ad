
export interface DV360Entity {
    apiUrlPart: string;
}

export class InsertionOrder implements DV360Entity {
    apiUrlPart = 'insertionOrders';
}

export class LineItem implements DV360Entity {
    apiUrlPart = 'lineItems';
}