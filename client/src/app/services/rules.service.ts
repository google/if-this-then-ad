import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ModelSpec } from '../interfaces/common';
import { Comparator, Rule } from '../interfaces/rule';
import { store } from '../store';
import { UserService } from './user.service';

const COMPARATOR_LABELS: Record<Comparator, string> = {
  eq: 'Equals',
  gt: 'Greater than',
  lt: 'Less than',
};

@Injectable({ providedIn: 'root' })
/**
 * Central rule management.
 */
export class RulesService {
  /**
   * Constructor.
   * @param {HttpClient} http injected
   * @param {UserService} userService injected
   */
  constructor(
    private readonly http: HttpClient,
    private readonly userService: UserService
  ) {}

  /**
   * Fetches the rules for the current user.
   */
  fetchRulesForCurrentUser() {
    const user = this.userService.loggedInUser;
    const url = `${environment.apiUrl}/rules/user/${user.id}`;
    this.http.get<Rule[]>(url).subscribe((rules) => {
      store.rules.next(rules);
    });
  }

  /**
   * Inserts a new rule.
   * @param {ModelSpec<Rule>} ruleData the rule data to insert.
   */
  addRule(ruleData: ModelSpec<Rule>) {
    const url = `${environment.apiUrl}/rules`;
    this.http.post(url, ruleData).subscribe(() => {
      this.fetchRulesForCurrentUser();
    });
  }

  /**
   * Deletes a rule.
   * @param {string} id the ID of the rule to delete
   */
  deleteRule(id: string) {
    const user = this.userService.loggedInUser;
    const url = `${environment.apiUrl}/rules/${user.id}/${id}`;
    this.http.delete(url).subscribe(() => {
      // reload rules after delete.
      this.fetchRulesForCurrentUser();
    });
  }

  /**
   * Returns the human-readable comparator name.
   * @param {Comparator} comparator the comparator
   * @returns {string} the human-readable comparator name
   */
  getComparatorLabel(comparator: Comparator) {
    return COMPARATOR_LABELS[comparator];
  }
}
