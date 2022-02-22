/**
 * Entity node.
 */
export class EntityNode {
  /**
   *
   * @param {string} id
   * @param {string} name
   * @param {number} level
   * @param {boolean} expandable
   * @param {boolean} selectable
   * @param {boolean} isLoading
   * @param {string} advertiserId
   * @param {string} type
   * @param {EntityNode} children
   */
  constructor(
    public id?: string,
    public name?: string,
    public level: number = 1,
    public expandable: boolean = true,
    public selectable: boolean = true,
    public isLoading: boolean = false,
    public partnerId: string = '',
    public advertiserId: string = '',
    public insertionOrderId: string = '',
    public lineItemId: string = '',
    public type = 'line-item',
    public children?: EntityNode[]
  ) {}

  /**
   * Parse User from JSON Object.
   *
   * @param {any} input
   * @returns {User}
   */
  deserialize(input: any): EntityNode {
    Object.assign(this, input);

    return this;
  }

  /**
   * Parse User from JSON Object.
   *
   * @param {any} input
   * @returns {User}
   */
  static fromJSON(input: any): EntityNode {
    return Object.assign(new EntityNode(), input);
  }
}
