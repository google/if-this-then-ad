import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Rule } from 'src/app/models/rule.model';

import { store } from 'src/app/store';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {
  rules: Rule[] = [];
  displayedColumns: string[] = ['name', 'source', 'type', 'comparator', 'value', 'interval', 'actions'];
  dataSource = new MatTableDataSource<any>(this.rules);
  comparatorMapping: {} = {
    gt: 'Greater Than',
    lt: 'Lower Than',
    eq: 'Equal',
    yes: 'Yes',
    no: 'No',
  };
  // TODO: remove this!
  user: string = 'YrqYQc15jFYutbMdZNss';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient) {
    // Reload rules when rule was added
    store.ruleAdded.subscribe(v => { 
      this.loadRules();
    });

    this.loadRules();
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Fetch all rules.
   */
  loadRules() {
    this.http.get<Array<Rule>>(`${environment.apiUrl}/rules`)
    .pipe(map((res: Array<Rule>) => res))
    .subscribe(result => {
      this.rules = result;

      this.dataSource.data = this.rules;
      this.dataSource.paginator = this.paginator;
    });
  }

  /**
   * Get UI friendly comparator name.
   *
   * @param {string} comparator
   * @returns {string}
   */
  getComparatorUi(comparator: string): string {
    // @ts-ignore
    return this.comparatorMapping[comparator];
  }

  /**
   * Delete rule.
   * 
   * @param {Rule} rule
   */
  removeRule(rule: Rule) {
    this.http.delete(`${environment.apiUrl}/rules/${this.user}/${rule.id}`)
    .subscribe(_ => {
      // Reload rules
      this.loadRules();
    });
  }
}
