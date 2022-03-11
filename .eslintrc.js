// This is a workaround for https://github.com/eslint/eslint/issues/3458
require('eslint-config-etherpad/patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: 'etherpad/plugin',
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es6: true,
    jquery: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  // rules: {
  //   'quotes': [
  //     'error',
  //     'single',
  //     { avoidEscape: true, allowTemplateLiterals: true },
  //   ],
  //   'strict': ['error', 'global'],
  //   'spaced-comment': ['error', 'always'],
  //   'semi': ['error', 'always'],
  //   'semi-spacing': ['error', { before: false, after: true }],
  //   'no-extra-semi': 'error',
  //   'no-unexpected-multiline': 'error',
  //   'max-len': ['error', { code: 90 }],
  //   'comma-style': ['error', 'last'],
  //   'comma-dangle': ['error', 'always-multiline'],
  //   'indent': ['error', 2],
  //   'space-infix-ops': 'error',
  //   'brace-style': 'error',
  //   'space-before-blocks': 'error',
  //   'keyword-spacing': 'error',
  //   'arrow-spacing': 'error',
  //   'space-before-function-paren': [
  //     'error',
  //     { anonymous: 'always', named: 'never', asyncArrow: 'always' },
  //   ],
  //   'newline-per-chained-call': 'error',
  //   'space-in-parens': ['error', 'never'],
  //   'array-bracket-spacing': ['error', 'never'],
  //   'object-curly-spacing': ['error', 'always'],
  //   'comma-spacing': ['error', { before: false, after: true }],
  //   'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
  //   'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
  //   'no-alert': 2,
  // },
};
