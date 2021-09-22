module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: ['prettier', 'eslint:recommended', 'plugin:react/recommended', 'airbnb'],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['react', 'prettier'],
    rules: {
        indent: ['error', 4],
        'no-unused-vars': 'warn',
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        'react/jsx-indent': ['error', 4],
        'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
        'no-console': 'off',
        'func-names': 'off',
        'object-shorthand': 'off',
        'class-methods-use-this': 'off',
        'max-len': ['error', 120, 2],
        'no-underscore-dangle': 'off',
        'max-classes-per-file': 'off',
    },
};
