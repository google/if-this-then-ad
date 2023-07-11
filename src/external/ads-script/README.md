<!--
Copyright 2023 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
# If This Then Ad - Ads Scripts Extension

This extension is meant to be used if you don't have a Google Ads Developer Token or are not using Google Cloud (yet).

## Setup

1. Make a copy of the [Google Sheets Template](https://docs.google.com/spreadsheets/d/1EKcPGQ1Vr6LyyQYeYE0-T2gPzNhemVTxsvpSNC5arhE) and fill it out as you normally would with one important difference:

   - Ad IDs parsed by Ads Script need to be in the format: `<AdGroup ID>,<Ad ID>` instead of only the Ad ID

1. Create a new Script in the Google Ads account that you want to control

1. Create new script files for each of the `*.js` files inside of `external/ads-script/` (when naming the files, omit the `.js` since Ads Scripts files are automatically extended with `*.gs`)

1. Copy and paste the content of each respective file

1. In `config.gs` set the ID of your Rules Sheet

1. You may run the Ads Script manually or via schedule

