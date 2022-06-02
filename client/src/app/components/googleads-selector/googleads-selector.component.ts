import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { faCircle, faCirclePause } from '@fortawesome/free-solid-svg-icons';
import { store } from 'src/app/store';
import { TargetAgent } from '../../interfaces/target-agent';
import { TargetAgentAction } from 'src/app/interfaces/target-agent-action';

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

/**
 * Google ad groups selector component.
 */
export class GoogleAdsSelectorComponent implements AfterViewInit {
  adGroupEnabled = faCircle;
  adGroupDisabled = faCirclePause;
  adGroups: AdGroup[] = [];
  displayedColumns: string[] = ['id', 'name', 'campaignName', 'type', 'status'];
  selectedRows = new Set<AdGroup>();
  dataSource = new MatTableDataSource<any>(this.adGroups);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  /**
   * Constructor: Http client gets injected.
   *
   * @param {HttpClient} http Http client
   */
  constructor(private http: HttpClient) {}

  // eslint-disable-next-line require-jsdoc
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Fetch Google ads data to display
   */
  ngOnInit(): void {
    this.fetchAccountData();
  }

  /**
   * Handles select row click event.
   *
   * @param {AdGroup} r clicked row
   */
  selectRow(r: AdGroup) {
    if (this.selectedRows.has(r)) {
      this.selectedRows.delete(r);
    } else {
      this.selectedRows.add(r);
    }
    const targetAgentActions = this.transformToActions(this.selectedRows);
    store.addTarget(targetAgentActions);

    // Update save requirements
    const valid = this.selectedRows.size > 0;
    store.saveRequirements.next({
      ...store.saveRequirements.value,
      ...{ target: valid },
    });
  }

  /**
   * Transforms user selection into a TargetAgent object.
   *
   * @param { Set<AdGroup> } userSelection
   * @returns { TargetAgent } TargetAgent Object
   */
  private transformToActions(userSelection: Set<AdGroup>): TargetAgent {
    const actions: TargetAgentAction[] = [];
    userSelection.forEach((row: AdGroup) => {
      const a = {
        type: 'activate',
        params: [
          {
            key: 'entityId',
            value: row.id,
          },
        ],
      };
      actions.push(a);
    });
    return {
      agentId: 'googleads-agent',
      actions: actions,
    };
  }

  /**
   * Fetch Google Ads account data.
   */
  private fetchAccountData() {
    this.http
      .get<AdGroup[]>(
        `${environment.apiUrl}/agents/googleads-agent/list/adgroups`
      )
      .pipe(map((res: AdGroup[]) => res))
      .subscribe((adGroups) => {
        this.adGroups = adGroups;
        this.dataSource.data = this.adGroups;
        this.dataSource.paginator = this.paginator;
      });
  }
}
