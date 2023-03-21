/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @type {?SheetsService} */
let sheetsService;

/**
 * Parse all rules in the feed and, according to mode,
 * fetches data from API and/or syncs state with target, respectively.
 */
function main() {
  // Get all rows from the sheet
  const rows = getSheetsService().getRangeData(CONFIG.rules.sheetName, 2, 1);

  if (rows.length === 0) {
    return;
  }

  // Handle every row
  rows.forEach((row, index) => {
    console.log(`Processing row ${index + 1}`);

    const ads = new GoogleAds();
    let status = '';

    try {
      if (row[CONFIG.rules.cols.targetAgent] !== 'Google Ads') return;

      console.log('Synchronizing...');
      const evaluation = getSheetsService().getCellValue(
        CONFIG.rules.sheetName,
        index + 1 + CONFIG.rules.startRow,
        CONFIG.rules.cols.activationFormula + 1
      );

      if (evaluation === '') return;

      ads.process(
        row[CONFIG.rules.cols.targetId],
        row[CONFIG.rules.cols.targetIdType],
        evaluation
      );

      status = `Synchronized`;

      // Update timestamp
      getSheetsService().setCellValue(
        index + CONFIG.rules.startRow + 1,
        CONFIG.rules.cols.lastUpdate + 1,
        String(Date.now()),
        CONFIG.rules.sheetName
      );
    } catch (err) {
      console.log('Error:', err);
    }
  });

  console.log('Done.');
}

/**
 * Returns the SheetsService instance, initializing it if it does not exist yet.
 *
 * @return {!SheetsService} The initialized SheetsService instance
 */
function getSheetsService() {
  if (sheetsService == null) {
    sheetsService = new SheetsService(CONFIG.spreadsheetId);
  }

  return sheetsService;
}
