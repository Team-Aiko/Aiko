module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: ['plugin:react/recommended', 'airbnb'],
    parser: 'babel-eslint',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['react'],
    rules: {
        indent: ['error', 4],
        'no-unused-vars': 'warn',
        'prettier/prettier': ['error', {endOfLine: 'auto'}],
        'no-console': 'off',
        'func-names': 'off',
        'object-shorthand': 'off',
        'class-methods-use-this': 'off',
        'max-len': ['error', 120, 2],
        'no-underscore-dangle': 'off',
        'max-classes-per-file': 'off',
        'object-curly-spacing': 'off',
    },
};
