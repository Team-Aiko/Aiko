module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },

    extends: ['eslint:recommended', 'plugin:react/recommended', 'airbnb', 'prettier'],

    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['react', 'prettier'],
    rules: {
        'no-unused-vars': 'warn',
        'prettier/prettier': 'error',
        'no-console': 'off',
        'func-names': 'off',
        'object-shorthand': 'off',
        'class-methods-use-this': 'off',
    },
};
