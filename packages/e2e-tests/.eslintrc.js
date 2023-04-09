module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  plugins: ['no-only-tests', '@typescript-eslint', 'cypress'],
  env: {
    node: true,
    mocha: true,
    es6: true,
    'cypress/globals': true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'no-only-tests/no-only-tests': 'error',
    'no-console': 1,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/ban-types': 0,
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
        overrides: {
          constructors: 'no-public',
        },
      },
    ],
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
        classes: false,
      },
    ],
    'prefer-promise-reject-errors': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: 'logger',
      },
    ],
    'max-len': ['error', { code: 160 }],
    '@typescript-eslint/no-floating-promises': ['error'],
    'require-await': 'error',
    '@typescript-eslint/await-thenable': 'error',
  },
};
