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