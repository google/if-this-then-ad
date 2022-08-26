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

import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { TargetEntity } from '../interfaces/target';
import { AgentsService } from '../services/agents.service';
import { TargetEntityTreeNode } from './entity-node.model';

const ENTITY_TYPES: Record<
  string,
  { childType?: string; expandable: boolean; selectable: boolean }
> = {
  dv360: { childType: 'partner', expandable: true, selectable: false },
  partner: { childType: 'advertiser', expandable: true, selectable: false },
  advertiser: { childType: 'campaign', expandable: true, selectable: false },
  campaign: { childType: 'insertionOrder', expandable: true, selectable: true },
  insertionOrder: { childType: 'lineItem', expandable: true, selectable: true },
  lineItem: { expandable: true, selectable: true },
};

@Injectable({ providedIn: 'root' })
/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
export class DynamicDatabase {
  /**
   * Constructor.
   *
   * @param {HttpClient} http
   */
  constructor(private agents: AgentsService) {}

  /**
   * Initial data from database.
   *
   * @returns {TargetEntityTreeNode[]}
   */
  initialData(): TargetEntityTreeNode[] {
    const root = new TargetEntityTreeNode('dv360', 'DV360', 0, true);
    root.type = 'dv360';
    return [root];
  }

  /**
   * Derive ID from entity.
   *
   * @param {TargetEntityTreeNode} entity
   * @returns {string}
   */
  getEntityId(entity: TargetEntityTreeNode): string {
    switch (entity.type) {
      case 'lineItem':
        return entity.parameters['lineItemId'];
      case 'insertionOrder':
        return entity.parameters['insertionOrderId'];
      case 'campaign':
        return entity.parameters['campaignId'];
      case 'advertiser':
        return entity.parameters['advertiserId'];
      case 'partner':
        return entity.parameters['partnerId'];
      default:
        throw new Error(`Unknown entity type: ${entity.type}`);
    }
  }

  /**
   * Get node children.
   *
   * @param {TargetEntityTreeNode} node
   * @returns {Promise<TargetEntityTreeNode[] | undefined>}
   */
  getChildren(
    node: TargetEntityTreeNode
  ): Promise<TargetEntityTreeNode[] | undefined> {
    const agentId = 'dv360';
    const entityType = ENTITY_TYPES[node.type].childType;
    if (!entityType) {
      return Promise.resolve(undefined);
    }

    const params = node.parameters;

    // Build request URL
    const url = `agents/${agentId}/list/${entityType}`;

    // Build cache key
    const hash = btoa(`${url}-${JSON.stringify(params)}`);

    // Fetch children from cache if available
    if (localStorage.getItem(hash)) {
      return new Promise((resolve) => {
        const children = JSON.parse(localStorage.getItem(hash)!);
        resolve(children);
      });
    }

    // Fetch children from server
    return new Promise((resolve, reject) => {
      this.agents
        .fetchTargetEntities(agentId, entityType, params)
        .pipe(
          map((targetEntities) => {
            return targetEntities?.map((entity) =>
              this.parseEntity(entity, node)
            );
          }),
          tap((targetNodes) => {
            localStorage.setItem(hash, JSON.stringify(targetNodes));
          })
        )
        .subscribe({ next: resolve, error: reject });
    });
  }

  /**
   * Parse entity from JSON to proper model.
   *
   * @param {TargetEntity} entity
   * @param {TargetEntityTreeNode} parent
   * @returns {TargetEntityTreeNode}
   */
  parseEntity(entity: TargetEntity, parent: TargetEntityTreeNode) {
    const child = TargetEntityTreeNode.fromJSON(entity);
    child.id = this.getEntityId(child);
    child.level = parent.level + 1;
    child.selectable = ENTITY_TYPES[child.type].selectable;
    child.expandable = ENTITY_TYPES[child.type].expandable;

    return child;
  }

  /**
   * Check if node is expandable.
   *
   * @param {TargetEntityTreeNode} node
   * @returns {boolean}
   */
  isExpandable(node: TargetEntityTreeNode): boolean {
    return node.expandable;
  }
}
