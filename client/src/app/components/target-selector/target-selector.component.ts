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

import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import { TargetAgent } from 'src/app/interfaces/target-agent';

import { DynamicDataSource } from 'src/app/models/dynamic-data-source.model';
import { DynamicDatabase } from 'src/app/models/dynamic-database.model';
import { EntityNode } from 'src/app/models/entity-node.model';
import { store } from 'src/app/store';

/**
 * @title Tree with dynamic data
 */
@Component({
  selector: 'app-target-selector',
  templateUrl: './target-selector.component.html',
  styleUrls: ['./target-selector.component.scss'],
})

/**
 * Target Selector component.
 */
export class TargetSelectorComponent {
  treeControl: FlatTreeControl<EntityNode>;
  dataSource: DynamicDataSource;
  allowSelectionBubbling: boolean = false;

  // The selection for checklist
  checklistSelection = new SelectionModel<EntityNode>(true /* multiple */);

  /**
   * Constructor.
   *
   * @param {DynamicDatabase} database
   */
  constructor(private database: DynamicDatabase) {
    this.treeControl = new FlatTreeControl<EntityNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new DynamicDataSource(this.treeControl, database);

    // Initialize data source
    this.init();

    store.ruleAdded.subscribe((added) => {
      this.init();
    });
  }

  /**
   * Initialize data source.
   */
  init(): void {
    this.dataSource.data = this.database.initialData();
  }

  /**
   * Get node level.
   *
   * @param {EntityNode} node
   * @returns {number}
   */
  getLevel(node: EntityNode): number {
    return node.level;
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

  /**
   * Check if node has children.
   *
   * @param {number} _
   * @param {EntityNode} _nodeData
   * @returns {boolean}
   */
  hasChild(_: number, _nodeData: EntityNode): boolean {
    return _nodeData.expandable;
  }

  /**
   * Check whether all the descendants of the node are selected.
   *
   * @param {EntityNode} node
   * @returns {boolean}
   */
  descendantsAllSelected(node: EntityNode): boolean {
    const descendants = this.treeControl.getDescendants(node);

    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });

    return descAllSelected;
  }

  /**
   * Check whether part of the descendants are selected
   *
   * @param {EntityNode} node
   * @returns {boolean}
   */
  descendantsPartiallySelected(node: EntityNode): boolean {
    if (this.allowSelectionBubbling) {
      const descendants = this.treeControl.getDescendants(node);
      const result = descendants.some((child) =>
        this.checklistSelection.isSelected(child)
      );

      return result && !this.descendantsAllSelected(node);
    }

    return false;
  }

  /**
   * Toggle the entity selection.
   * Select/deselect all the descendants node
   *
   * @param {EntityNode} node
   */
  entitySelectionToggle(node: EntityNode): void {
    this.checklistSelection.toggle(node);

    if (this.allowSelectionBubbling) {
      const descendants = this.treeControl.getDescendants(node);

      this.checklistSelection.isSelected(node)
        ? this.checklistSelection.select(...descendants)
        : this.checklistSelection.deselect(...descendants);

      // Force update for the parent
      descendants.forEach((child) => this.checklistSelection.isSelected(child));
      this.checkAllParentsSelection(node);
    }

    // Publish selection change to store
    this.publishSelectionChange();
  }

  /**
   * Publish selection change to store.
   */
  publishSelectionChange() {
    store.addTarget(this.entityToTargetAgent(this.checklistSelection.selected));

    // Update save requirements
    const valid = this.checkAllParentsSelection.length > 0;
    store.saveRequirements.next({
      ...store.saveRequirements.value,
      ...{ target: valid },
    });
  }

  /**
   * Toggle a leaf entity selection.
   * Check all the parents to see if they changed
   *
   * @param {EntityNode} node
   */
  entityLeafItemSelectionToggle(node: EntityNode): void {
    this.checklistSelection.toggle(node);

    if (this.allowSelectionBubbling) {
      this.checkAllParentsSelection(node);
    }

    // Publish selection change to all components
    this.publishSelectionChange();
  }

  /**
   * Check if node is selected.
   *
   * @param {EntityNode} node
   * @returns {boolean}
   */
  isSelected(node: EntityNode): boolean {
    const selected = this.checklistSelection.isSelected(node);
    return selected;
  }

  /**
   * Transform entities to Target Agent.
   *
   * @param {EntityNode[]} nodes
   * @returns {TargetAgent}
   */
  entityToTargetAgent(nodes: EntityNode[]): TargetAgent {
    return {
      agentId: 'dv360-agent',
      actions: nodes.map((node) => {
        return {
          type: 'activate',
          params: [
            {
              key: 'entityId',
              value: node.id,
            },
            {
              key: 'parentId',
              value: node.advertiserId,
            },
            {
              key: 'entityType',
              value: node.type,
            },
          ],
        };
      }),
    };
  }

  /**
   * Checks all the parents when a leaf node is selected/unselected.
   *
   * @param {EntityNode} node
   */
  checkAllParentsSelection(node: EntityNode): void {
    let parent: EntityNode | null = this.getParentNode(node);

    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /**
   * Check root node checked state and change it accordingly.
   *
   * @param {EntityNode} node
   */
  checkRootNodeSelection(node: EntityNode): void {
    if (!node.selectable) {
      return;
    }

    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });

    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /**
   * Get the parent node of a node.
   *
   * @param {EntityNode} node
   * @returns {EntityNode | null}
   */
  getParentNode(node: EntityNode): EntityNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }
}
