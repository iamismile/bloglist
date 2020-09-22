module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'comma-dangle': ['error', 'only-multiline'],
  },
};
