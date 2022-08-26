import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AgentsDescription } from '../interfaces/api';
import { TargetEntityResponse } from '../interfaces/target';
import { store } from '../store';

@Injectable({ providedIn: 'root' })
/**
 * Central agent management.
 */
export class AgentsService {
  /**
   * Constructor.
   * @param {HttpClient} http injected
   */
  constructor(private readonly http: HttpClient) {}

  /**
   * Fetches the metadata for all available agents.
   */
  fetchAgentsMetadata() {
    const url = `${environment.apiUrl}/agents/metadata`;
    this.http.get<AgentsDescription>(url).subscribe((agentsMetadata) => {
      store.agents.next(agentsMetadata);
      store.agents.complete();
    });
  }

  /**
   * Fetches a list of target entities.
   * @param {string} agentId the agent ID
   * @param {string} type entity type
   * @param {Record<string, string>} parameters
   * @returns {Observable<TargetEntity[]>} a list of target entities
   */
  fetchTargetEntities(
    agentId: string,
    type: string,
    parameters: Record<string, string>
  ) {
    const url = `${environment.apiUrl}/agents/${agentId}/list/${type}`;
    return this.http
      .get<TargetEntityResponse>(url, { params: parameters })
      .pipe(
        map((response) => {
          if (response.status === 'failed') {
            throw new Error(response.error ?? 'Unknown error');
          }
          return response.entities!;
        })
      );
  }
}
