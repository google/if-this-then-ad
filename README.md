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

## Development

### Git: Pre commit
To do all the checks before the commit automatically please add the [git/pre-commit](git/pre-commit) to your `.git/hooks/` directory. The easiest way would be to create a soft link: `cd .git/hooks/; ln -sf ../../git/pre-commit`.

To run all checks manually you can execute the following code from the project root:
- For server: `cd server; npm run pre-commit`.
- For client: `cd client; npm run pre-commit`.
