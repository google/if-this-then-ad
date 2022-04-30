/* eslint-disable require-jsdoc */
import {
  Component,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { faLightbulb as LightBulbOn, faCirclePause } from '@fortawesome/free-solid-svg-icons';
// import { faLightbulb as LightBulbOff } from '@fortawesome/free-regular-svg-icons';

interface AdGroup {
  customerId: string;
  campaignId: string;
  campaignName: string;
  id: string;
  name: string;
  type: string;
  status: string;
}

@Component({
  selector: 'app-googleads-selector',
  templateUrl: './googleads-selector.component.html',
  styleUrls: ['./googleads-selector.component.scss'],
})
export class GoogleAdsSelectorComponent implements AfterViewInit {
  adGroupEnabled = LightBulbOn;
  adGroupDisabled = faCirclePause;
  adGroups: AdGroup[] = [];
  displayedColumns: string[] = ['id', 'name', 'campaignName', 'type', 'status'];
  selectedRows = new Set<AdGroup>();
  dataSource = new MatTableDataSource<any>(this.adGroups);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient) { }


  // eslint-disable-next-line require-jsdoc
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.fetchAccountData();
  }

  selectRow(r: any) {
    console.log(r);
    if (this.selectedRows.has(r)) {
      this.selectedRows.delete(r);
    } else {
      this.selectedRows.add(r);
    }
  }

  private fetchAccountData() {
    this.http
      .get<AdGroup[]>(
        `${environment.apiUrl}/agents/googleads-agent/list/adgroups`
      ).pipe(map((res: AdGroup[]) => res))
      .subscribe((adGroups) => {
        this.adGroups = adGroups;
        this.dataSource.data = this.adGroups;
        this.dataSource.paginator = this.paginator;
      });
  }
}