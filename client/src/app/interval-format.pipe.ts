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
