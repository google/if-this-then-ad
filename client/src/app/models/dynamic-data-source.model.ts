import { CollectionViewer, SelectionChange, DataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export class EntityNode {
  constructor(
    public id: string,
    public name: string,
    public level: number = 1,
    public expandable: boolean = true,
    public isLoading: boolean = false,
    public advertiserId = '123',
    public type = 'line-item',
    public children?: EntityNode[],
  ) {}
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable({providedIn: 'root'})
export class DynamicDatabase {
  constructor(private http: HttpClient) {}

  /** Initial data from database */
  initialData(): EntityNode[] {
    return [new EntityNode('root', 'DV360', 0, true)];
  }

  getChildren(node: EntityNode): Promise<EntityNode[] | undefined> {
    return new Promise((resolve, reject) => {
      this.http.get<Array<EntityNode>>(`${environment.apiUrl}/agents/dv360/fetch`, {params: {level: node.level}})
      .pipe(map(data => {
        return data.map(entity => {
          const e = new EntityNode(entity.id, entity.name, node.level + 1, true);
          console.log(e);
          return e;
        })
      })).subscribe(result => {
        console.log('resolving', result);
        resolve(result);
      });
    })
  }
 
  isExpandable(node: string): boolean {
    return true;
  }
}

export class DynamicDataSource implements DataSource<EntityNode> {
  dataChange = new BehaviorSubject<EntityNode[]>([]);

  get data(): EntityNode[] {
    return this.dataChange.value;
  }

  set data(value: EntityNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<EntityNode>,
    private _database: DynamicDatabase,
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<EntityNode[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
      if (
        (change as SelectionChange<EntityNode>).added ||
        (change as SelectionChange<EntityNode>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<EntityNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  /**
   * Handle expand/collapse behaviors
   * 
   * @param {SelectionChange<EntityNode>} change
   */
  handleTreeControl(change: SelectionChange<EntityNode>) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach(node => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   *
   * @param {EntityNode} node
   * @param {boolean} expand
   * @returns {Promise<void>}
   */
  async toggleNode(node: EntityNode, expand: boolean): Promise<void> {
    const children = await this._database.getChildren(node);
    const index = this.data.indexOf(node);

    if (!children || index < 0) {
      // If no children, or cannot find the node, no op
      return;
    }

    node.isLoading = true;

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
    node.isLoading = false;
  }
}