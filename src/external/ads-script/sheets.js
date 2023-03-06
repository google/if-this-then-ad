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

class SheetsService {
  constructor(spreadsheetId) {
    this.spreadsheet_ = SpreadsheetApp.openById(spreadsheetId);
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
  getRangeData(sheetName, startRow, startCol, numRows = 0, numCols = 0) {
    const sheet = this.getSpreadsheet().getSheetByName(sheetName);

    // Return empty result if no rows
    if (numRows + sheet.getLastRow() - startRow + 1 === 0) {
      console.log('nope');
      return [[]];
    }

    console.log(
      sheetName,
      startRow,
      startCol,
      numRows,
      numCols,
      sheet.getLastRow() - startRow + 1,
      sheet.getLastColumn() - startCol + 1
    );

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
  getCellValue(sheetName, row, col) {
    const sheet = this.getSpreadsheet().getSheetByName(sheetName);
    const cell = sheet.getRange(row, col);

    return cell.getValue();
  }

  /**
   * Returns the initialized {@link SpreadsheetApp.Spreadsheet} reference.
   *
   * @return {?SpreadsheetApp.Spreadsheet} The spreadsheet
   */
  getSpreadsheet() {
    return this.spreadsheet_;
  }
}
