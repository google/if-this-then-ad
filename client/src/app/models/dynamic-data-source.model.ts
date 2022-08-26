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

import {
  CollectionViewer,
  DataSource,
  SelectionChange,
} from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DynamicDatabase } from './dynamic-database.model';
import { TargetEntityTreeNode } from './entity-node.model';

/**
 * Dynamic data source.
 */
export class DynamicDataSource implements DataSource<TargetEntityTreeNode> {
  dataChange = new BehaviorSubject<TargetEntityTreeNode[]>([]);

  /**
   * Getter function for data.
   *
   * @returns {TargetEntityTreeNode[]}
   */
  get data(): TargetEntityTreeNode[] {
    return this.dataChange.value;
  }

  /**
   * Setter function for data.
   *
   * @param {TargetEntityTreeNode[]} value
   */
  set data(value: TargetEntityTreeNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  /**
   *
   * @param {FlatTreeControl<TargetEntityTreeNode>} _treeControl
   * @param {DynamicDatabase} _database
   */
  constructor(
    private _treeControl: FlatTreeControl<TargetEntityTreeNode>,
    private _database: DynamicDatabase
  ) {}

  /**
   * Connect.
   *
   * @param {CollectionViewer} collectionViewer
   * @returns {Observable<TargetEntityTreeNode[]>}
   */
  connect(
    collectionViewer: CollectionViewer
  ): Observable<TargetEntityTreeNode[]> {
    this._treeControl.expansionModel.changed.subscribe((change) => {
      if (
        (change as SelectionChange<TargetEntityTreeNode>).added ||
        (change as SelectionChange<TargetEntityTreeNode>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<TargetEntityTreeNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this.data)
    );
  }

  /**
   * Disconnect.
   *
   * @param {CollectionViewer} collectionViewer
   */
  disconnect(collectionViewer: CollectionViewer): void {}

  /**
   * Handle expand/collapse behaviors
   *
   * @param {SelectionChange<TargetEntityTreeNode>} change
   */
  handleTreeControl(change: SelectionChange<TargetEntityTreeNode>) {
    if (change.added) {
      change.added.forEach((node) => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach((node) => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle node expansion, remove from display list
   *
   * @param {TargetEntityTreeNode} node
   * @param {boolean} expand
   * @returns {Promise<void>}
   */
  async toggleNode(node: TargetEntityTreeNode, expand: boolean): Promise<void> {
    if (!node.expandable) {
      return;
    }

    // Set node to loading
    node.isLoading = true;

    // Get child nodes
    try {
      const children = await this._database.getChildren(node);
      const index = this.data.indexOf(node);

      if (!children || index < 0) {
        node.expandable = false;
        node.children = null;
        // If no children, or cannot find the node, no op
        return;
      }

      if (expand) {
        this.data.splice(index + 1, 0, ...children);
      } else {
        let count = 0;
        for (
          let i = index + 1;
          i < this.data.length && this.data[i].level > node.level;
          i++, count++
        ) {}
        this.data.splice(index + 1, count);
      }

      // Notify the change
      this.dataChange.next(this.data);
    } catch (err) {
      console.error('Error loading children', err);
      return;
    } finally {
      node.isLoading = false;
    }
  }
}
