# If This Then Ad - Ads Scripts Extension

This extension is meant to be used if you don't have a Google Ads Developer Token (yet).

## Setup

1. Make a copy of the [Google Sheets Template](https://docs.google.com/spreadsheets/d/1EKcPGQ1Vr6LyyQYeYE0-T2gPzNhemVTxsvpSNC5arhE) and fill it out as you normally would with one important difference:

   - Ad IDs parsed by Ads Script need to be in the format: `<AdGroup ID>,<Ad ID>` instead of only the Ad ID

1. Create a new Script in the Google Ads account that you want to control

1. Create new script files for each of the `*.js` files inside of `external/ads-script/` (when naming the files, omit the `.js` since Ads Scripts files are automatically extended with `*.gs`)

1. Copy and paste the content of each respective file

1. In `config.gs` set the ID of your Rules Sheet

1. You may run the Ads Script manually or via schedule

