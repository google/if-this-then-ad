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

import { AgentParameters } from '../interfaces/common';

/**
 * Entity node.
 */
export class TargetEntityTreeNode {
  /**
   *
   * @param {string} id
   * @param {string} name
   * @param {number} level
   * @param {boolean} expandable
   * @param {boolean} selectable
   * @param {boolean} isLoading
   * @param {Record<string, unknown>} parameters
   * @param {string} type
   * @param {TargetEntityTreeNode} children
   */
  constructor(
    public id?: string,
    public name?: string,
    public level: number = 1,
    public expandable: boolean = false,
    public selectable: boolean = false,
    public isLoading: boolean = false,
    public type: string = '',
    public parameters: AgentParameters = {},
    public children: TargetEntityTreeNode[] | null = null
  ) {}

  /**
   * Parse User from JSON Object.
   *
   * @param {any} input
   * @returns {User}
   */
  static fromJSON(input: any): TargetEntityTreeNode {
    return Object.assign(new TargetEntityTreeNode(), input);
  }
}
