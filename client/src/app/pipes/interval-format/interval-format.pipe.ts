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

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intervalFormat',
})

/**
 * Pipe to format rule interval.
 */
export class IntervalFormatPipe implements PipeTransform {
  /**
   * Format interval to 'min' and 'hrs' respectively.
   *
   * @param {number} minutes
   * @returns {string}
   */
  transform(minutes: number, ...args: unknown[]): string {
    if (minutes <= 60) {
      return `${minutes} min`;
    } else {
      return `${minutes / 60} hrs`;
    }
  }
}
