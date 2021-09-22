module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: ['prettier', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'prettier'],
    rules: {
        indent: ['error', 4],
        'no-unused-vars': 'warn',
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        'no-console': 'off',
        'func-names': 'off',
        'object-shorthand': 'off',
        'class-methods-use-this': 'off',
        'max-len': ['error', 120, 2],
        'no-underscore-dangle': 'off',
        'max-classes-per-file': 'off',
    },
};
