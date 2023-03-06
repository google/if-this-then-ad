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
