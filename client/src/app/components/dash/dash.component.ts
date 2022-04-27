import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Rule } from 'src/app/models/rule.model';
import { User } from 'src/app/models/user.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss'],
})
/**
 * Dash Component
 */
export class DashComponent implements OnInit {
  displayName: string;
  user: User;
  rules: Rule[];
  activeRules: number = 0;
  inactiveRules: number = 0;
  errorRules: number = 0;
  adsManaged: number = 420;
  /**
   * Constructor
   * @param {AuthService} authService AuthService
   */
  constructor(private authService: AuthService, private http: HttpClient) { }

  /**
   * Init
   */
  ngOnInit(): void {
    this.displayName = this.authService.currentUser?.displayName!;
    this.user = this.authService.currentUser!;
    this.loadRules();
  }

  // TODO: centralise all data fetching into one service 
  // use caching to prevent hitting the api unnecessarily.
  /**
   * Fetch all rules for logged in user.
   */
  loadRules() {
    this.http
      .get<Array<Rule>>(`${environment.apiUrl}/rules/user/${this.user?.id}`)
      .pipe(map((res: Array<Rule>) => res))
      .subscribe((result) => {
        this.rules = result;
        this.calculateStats(this.rules);
      });
  }

  /**
   * Calculates statics to display on the dashboard
   * @param {Rule[]} rules
   */
  calculateStats(rules: Rule[]) {
    rules.forEach(r => {
      this.activeRules += 1;
      if (!r.status?.success) {
        this.errorRules += 1;
      }
    });
  }
}
