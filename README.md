<!--
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
 -->

# If This Then Ad

[![build](https://img.shields.io/badge/build-passing-brightgreen?style=flat&logo=github)](https://github.com/google/if-this-then-ad)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/google/if-this-then-ad?label=release&logo=github)](https://github.com/google/if-this-then-ad)
[![GitHub last commit](https://img.shields.io/github/last-commit/google/if-this-then-ad)](https://github.com/google/if-this-then-ad/commits)

## Setup

1. Create an [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)

1. Make it of type "**External**"

1. Add all users you want to have access to the app

1. Create an [OAuth Client ID](https://console.cloud.google.com/apis/credentials/oauthclient)

1. Set Application type to "**Web application**"

1. Set the name to "**if-this-then-ad**"

1. Take note of the **Client ID** and **Client Secret** presented to you

1. Click the big blue button to deploy:

   [![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run)

1. Choose the Google Cloud Project where you want to deploy the app

1. Select the region where you want to deploy

1. Enter your Client ID and Client Secret when prompted

1. Ignore any other prompts, which will get auto-populated

## Development

### Git: Pre commit

To do all the checks before the commit automatically please add the [git/pre-commit](git/pre-commit) to your `.git/hooks/` directory. The easiest way would be to create a soft link: `cd .git/hooks/; ln -sf ../../git/pre-commit`.

To run all checks manually you can execute the following code from the project root:

- For server: `cd server; npm run pre-commit`.
- For client: `cd client; npm run pre-commit`.
