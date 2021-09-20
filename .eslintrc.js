module.exports = {
    'env': {
        "browser": true,
        "es2021": true,
        "node": true
    },
    'extends': [
        "eslint:recommended",
        'airbnb',
        "prettier",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "prettier"
    ],
    "rules": {
        quotes: ["error", "single"],
        'no-unused-vars': 'warn',
        'prettier/prettier': 'error',
        'no-console': 'off',
        'func-names': 'off',
        'object-shorthand': 'off',
        'class-methods-use-this': 'off',
    }
};
