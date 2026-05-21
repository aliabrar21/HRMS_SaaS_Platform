module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    projectService: true,
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  ignorePatterns: ['dist', 'build', 'node_modules'],
};
