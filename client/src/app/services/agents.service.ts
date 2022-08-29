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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AgentsMetadata } from '../interfaces/api';
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
    this.http.get<AgentsMetadata>(url).subscribe((agentsMetadata) => {
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
