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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EntityNode } from './entity-node.model';

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
  constructor(private http: HttpClient) {}

  /**
   * Initial data from database.
   *
   * @returns {EntityNode[]}
   */
  initialData(): EntityNode[] {
    return [new EntityNode('root', 'DV360', 0, true)];
  }

  /**
   * Get type from entity.
   *
   * @param {EntityNode} entity
   * @returns {string}
   */
  getEntityType(entity: EntityNode): string {
    if (entity.lineItemId) {
      return 'lineItem';
    } else if (entity.insertionOrderId) {
      return 'insertionOrder';
    } else if (entity.advertiserId) {
      return 'advertiser';
    } else {
      return 'partner';
    }
  }

  /**
   * Derive ID from entity.
   *
   * @param {EntityNode} entity
   * @returns {string}
   */
  getEntityId(entity: EntityNode): string {
    if (entity.lineItemId) {
      return entity.lineItemId;
    } else if (entity.insertionOrderId) {
      return entity.insertionOrderId;
    } else if (entity.advertiserId) {
      return entity.advertiserId;
    } else {
      return entity.partnerId;
    }
  }

  /**
   * Get node children.
   *
   * @param {EntityNode} node
   * @returns {Promise<EntityNode[] | undefined>}
   */
  getChildren(node: EntityNode): Promise<EntityNode[] | undefined> {
    const agent = 'dv360-agent';
    const method = 'list';
    let childEntityType = 'partner';
    const params = {
      partnerId: node.partnerId,
      advertiserId: node.advertiserId,
      insertionOrderId: node.insertionOrderId,
    };

    if (node.insertionOrderId) {
      childEntityType = 'lineItem';
    } else if (node.advertiserId) {
      childEntityType = 'insertionOrder';
    } else if (node.partnerId) {
      childEntityType = 'advertiser';
    }

    // Build request URL
    const url = `agents/${agent}/${method}/${childEntityType}`;

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
      this.http
        .get<Array<EntityNode>>(`${environment.apiUrl}/${url}`, {
          params,
        })
        .pipe(
          map((data) => {
            return data.map((entity) => {
              return this.parseEntity(entity, node);
            });
          })
        )
        .subscribe({
          next: (result) => {
            // Store children in cache
            localStorage.setItem(hash, JSON.stringify(result));
            resolve(result);
          },
          error: (err) => {
            reject(err);
          },
        });
    });
  }

  /**
   * Parse entity from JSON to proper model.
   *
   * @param {object} entity
   * @param {EntityNode} parent
   * @returns {EntityNode}
   */
  parseEntity(entity: object, parent: EntityNode) {
    const child = EntityNode.fromJSON(entity);
    child.id = this.getEntityId(child);
    child.level = parent.level + 1;
    child.type = this.getEntityType(child);
    child.selectable = !!(child.insertionOrderId || child.lineItemId);
    child.expandable = child.lineItemId === null;
    return child;
  }

  /**
   * Check if node is expandable.
   *
   * @param {EntityNode} node
   * @returns {boolean}
   */
  isExpandable(node: EntityNode): boolean {
    return node.expandable;
  }
}
