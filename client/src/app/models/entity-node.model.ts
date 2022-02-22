/**
    Copyright 2022 Google LLC
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        https://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

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
    public expandable: boolean = false,
    public selectable: boolean = false,
    public isLoading: boolean = false,
    public partnerId: string = '',
    public advertiserId: string = '',
    public insertionOrderId: string = '',
    public lineItemId: string = '',
    public type: string = '',
    public children: EntityNode[] | null = null
  ) {}

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
