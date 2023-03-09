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

module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: ['standard-with-typescript', 'google', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    'valid-jsdoc': [
      2,
      {
        prefer: {
          return: 'returns',
        },
        requireReturnDescription: false,
        requireParamDescription: false,
        requireReturn: false,
      },
    ],
    'new-cap': 'off',
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: true,
        trailingComma: 'es5',
      },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
