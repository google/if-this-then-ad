import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringReplace',
})
/**
 * String replace Pipe
 */
export class StringReplacePipe implements PipeTransform {
  /**
   * Replaces a given character in a string
   * @param { string } value Original value
   * @param { string } match Characters to match
   * @param { string } replacement Replacement String / char
   * @returns { string } replaced string.
   */
  transform(value: string, match: string, replacement: string): string {
    return value.split(match).join(replacement);
  }
}
