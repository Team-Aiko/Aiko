module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint-config-prettier',
        'prettier',
        'eslint:recommended',
        'plugin:react/recommended',
        'airbnb',
        'eslint-config-airbnb',
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['react', 'prettier'],
    rules: {
        indent: ['error', 4, { SwitchCase: 1 }],
        'prettier/prettier': ['error', { singleQuote: true, endOfLine: 'auto' }],
        'no-unused-vars': 'warn',
        'react/jsx-indent': ['error', 4],
        'jsx-quotes': ['error', 'prefer-single'],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
        'react/forbid-prop-types': ['error', { forbid: [], checkContextTypes: true, checkChildContextTypes: true }],
        'no-console': 'off',
        'func-names': 'off',
        'object-shorthand': 'off',
        'class-methods-use-this': 'off',
        'max-len': ['error', 120, 2],
        'no-underscore-dangle': 'off',
        'max-classes-per-file': 'off',
        'object-curly-newline': [
            'off',
            {
                ObjectExpression: 'always',
                ObjectPattern: { multiline: true },
                ImportDeclaration: 'never',
                ExportDeclaration: { multiline: true, minProperties: 3 },
            },
        ],
    },
};
