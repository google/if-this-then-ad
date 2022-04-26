import { Component, OnInit } from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

/**
 * Account data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface AccountNode {
  name: string;
  children?: AccountNode[];
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

const TREE_DATA: AccountNode[] = [
  {
    name: 'Google Ads',
    children: [
      {name: 'Animals in space', children: [{ name: 'Test' }]},
      {name: 'My test account', children: [{ name: 'Test' }]}, 
      {name: 'MCC #1', children: [{ name: 'Test' }]}
    ],
  },
];

@Component({
  selector: 'app-googleads-selector',
  templateUrl: './googleads-selector.component.html',
  styleUrls: ['./googleads-selector.component.scss']
})
export class GoogleAdsSelectorComponent {
  private _transformer = (node: AccountNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
}