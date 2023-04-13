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

import { CONFIG, GLOBALCTX } from './config';
import { ApiHelper } from './helpers/api';
import { DynamicColumnHeaders } from './helpers/dynamic-column-headers';
import { JPath } from './helpers/jpath';
import { SheetsService } from './helpers/sheets';
import { Utils } from './helpers/utils';
import { TargetAgent } from './target-agents/base';
import { AVAILABLE_AGENTS } from './target-agents/index';

enum MODE {
  FETCH = 0,
  SYNC = 1,
  FETCH_AND_SYNC = 2,
}

/** @type {?SheetsService} */
let sheetsService: SheetsService;

/** @type {Record<string, TargetAgent>} */
const targetAgents: Record<string, TargetAgent> = {};

/**
 * Add custom menu item into the Spreadsheet menu.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('IFTTA')
    .addItem('Setup', 'setup')
    .addItem('Fetch', 'fetch')
    .addItem('Sync', 'sync')
    .addItem('FetchAndSync', 'fetchAndSync')
    .addItem('Validate', 'validate')
    .addToUi();
}

/**
 * Set spreadsheetId to Script Properties.
 * This is required because when running 'headless' (e.g. via a trigger),
 * the SpreadsheetApp.getActiveSpreadsheet() method returns null.
 */
function setup() {
  const ssId = SpreadsheetApp.getActiveSpreadsheet().getId();
  PropertiesService.getScriptProperties().setProperty('spreadsheetId', ssId);
}

/**
 * Call main() with mode 'FETCH'.
 */
function fetch() {
  main(MODE.FETCH);
}

/**
 * Call main() with mode 'SYNC'.
 */
function sync() {
  main(MODE.SYNC);
}

/**
 * Call main() with mode 'FETCH_AND_SYNC'.
 */
function fetchAndSync() {
  main(MODE.FETCH_AND_SYNC);
}

/**
 * Parse all rules in the feed and, according to mode,
 * fetches data from API and/or syncs state with target, respectively.
 *
 * @param {string} mode
 */
function main(mode: MODE) {
  // Get all rows from the sheet
  const rows = getSheetsService().getRangeData(CONFIG.rules.sheetName, 1, 1);

  if (rows.length === 0) {
    return;
  }

  // Extract and parse column headers
  const columnHeaders = rows.shift() as string[];
  const columnHeaderHelper = new DynamicColumnHeaders(columnHeaders);

  const apiHelper = new ApiHelper();

  // Handle every row
  rows.forEach((row: string[], index: number) => {
    console.log(`Processing row ${index + 1}/${rows.length}`);

    // Check if update is due
    const lastUpdate = Number(row[CONFIG.rules.cols.lastUpdate]);
    const updateInterval = Number(row[CONFIG.rules.cols.updateInterval]);
    let status = '';

    if (
      updateInterval > 0 &&
      Date.now() < lastUpdate + updateInterval * 3600 * 1000
    ) {
      console.log('Update not due.');
      return;
    }

    try {
      // Fetch
      if (mode === MODE.FETCH || mode === MODE.FETCH_AND_SYNC) {
        console.log('Fetching data from API...');

        const sourceParams = columnHeaderHelper.getMappedValues(
          row,
          CONFIG.sourceNamespace
        );

        for (const group in sourceParams) {
          const source = sourceParams[group];

          const res = apiHelper.callApi(
            source.url,
            source.headers,
            source.params
          );

          row = updateRowWithResultData(columnHeaders, row, res, group);

          const resultsHeaderStartCol =
            columnHeaderHelper.getFirstColWithNamespace(CONFIG.resultNamespace);

          const results = row.slice(resultsHeaderStartCol);

          getSheetsService().setValuesInDefinedRange(
            CONFIG.rules.sheetName,
            index + CONFIG.rules.startRow + 1,
            resultsHeaderStartCol + 1,
            [results]
          );

          status = `Fetched (${Utils.getCurrentDateString()})`;
        }
      }

      // Sync
      if (mode === MODE.SYNC || mode === MODE.FETCH_AND_SYNC) {
        console.log('Synchronizing...');
        const evaluation = getSheetsService().getCellValue(
          CONFIG.rules.sheetName,
          index + 1 + CONFIG.rules.startRow,
          CONFIG.rules.cols.activationFormula + 1
        );

        if (evaluation === '') return;

        const params = columnHeaderHelper.getMappedValues(
          row,
          CONFIG.targetNamespace,
          false
        );

        const targetAgent = getTargetAgent(row[CONFIG.rules.cols.targetAgent]);

        targetAgent.process(
          row[CONFIG.rules.cols.targetId],
          row[CONFIG.rules.cols.targetIdType],
          evaluation,
          params
        );

        status = `Synchronized (${Utils.getCurrentDateString()})`;

        // Update timestamp
        getSheetsService().setCellValue(
          index + CONFIG.rules.startRow + 1,
          CONFIG.rules.cols.lastUpdate + 1,
          String(Date.now()),
          CONFIG.rules.sheetName
        );
      }
    } catch (err) {
      status = `Error (${Utils.getCurrentDateString()}): ${err}`;
    } finally {
      // Update status
      getSheetsService().setCellValue(
        index + CONFIG.rules.startRow + 1,
        CONFIG.rules.cols.status + 1,
        status,
        CONFIG.rules.sheetName
      );
    }
  });
}

