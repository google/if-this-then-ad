/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Helper class to wrap calls to Sheets API.
 * Sheets API Read/Write usually works faster then reading and writing from/to
 * spreadsheet directly.
 */
export class SheetsService {
  defaultMode: string;
<<<<<<< HEAD
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
=======
  spreadsheet_: GoogleAppsScript.Spreadsheet.Spreadsheet;
>>>>>>> 1a33360 (Built IFTTA v2)

  /**
   * Constructor.
   *
   * @param {string} spreadsheetId
   */
  constructor(spreadsheetId?: string) {
    let spreadsheet;

    if (spreadsheetId) {
      try {
        spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      } catch (e) {
        console.error(e);
        throw new Error(
          `Unable to identify spreadsheet with provided ID: ${spreadsheetId}!`
        );
      }
    } else {
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    }

    /** @private @const {?SpreadsheetApp.Spreadsheet} */
<<<<<<< HEAD
    this.spreadsheet = spreadsheet;
=======
    this.spreadsheet_ = spreadsheet;
>>>>>>> 1a33360 (Built IFTTA v2)

    /** @type {string} */
    this.defaultMode = 'FORMULA';
  }

  /**
   * Writes the given values in the specified sheet and range.
   *
   * @param {string} sheetName The name of the sheet
   * @param {number} row The range's start row
   * @param {number} col The range's start col
   * @param {?Array<?Array<string|number|undefined>>} values The values to write
   */
  setValuesInDefinedRange(
    sheetName: string,
    row: number,
    col: number,
    values: Array<Array<string | number | undefined>>
  ) {
    const sheet = this.getSpreadsheet().getSheetByName(sheetName);

    if (!sheet) return;

    if (values[0]) {
      sheet
        .getRange(row, col, values.length, values[0].length)
        .setValues(values);
    }
  }

  /**
   * Retrieves data from the underlying spreadsheet using the provided range
   * parameters and sheet name.
   *
   * @param {string} sheetName The name of the sheet
   * @param {number} startRow The range's start row
   * @param {number} startCol The range's start column
   * @param {number=} numRows Optional number of rows to retrieve. Defaults to
   *     all available rows
   * @param {number=} numCols Optional number of columns to retrieve. Defaults
   *     to all available columns
   * @return {?Array<?Array<?Object>>} The data found at the specified range
   */
  getRangeData(
    sheetName: string,
    startRow: number,
    startCol: number,
    numRows = 0,
    numCols = 0
  ) {
    const sheet = this.getSpreadsheet().getSheetByName(sheetName);

    // Return empty result if no rows
    if (!sheet || numRows + sheet.getLastRow() - startRow + 1 === 0) {
      return [[]];
    }

    return sheet
      .getRange(
        startRow,
        startCol,
        numRows || sheet.getLastRow() - startRow + 1,
        numCols || sheet.getLastColumn() - startCol + 1
      )
      .getValues();
  }

  /**
   * Retrieves a cell's value by the given parameters.
   *
   * @param {string} sheetName The name of the sheet
   * @param {number} row The row identifier
   * @param {number} col The column identifier
   * @return {?Object} The value of the cell
   */
  getCellValue(sheetName: string, row: number, col: number) {
    const sheet = this.getSpreadsheet().getSheetByName(sheetName);

    return sheet ? sheet.getRange(row, col).getValue() : null;
  }

  /**
   * Sets a cell's value by the given parameters.
   *
   * @param {number} row The row identifier
   * @param {number} col The column identifier
   * @param {string} val The value to set
   * @param {?string=} sheetName The name of the sheet to use. Uses the
   *     sheet the user currently has open (active sheet) if not given
   */
  setCellValue(row: number, col: number, val: string, sheetName?: string) {
    const sheet = sheetName
      ? this.getSpreadsheet().getSheetByName(sheetName)
      : this.getSpreadsheet().getActiveSheet();

    if (!sheet) return;

    sheet.getRange(row, col).setValue(val);
  }

  /**
   * Spreadsheet API has quota of requests per minute, so each next retry will
   *  be done after this wait time. Wait time will be increased progressively.
   *
   * @param {number} i Current number of retries
   * @returns {number} Number of seconds
   */
  getWaitTimeInSeconds(i: number) {
    return (i > 3 ? 10 : 5) * (i + 1);
  }

  /**
   * Returns the initialized {@link SpreadsheetApp.Spreadsheet} reference.
   *
   * @return {?SpreadsheetApp.Spreadsheet} The spreadsheet
   */
  getSpreadsheet() {
<<<<<<< HEAD
    return this.spreadsheet;
=======
    return this.spreadsheet_;
>>>>>>> 1a33360 (Built IFTTA v2)
  }
}
