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

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-triggers',
  templateUrl: './triggers.component.html',
  styleUrls: ['./triggers.component.scss']
})
export class TriggersComponent implements OnInit, AfterViewInit {
  types = [
    {
      value: 'temp',
      uiValue: 'Temperature',
    },
  ];

  triggers = [] as Trigger[];

  sources = [
    {
      value: 'weather',
      uiValue: 'Weather',
    },
  ];

  displayedColumns: string[] = ['name', 'type', 'condition', 'value'];
  dataSource = new MatTableDataSource<any>(this.triggers);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor() { }

  ngOnInit(): void {
  }

  addTrigger(form: any) {
    console.log(form);
    console.log(form.value);

    this.triggers.push({
      name: form.value['trigger-name'],
      type: form.value['trigger-type'],
      condition: form.value['trigger-condition'],
      value: form.value['trigger-value'],
    });

    console.log(this.triggers);

    this.dataSource.data = this.triggers;
    this.dataSource.paginator = this.paginator;
  }
}

export interface Trigger {
  name: string;
  type: string;
  condition: string;
  value: string|number;
}