/**
 * Validate that the Sheet and target entities are in sync.
 */
function validate() {
  let errors: string[] = [];

  // Get all rows from the sheet
  const rows = getSheetsService().getRangeData(CONFIG.rules.sheetName, 1, 1);

  // Extract and parse column headers
  const columnHeaders = rows.shift() as string[];
  const columnHeaderHelper = new DynamicColumnHeaders(columnHeaders);

  // Handle every row
  rows.forEach((row: string[], index: number) => {
    console.log(`Validating row ${index + 1}/${rows.length}`);
    try {
      const evaluation = getSheetsService().getCellValue(
        CONFIG.rules.sheetName,
        index + CONFIG.rules.startRow + 1,
        CONFIG.rules.cols.activationFormula + 1
      );

      if (evaluation === '') return;

      const params = columnHeaderHelper.getMappedValues(
        row,
        CONFIG.targetNamespace,
        false
      );

      errors = errors.concat(
        getTargetAgent(row[CONFIG.rules.cols.targetAgent]).validate(
          row[CONFIG.rules.cols.targetId],
          row[CONFIG.rules.cols.targetIdType],
          evaluation,
          params
        )
      );
    } catch (err) {
      errors.push(JSON.stringify((err as Error).message));
    }
  });

  // Log results
  console.log();
  console.log('### Validation Results ###');
  console.log(`Valid rows: ${rows.length - errors.length}/${rows.length}`);

  if (errors.length) {
    console.log();
    console.log('Result details:');

    errors.forEach(error => console.log(error));
  }
}

/**
 * Update row with data from API according to path in header.
 *
 * @param {string[]} headers
 * @param {string[]} row
 * @param {Object} data
 * @param {string} group
 * @returns {string}
 */
function updateRowWithResultData(
  headers: string[],
  row: string[],
  data: Object,
  group: string
) {
  row = row.map((cell, index) => {
    const exp = new RegExp(
      `^${CONFIG.resultNamespace}(?:\\.${group})*${DynamicColumnHeaders.namespaceSeparator}`
    );

    if (exp.test(headers[index])) {
      const path = headers[index].split(
        DynamicColumnHeaders.namespaceSeparator
      )[1];

      if (path.startsWith('!CUSTOM')) {
        const functionName = path.split('.')[1];

        if (GLOBALCTX && GLOBALCTX[functionName]) {
          const columnHeaderHelper = new DynamicColumnHeaders(headers);

          const customParams = columnHeaderHelper.getMappedValues(
            row,
            functionName,
            false
          );

          // Update cell value using custom function
          return (GLOBALCTX as any)[functionName](data, customParams);
        }
      } else {
        // Update cell value from result using JPath
        return JPath.getValue(path, data);
      }
    }

    // Leave cell value untouched
    return cell;
  });

  return row;
}

/**
 * Dynamically ('lazy') load and return target agent instances.
 * This is done to avoid ReferenceErrors on direct access due to wrong file order
 *
 * @param {string} targetName
 * @returns {TargetAgent}
 * @throws {Error}
 */
function getTargetAgent(agentName: string) {
  if (agentName in targetAgents) {
    return targetAgents[agentName];
  }

  const agent = AVAILABLE_AGENTS.find(
    agent => agent.friendlyName === agentName
  );

  if (!agent) {
    throw new Error(`Unknown target agent: '${agentName}'`);
  }

  targetAgents[agentName] = agent.getInstance();

  return targetAgents[agentName];
}

/**
 * Return the SheetsService instance, initializing it if it does not exist yet.
 *
 * @returns {!SheetsService} The initialized SheetsService instance
 */
function getSheetsService() {
  if (sheetsService === undefined) {
    const spreadsheetId = CONFIG.spreadsheetId || undefined;
    sheetsService = new SheetsService(spreadsheetId);
  }

  return sheetsService;
}
