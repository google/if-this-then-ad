// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

/**
 * @fileoverview extends If This Then Ad (IFTTA) to work with video campaigns
 * in Google Ads, by executing the mutations via this Ads Script.
 * At the time of writing the Google Ads API doesn't allow you to mutate video
 * campaigns, but this is possible through Ads Script. This Ads Script will read
 * the activation formula column and pause/enable based on the true/false value.
 * This version is set up to work only with a new target identifier type of:
 * `VIDEO_AD_GROUP_ID`.
 * To use this script update the rules to use VIDEO_AD_GROUP_ID, and configure
 * the constants at the top of this file.
 * @version 1.0.0
 */

// Set to true if you're going to run this in the MCC account, else false if the
// child Google Ads account.
const RUN_FROM_MCC = true;
// The URL of the Google Sheet containing the rules.
const GOOGLE_SHEET_URL = '';
// The name of the Sheet to open.
const GOOGLE_SHEET_NAME = 'Rules';

/**
 * The entry point for the Ads Script.
 */
function main() {
  const sheet = getGoogleSheetWithRules();
  const rules = getRulesFromSheet(sheet);
  const headerMap = buildHeaderMap(sheet);
  processRules(rules, headerMap);
}

/**
 * Retrieves the Google Sheet containing the rules.
 * 
 * @returns {!Spreadsheet} The Google Sheet object representing the rules sheet.
 */
function getGoogleSheetWithRules() {
  const spreadsheet = SpreadsheetApp.openByUrl(GOOGLE_SHEET_URL);
  return spreadsheet.getSheetByName(GOOGLE_SHEET_NAME);
}

/**
 * Extracts the rules from the provided Google Sheet.
 * 
 * @param {!Spreadsheet} sheet The Google Sheet object containing the rules.
 * @returns {!Array<!Array<string>>} A 2D array representing the rules data,
 * where each inner array represents a single rule.
 */
function getRulesFromSheet(sheet) {
  // Skip the header row
  const dataRange = sheet.getRange(
    2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
  return dataRange.getValues();
}

/**
 * Finds the column index corresponding to a given header name in the sheet.
 * 
 * @param {!Spreadsheet} sheet The Google Sheet object.
 * @param {string} headerName The name of the header to search for.
 * @returns {number} The index of the column containing the specified header.
 */
function getColumnIndexByHeader(sheet, headerName) {
  const headerValues = sheet.getRange(
    1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Case-insensitive comparison for flexibility
  const columnIndex = headerValues.findIndex(header => 
    header.toString().toLowerCase() === headerName.toLowerCase()
  );

  if (columnIndex === -1) {
    throw new Error('Error: Column header "' + headerName + '" not found.');
  }

  return columnIndex;
}

/**
 * Builds a map of column indices based on header names.
 * 
 * @param {!Spreadsheet} sheet The Google Sheet object.
 * @returns {!Object} A map where keys are header names and values are
 * corresponding column indices.
 */
function buildHeaderMap(sheet) {
  return {
    'Activation Formula': getColumnIndexByHeader(sheet, 'Activation Formula'),
    'Rule Name': getColumnIndexByHeader(sheet, 'Rule Name'),
    'Target Agent': getColumnIndexByHeader(sheet, 'Target Agent'),
    'Target Identifier Type': getColumnIndexByHeader(sheet,
      'Target Identifier Type'),
    'Target Identifier': getColumnIndexByHeader(sheet, 'Target Identifier'),
    'Customer ID': getColumnIndexByHeader(sheet, 'target:customerId')
  };
}

/**
 * Processes the rules extracted from the Google Sheet.
 * 
 * This function iterates through each rule and performs the necessary actions
 * based on the rule's activation formula and target information.
 * 
 * @param {!Array<!Array<string>>} rules The 2D array representing the rules
 *  data.
 * @param {!Object} headerMap A map of column indices based on header names.
 */
function processRules(rules, headerMap) {
  for (const rule of rules) {
    if (rule[headerMap['Target Agent']] === 'Google Ads') {
      const targetIdentifierType = rule[headerMap['Target Identifier Type']];
      const targetIdentifier = rule[headerMap['Target Identifier']];
      const activationFormula = rule[headerMap['Activation Formula']];
      const ruleName = rule[headerMap['Rule Name']];
      const customerId = rule[headerMap['Customer ID']];

      Logger.log(
        'Processing rule: "' + ruleName +
        '" for target identifier: "' + targetIdentifier +
        '" with target identifier type: "' + targetIdentifierType +
        '" with activation formula: "' + activationFormula +
        '" for customer ID: "' +  customerId +
        '"');

      switch (targetIdentifierType) {
        case 'VIDEO_AD_GROUP_ID':
          mutateVideoAdGroup(targetIdentifier, activationFormula, customerId);
          break;

        default:
          Logger.log(
            'Unsupported target identifier type: ' + targetIdentifierType);
          break;
      }
    }
  }
}

/**
 * Mutates a video ad group based on the provided activation formula.
 * 
 * This function retrieves the video ad group using the provided ad group ID,
 * and then enables or pauses it based on the activation formula.
 * 
 * @param {string} adGroupId The ID of the video ad group to mutate.
 * @param {string} activationFormula The activation formula, which should be
 * either 'true' or 'false'.
 * @param {string} customerId The CID in Google Ads for the ad group
 */
function mutateVideoAdGroup(adGroupId, activationFormula, customerId) {
  Logger.log('Mutating video ad group with ID: ' + adGroupId);

  if (RUN_FROM_MCC) {
    const account = MccApp.accounts().withIds([customerId]).get().next();
    MccApp.select(account);
  }

  const videoAdGroupIterator = AdWordsApp.videoAdGroups()
    .withIds([adGroupId])
    .get();
  if (videoAdGroupIterator.hasNext()) {
    const videoAdGroup =videoAdGroupIterator.next();
    if (activationFormula === 'true' || activationFormula === true) {
      videoAdGroup.enable();
    } else if (activationFormula === 'false' || activationFormula === false) {
      videoAdGroup.pause();
    } else {
      Logger.log('Unknown activation formula: ' + activationFormula);
    }
  } else {
    Logger.log('Video Ad Group with ID ' + adGroupId + ' not found.');
  }
}
