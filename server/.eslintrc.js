module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'google',
    'prettier',
    'plugin:@typescript-eslint/eslint-recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 13,
  },
  plugins: ['@typescript-eslint', 'prettier'],
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
